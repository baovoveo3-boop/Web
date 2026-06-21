import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Định nghĩa cấu hình Firebase lấy từ biến môi trường
// Các biến này phải bắt đầu bằng NEXT_PUBLIC_ để Next.js có thể mang xuống Frontend
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Khởi tạo Firebase App
// Kiểm tra xem app đã khởi tạo chưa để tránh lỗi khởi tạo nhiều lần trong Next.js (do HMR/SSR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo các dịch vụ cơ bản
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
