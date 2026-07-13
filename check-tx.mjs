import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  // Find user by UID
  const userRef = doc(db, "users", "Lpw1osirFxaTxChvxQWQrBRd4mm1");
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    console.log("User:", userSnap.data());
  } else {
    console.log("User Lpw1osirFxaTxChvxQWQrBRd4mm1 not found.");
  }

  // Get licenses subcollection
  const licensesRef = collection(db, "users", "Lpw1osirFxaTxChvxQWQrBRd4mm1", "licenses");
  const licensesSnap = await getDocs(licensesRef);
  licensesSnap.forEach(doc => {
    console.log("License:", doc.id, doc.data());
  });

  process.exit(0);
}

check();
