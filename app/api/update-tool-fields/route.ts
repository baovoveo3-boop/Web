import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const batch = adminFirestore.batch();
    
    // Update ban-content
    const banRef = adminFirestore.collection('products').doc('ban-content');
    batch.set(banRef, {
      req_tier: 1,
      exec_file: 'BanContent_Tool.py'
    }, { merge: true });

    // Update healing-bird
    const healingRef = adminFirestore.collection('products').doc('healing-bird');
    batch.set(healingRef, {
      req_tier: 1,
      exec_file: 'HealingBird_Tool.py'
    }, { merge: true });

    await batch.commit();

    return NextResponse.json({ success: true, message: 'Updated req_tier and exec_file.' });
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
