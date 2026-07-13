import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);

async function check() {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", "haibt102@gmail.com"));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log("User not found");
    process.exit(1);
  }

  const userDoc = querySnapshot.docs[0];
  const uid = userDoc.id;
  const userData = userDoc.data();
  
  console.log("=== FIRESTORE USER DOC ===");
  console.log("UID:", uid);
  console.log("Data:", JSON.stringify(userData, null, 2));

  console.log("\n=== FIRESTORE LICENSES ===");
  const licensesRef = collection(db, "users", uid, "licenses");
  const licensesSnap = await getDocs(licensesRef);
  licensesSnap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });

  console.log("\n=== REALTIME DATABASE ===");
  const rtdbRef = ref(rtdb, `users/${uid}`);
  const rtdbSnap = await get(rtdbRef);
  if (rtdbSnap.exists()) {
    console.log(JSON.stringify(rtdbSnap.val(), null, 2));
  } else {
    console.log("No RTDB data for user");
  }

  process.exit(0);
}

check().catch(console.error);
