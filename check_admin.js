const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDRDh_C3iKQKZEECEX8EiY-aPPFuAGCdJM",
  authDomain: "webapptool-d9e7e.firebaseapp.com",
  projectId: "webapptool-d9e7e",
  storageBucket: "webapptool-d9e7e.firebasestorage.app",
  messagingSenderId: "1042474691689",
  appId: "1:1042474691689:web:3c5bbe28d4a588771a46f8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setAdmin() {
  try {
    const userRef = doc(db, 'users', 'lzO7CeAVdWdnEZiAbvoE1ZXAZdk2');
    await updateDoc(userRef, { role: 'admin' });
    console.log("Successfully updated baovommo@gmail.com to ADMIN!");
  } catch (error) {
    console.error("Error updating:", error);
  }
}

setAdmin();
