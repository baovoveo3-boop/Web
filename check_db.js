const admin = require("firebase-admin");
const serviceAccount = require("./firebase_admin_key.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function check() {
  const snap = await db.collection("products").where("category", "in", ["free", "miễn phí"]).get();
  snap.forEach(doc => {
    console.log("=== Product:", doc.id, "===");
    console.log(JSON.stringify(doc.data(), null, 2));
  });
}

check();
