import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  let credentialConfig: any = null;
  let detectedProjectId = projectId;

  if (projectId && clientEmail && privateKey) {
    credentialConfig = admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });
  } else {
    // Attempt local file fallback
    const pathsToTry = [
      path.resolve(process.cwd(), 'firebase_admin_key.json'),
      path.resolve(process.cwd(), '../firebase_admin_key.json')
    ];

    for (const keyPath of pathsToTry) {
      if (fs.existsSync(keyPath)) {
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
          credentialConfig = admin.credential.cert(serviceAccount);
          detectedProjectId = serviceAccount.project_id;
          console.log(`Initialized Firebase Admin using local credentials file: ${keyPath}`);
          break;
        } catch (err) {
          console.error(`Failed to parse local credentials file at ${keyPath}:`, err);
        }
      }
    }
  }

  if (!credentialConfig) {
    console.warn("Firebase Admin credentials not found. Returning dummy object to prevent build crash.");
    const throwConfigError = (methodName: string) => () => {
      throw new Error(`Firebase Admin SDK credentials not configured. Cannot call ${methodName}() at runtime.`);
    };
    const dummyMock: any = {
      collection: throwConfigError('collection'),
      doc: throwConfigError('doc'),
      get: throwConfigError('get'),
      set: throwConfigError('set'),
      update: throwConfigError('update'),
      delete: throwConfigError('delete'),
      where: throwConfigError('where'),
      orderBy: throwConfigError('orderBy'),
      limit: throwConfigError('limit'),
      startAfter: throwConfigError('startAfter'),
      verifyIdToken: throwConfigError('verifyIdToken'),
      createCustomToken: throwConfigError('createCustomToken'),
      ref: throwConfigError('ref'),
      child: throwConfigError('child'),
      batch: () => ({
        set: throwConfigError('batch.set'),
        update: throwConfigError('batch.update'),
        delete: throwConfigError('batch.delete'),
        commit: throwConfigError('batch.commit'),
      }),
    };
    return {
      firestore: () => dummyMock,
      database: () => dummyMock,
      auth: () => dummyMock,
    } as any;
  }

  const finalProjectId = detectedProjectId || 'webapptool-d9e7e';
  const databaseURL = process.env.FIREBASE_DATABASE_URL || `https://${finalProjectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;

  return admin.initializeApp({
    credential: credentialConfig,
    databaseURL: databaseURL,
  });
}

const adminApp = getFirebaseAdmin();
export const adminDb = adminApp.firestore();
export const adminRtdb = adminApp.database();
export const adminAuth = adminApp.auth();
export const adminFirestore = adminDb;
export const adminDatabase = adminRtdb;

export default adminApp;
