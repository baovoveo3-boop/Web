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
    const docRef = db.collection("products").doc("tool-tao-anh-google-flow");
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      let howToUse = docSnap.data().howToUse || [];
      // Insert new instruction at index 2
      howToUse.splice(2, 0, "Lưu ý: Khi mở link, Google sẽ hiện bảng cảnh báo an toàn (This app is from another user). Đây là bảo mật mặc định của Google Flow. Bạn chỉ cần bấm nút trắng 'Try in a project' để tiếp tục.");
      
      await docRef.update({ howToUse });
      console.log("Updated howToUse");
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fix();
