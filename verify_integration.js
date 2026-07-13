const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const crypto = require('crypto');

// Load environment variables
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

// Check key env variables
const checkEnv = [
  'FIREBASE_PROJECT_ID', 
  'FIREBASE_CLIENT_EMAIL', 
  'FIREBASE_PRIVATE_KEY', 
  'PAYOS_CLIENT_ID', 
  'PAYOS_API_KEY', 
  'PAYOS_CHECKSUM_KEY'
];

checkEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`ERROR: Missing env variable ${key}`);
    process.exit(1);
  }
});

// Initialize firebase-admin
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
  });
}

const firestore = admin.firestore();
const rtdb = admin.database();

// PayOS signature helpers
function sortObjDataByKey(object) {
  const orderedObject = Object.keys(object)
    .sort()
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
  return orderedObject;
}

function convertObjToQueryStr(object) {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value = object[key];
      // Sort nested object
      if (value && Array.isArray(value)) {
        value = JSON.stringify(value.map((val) => sortObjDataByKey(val)));
      }
      // Set empty string if null
      if ([null, undefined, 'undefined', 'null'].includes(value)) {
        value = '';
      }
      return `${key}=${value}`;
    })
    .join('&');
}

function createSignatureFromObj(data, key) {
  const sortedDataByKey = sortObjDataByKey(data);
  const dataQueryStr = convertObjToQueryStr(sortedDataByKey);
  return crypto.createHmac('sha256', key).update(dataQueryStr).digest('hex');
}

// HTTP POST helper
function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const bodyStr = JSON.stringify(data);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function waitSeconds(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.request(url, { method: 'GET', timeout: 1000 }, (res) => {
          resolve(true);
        });
        req.on('error', reject);
        req.end();
      });
      console.log('Server is ready!');
      return;
    } catch (e) {
      await waitSeconds(0.5);
    }
  }
  throw new Error('Server start timed out');
}

