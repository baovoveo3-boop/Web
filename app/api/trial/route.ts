import { NextResponse } from 'next/server';
import { adminDatabase, adminFirestore } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, toolId } = body;

    if (!userId || !toolId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userRef = adminFirestore.collection('users').doc(userId);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has this tool
    const licenseRef = userRef.collection('licenses').doc(toolId);
    const licenseSnap = await licenseRef.get();
    
    if (licenseSnap.exists) {
      return NextResponse.json({ error: 'Bạn đã sở hữu hoặc đang dùng thử công cụ này rồi.' }, { status: 400 });
    }

    // Grant 3-day trial
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const expiresAt = d.toISOString();

    const batch = adminFirestore.batch();
    
    batch.set(licenseRef, {
      itemId: toolId,
      status: 'trial',
      expiresAt: expiresAt,
      activatedAt: new Date().toISOString()
    });

    await batch.commit();

    // Update RTDB
    try {
      const toolKey = toolId.replace(/-/g, '_');
      const rtdbRef = adminDatabase.ref(`users/${userId}/purchased_tools`);
      await rtdbRef.update({
        [toolKey]: true
      });
    } catch (e) {
      console.error('Trial RTDB error:', e);
    }

    return NextResponse.json({ success: true, message: 'Kích hoạt dùng thử thành công!' });
  } catch (error: any) {
    console.error('Trial activation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
