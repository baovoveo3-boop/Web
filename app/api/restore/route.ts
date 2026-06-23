import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function GET(req: Request) {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    
    let updatedCount = 0;
    for (const d of snapshot.docs) {
      await updateDoc(doc(db, 'users', d.id), {
        role: 'super_admin',
        walletBalance: 100000000 // 100 triệu
      });
      updatedCount++;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Đã khôi phục quyền Admin và 100M VND cho ${updatedCount} tài khoản! Bạn có thể quay lại trang chủ.` 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
