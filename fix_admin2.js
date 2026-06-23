const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');

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

async function fixAdmin() {
  try {
    const q = query(collection(db, 'users'), where('email', '==', 'baovommo@gmail.com'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("User not found!");
      return;
    }

    querySnapshot.forEach(async (document) => {
      const userRef = doc(db, 'users', document.id);
      await updateDoc(userRef, { role: 'super_admin' });
      console.log(`Updated ${document.id} to super_admin!`);
    });
  } catch (error) {
    console.error("Error updating:", error);
  }
}

fixAdmin();
