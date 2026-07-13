import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Missing idToken' }, { status: 400 });
    }

    // Xác minh tính hợp lệ của ID Token để đảm bảo bảo mật
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Sinh Custom Token cho Desktop App
    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({ success: true, customToken });
  } catch (error: any) {
    console.error('Lỗi khi tạo Custom Token:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