async function runTests() {
  const userId = `test_user_${Date.now()}`;
  const orderCode = Number(String(Date.now()).slice(-9));

  console.log(`Starting tests with userId: ${userId}, orderCode: ${orderCode}`);

  // 1. Mock user in Firestore
  const userRef = firestore.collection('users').doc(userId);
  await userRef.set({
    walletBalance: 0,
    createdAt: new Date().toISOString()
  });
  console.log(`Mocked user in Firestore.`);

  // 2. Mock transaction in Firestore (state !== SUCCESS, amount = 100000, toolId = 'ban-content')
  const txRef = firestore.collection('transactions').doc(String(orderCode));
  await txRef.set({
    orderCode: orderCode,
    userId: userId,
    amount: 100000,
    status: 'PENDING',
    toolId: 'ban-content',
    createdAt: new Date().toISOString()
  });
  console.log(`Mocked pending transaction in Firestore with toolId: ban-content.`);

  // 3. Invalid signature webhook request
  console.log(`Testing invalid signature webhook...`);
  const invalidPayload = {
    code: "00",
    desc: "success",
    data: {
      orderCode: orderCode,
      amount: 100000,
      description: `NAP ${orderCode}`,
      code: "00",
      desc: "success"
    },
    signature: "invalid_sig_value"
  };

  const invalidRes = await postJson('http://localhost:3001/api/payment/webhook', invalidPayload);
  console.log(`Invalid webhook response status: ${invalidRes.status}, body: ${invalidRes.body}`);

  // Assert rejected (should return HTTP 400 or 401 status, and not success)
  if (invalidRes.status !== 400 && invalidRes.status !== 401) {
    throw new Error(`Expected HTTP 400 or 401 for invalid signature webhook, but got status ${invalidRes.status}`);
  }
  const invalidJson = JSON.parse(invalidRes.body);
  if (invalidJson.success === true && invalidJson.code === "00") {
    throw new Error("Invalid signature webhook was mistakenly accepted!");
  }
  console.log(`PASSED: Invalid signature webhook rejected with status ${invalidRes.status}.`);

  // Verify database was NOT updated
  const txSnap1 = await txRef.get();
  if (txSnap1.data().status === 'SUCCESS') {
    throw new Error("Transaction status incorrectly updated to SUCCESS on invalid signature!");
  }
  const userSnap1 = await userRef.get();
  if (userSnap1.data().walletBalance !== 0) {
    throw new Error("User walletBalance incorrectly updated on invalid signature!");
  }
  console.log(`PASSED: Database verified unchanged for invalid webhook.`);

  // 4. Valid signature webhook request
  console.log(`Testing valid signature webhook...`);
  // Compute valid signature
  const validSignature = createSignatureFromObj(invalidPayload.data, process.env.PAYOS_CHECKSUM_KEY);
  const validPayload = {
    ...invalidPayload,
    signature: validSignature
  };

  const validRes = await postJson('http://localhost:3001/api/payment/webhook', validPayload);
  console.log(`Valid webhook response status: ${validRes.status}, body: ${validRes.body}`);

  const validJson = JSON.parse(validRes.body);
  if (validRes.status !== 200 || validJson.success !== true || validJson.code !== "00") {
    throw new Error("Valid signature webhook failed! Response: " + validRes.body);
  }
  console.log(`PASSED: Valid signature webhook returned HTTP 200, code "00", success true.`);

  // Assert:
  // - The transaction status in Firestore is updated to SUCCESS.
  const txSnap2 = await txRef.get();
  if (txSnap2.data().status !== 'SUCCESS') {
    throw new Error("Transaction status was not updated to SUCCESS!");
  }
  console.log(`PASSED: Transaction status updated to SUCCESS.`);

  // - The user's walletBalance in Firestore is incremented by 100000.
  const userSnap2 = await userRef.get();
  if (userSnap2.data().walletBalance !== 100000) {
    throw new Error(`User walletBalance is ${userSnap2.data().walletBalance}, expected 100000!`);
  }
  console.log(`PASSED: User walletBalance incremented by 100000.`);

  // - The Firebase Realtime Database path users/{userId}/purchased_tools/ban_content is directly updated to true by webhook.
  const webhookRtdbRef = rtdb.ref(`users/${userId}/purchased_tools/ban_content`);
  const webhookRtdbSnap = await webhookRtdbRef.get();
  if (webhookRtdbSnap.val() !== true) {
    throw new Error(`Realtime Database path users/${userId}/purchased_tools/ban_content was not directly activated by webhook! (val: ${webhookRtdbSnap.val()})`);
  }
  console.log(`PASSED: Realtime Database tool activation verified after webhook success.`);

  // Reset RTDB before testing /api/purchase to prevent false positives in next step
  await rtdb.ref(`users/${userId}/purchased_tools`).remove();
  console.log(`PASSED: Realtime Database state reset for step 5.`);

  // 5. Send POST request to /api/purchase to purchase a tool
  console.log(`Testing /api/purchase...`);
  await userRef.update({ walletBalance: 499000 });
  const purchasePayload = {
    userId: userId,
    items: [{ id: "ban-content", name: "Ban Content Tool", price: 499000 }],
    totalAmount: 499000
  };

  const purchaseRes = await postJson('http://localhost:3001/api/purchase', purchasePayload);
  console.log(`Purchase response status: ${purchaseRes.status}, body: ${purchaseRes.body}`);

  const purchaseJson = JSON.parse(purchaseRes.body);
  if (purchaseRes.status !== 200 || purchaseJson.success !== true) {
    throw new Error("Purchase failed! Response: " + purchaseRes.body);
  }
  console.log(`PASSED: Purchase API returned HTTP 200 success.`);

  // Assert database updates:
  // - The user's walletBalance in Firestore is decremented by 499000.
  const userSnap3 = await userRef.get();
  if (userSnap3.data().walletBalance !== 0) {
    throw new Error(`User walletBalance is ${userSnap3.data().walletBalance}, expected 0!`);
  }
  console.log(`PASSED: User walletBalance decremented by 499000.`);

  // - An order document is created in Firestore.
  const ordersSnap = await firestore.collection('orders').where('userId', '==', userId).get();
  if (ordersSnap.empty) {
    throw new Error("No order document created in Firestore!");
  }
  const orderDoc = ordersSnap.docs[0].data();
  if (orderDoc.totalAmount !== 499000 || orderDoc.status !== 'COMPLETED') {
    throw new Error("Order document data mismatch: " + JSON.stringify(orderDoc));
  }
  console.log(`PASSED: Order document created in Firestore with totalAmount 499000.`);

  // - The Firebase Realtime Database path users/{userId}/purchased_tools/ban_content is updated to true.
  const rtdbRef = rtdb.ref(`users/${userId}/purchased_tools/ban_content`);
  const rtdbSnap = await rtdbRef.get();
  if (rtdbSnap.val() !== true) {
    throw new Error(`Realtime Database path users/${userId}/purchased_tools/ban_content is not true (val: ${rtdbSnap.val()})!`);
  }
  console.log(`PASSED: Realtime Database path users/${userId}/purchased_tools/ban_content is true.`);

  // 6. Clean up: delete test database records created during verification
  console.log(`Cleaning up test records...`);
  await txRef.delete();
  await userRef.delete();
  for (const doc of ordersSnap.docs) {
    await doc.ref.delete();
  }
  await rtdb.ref(`users/${userId}`).remove();
  console.log(`PASSED: Database cleanup complete.`);
}

async function main() {
  let serverProcess = null;
  try {
    console.log('Starting Next.js server on port 3001...');
    serverProcess = spawn('npx', ['next', 'dev', '-p', '3001'], {
      cwd: __dirname,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, PORT: '3001' }
    });

    serverProcess.stdout.on('data', (data) => {
      const lines = data.toString().trim();
      if (lines.includes('Ready') || lines.includes('started') || lines.includes('compil')) {
        console.log(`[Next.js stdout]: ${lines}`);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Next.js stderr]: ${data.toString().trim()}`);
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start Next.js process:', err);
    });

    console.log('Waiting for Next.js server to be responsive...');
    await waitForServer('http://localhost:3001');

    await runTests();
    console.log('\n======================================');
    console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('======================================\n');
    process.exitCode = 0;
  } catch (error) {
    console.error('\n======================================');
    console.error('TEST FAILED!');
    console.error(error);
    console.error('======================================\n');
    process.exitCode = 1;
  } finally {
    if (serverProcess) {
      console.log('Stopping Next.js server...');
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t']);
        } else {
          serverProcess.kill('SIGINT');
        }
      } catch (err) {
        console.error('Error stopping server process:', err);
      }
    }
  }
}

main();
