import * as admin from 'firebase-admin';

// Initialize firebase admin
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "";
let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountKey);
} catch (e) {
  console.error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format.");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://webapptool-d9e7e-default-rtdb.asia-southeast1.firebasedatabase.app'
  });
}

const db = admin.database();

async function check() {
  const uid = "Xoaw0vm2fzQi3f0NFb9ifajF4ds2";
  const snap = await db.ref(`users/${uid}`).once('value');
  if (snap.exists()) {
    console.log("RTDB for user:", snap.val());
  } else {
    console.log("RTDB entry not found for user.");
  }
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
