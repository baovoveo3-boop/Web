const admin = require("firebase-admin");
const serviceAccount = require("./firebase_admin_key.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function fix() {
  try {
    await db.collection("products").doc("huong-dan-ban-content-automation").update({
      imageUrl: "/circuit-bg.jpg"
    });
    await db.collection("products").doc("tool-tao-anh-google-flow").update({
      imageUrl: "/circuit-bg.jpg"
    });
    console.log("Fixed images to circuit-bg.jpg");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fix();
