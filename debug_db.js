const admin = require('firebase-admin');
const serviceAccount = require('./firebase_admin_key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
db.collection('products').get().then(snap => {
  snap.forEach(doc => {
    console.log(doc.id, ' | ', doc.data().name, ' | ', doc.data().category, ' | ', doc.data().type);
  });
}).catch(console.error);
