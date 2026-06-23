import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface AdminLog {
  adminUid: string;
  adminEmail: string;
  action: string;
  target: string;
  details: string;
}

export const logAdminAction = async (log: AdminLog) => {
  try {
    await addDoc(collection(db, "admin_logs"), {
      ...log,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Lỗi khi ghi Audit Log:", error);
  }
};
