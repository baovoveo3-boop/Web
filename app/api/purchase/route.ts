import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, arrayUnion, collection, addDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, items, totalAmount } = body;

    if (!userId || !items || !totalAmount) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    // Lấy thông tin user hiện tại
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ success: false, error: 'Tài khoản không tồn tại' }, { status: 404 });
    }

    const userData = userSnap.data();
    const currentBalance = userData.walletBalance || 0;

    // Kiểm tra số dư
    if (currentBalance < totalAmount) {
      return NextResponse.json({ success: false, error: 'Số dư ví không đủ để thanh toán' }, { status: 400 });
    }

    // Lấy danh sách ID của các món hàng để thêm vào mảng purchasedItems
    const itemIds = items.map((item: any) => item.id);

    // 1. Trừ tiền và thêm lịch sử mua hàng vào User profile
    await updateDoc(userRef, {
      walletBalance: increment(-totalAmount),
      purchasedItems: arrayUnion(...itemIds),
      updatedAt: new Date().toISOString()
    });

    // 2. Ghi log vào bảng orders
    const orderData = {
      userId,
      items: items.map((item: any) => ({ id: item.id, name: item.name, price: item.priceText })),
      totalAmount,
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'orders'), orderData);

    return NextResponse.json({
      success: true,
      message: 'Thanh toán thành công'
    });

  } catch (error: any) {
    console.error('Lỗi thanh toán giỏ hàng:', error);
    return NextResponse.json({
      success: false,
      error: 'Lỗi hệ thống trong quá trình thanh toán'
    }, { status: 500 });
  }
}
