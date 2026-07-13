const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const tsPath = path.resolve(__dirname, 'firebase-admin.ts');
const jsPath = path.resolve(__dirname, 'firebase-admin-temp.js');

console.log('Transpiling firebase-admin.ts on the fly...');
const tsCode = fs.readFileSync(tsPath, 'utf8');
const jsCode = ts.transpileModule(tsCode, {
  compilerOptions: { 
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020
  }
}).outputText;

fs.writeFileSync(jsPath, jsCode, 'utf8');

// Back up environment variables
const backupEnv = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
};

// Clear environment variables to simulate unconfigured credentials
delete process.env.FIREBASE_PROJECT_ID;
delete process.env.FIREBASE_CLIENT_EMAIL;
delete process.env.FIREBASE_PRIVATE_KEY;
delete process.env.FIREBASE_DATABASE_URL;

let testPassed = true;
const errors = [];

function assertThrows(fn, expectedSubstr) {
  try {
    fn();
    testPassed = false;
    errors.push(`Expected function to throw, but it succeeded.`);
  } catch (err) {
    if (!err.message.includes(expectedSubstr)) {
      testPassed = false;
      errors.push(`Expected error message to contain "${expectedSubstr}", but got: "${err.message}"`);
    }
  }
}

try {
  console.log('Importing transpiled firebase-admin-temp...');
  // Import the transpiled module
  const adminModule = require('./firebase-admin-temp');
  console.log('Module loaded successfully without compilation/runtime crash.');

  const { adminDb, adminRtdb, adminAuth, adminFirestore, adminDatabase } = adminModule;

  // Test Firestore methods
  console.log('Verifying Firestore mock methods...');
  assertThrows(() => adminDb.collection('users'), 'Cannot call collection() at runtime');
  assertThrows(() => adminDb.doc('users/123'), 'Cannot call doc() at runtime');
  assertThrows(() => adminDb.get(), 'Cannot call get() at runtime');
  assertThrows(() => adminDb.set(), 'Cannot call set() at runtime');
  assertThrows(() => adminDb.update(), 'Cannot call update() at runtime');
  assertThrows(() => adminDb.delete(), 'Cannot call delete() at runtime');
  assertThrows(() => adminDb.where(), 'Cannot call where() at runtime');
  assertThrows(() => adminDb.orderBy(), 'Cannot call orderBy() at runtime');
  assertThrows(() => adminDb.limit(), 'Cannot call limit() at runtime');
  assertThrows(() => adminDb.startAfter(), 'Cannot call startAfter() at runtime');

  // Test Auth methods
  console.log('Verifying Auth mock methods...');
  assertThrows(() => adminAuth.verifyIdToken('token'), 'Cannot call verifyIdToken() at runtime');
  assertThrows(() => adminAuth.createCustomToken('uid'), 'Cannot call createCustomToken() at runtime');

  // Test Realtime Database methods
  console.log('Verifying Realtime Database mock methods...');
  assertThrows(() => adminRtdb.ref('path'), 'Cannot call ref() at runtime');
  assertThrows(() => adminRtdb.child('path'), 'Cannot call child() at runtime');

  // Test Batch operations
  console.log('Verifying Batch operations mock methods...');
  let batch;
  try {
    batch = adminDb.batch();
    console.log('  adminDb.batch() call succeeded as expected.');
  } catch (err) {
    testPassed = false;
    errors.push(`adminDb.batch() threw an error unexpectedly: ${err.message}`);
  }

  if (batch) {
    assertThrows(() => batch.set(), 'Cannot call batch.set() at runtime');
    assertThrows(() => batch.update(), 'Cannot call batch.update() at runtime');
    assertThrows(() => batch.delete(), 'Cannot call batch.delete() at runtime');
    assertThrows(() => batch.commit(), 'Cannot call batch.commit() at runtime');
  }

  // Restore env
  Object.assign(process.env, backupEnv);

} catch (err) {
  testPassed = false;
  errors.push(`Test execution crashed: ${err.stack}`);
} finally {
  // Clean up temp file
  if (fs.existsSync(jsPath)) {
    fs.unlinkSync(jsPath);
  }
}

if (testPassed) {
  console.log('SUCCESS: All Firebase Admin SDK Mock tests passed!');
  process.exit(0);
} else {
  console.error('FAIL: Some tests failed:');
  errors.forEach(err => console.error(` - ${err}`));
  process.exit(1);
}
