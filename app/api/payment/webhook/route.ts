import { NextResponse } from 'next/server';
import { PayOS } from '@payos/node';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    if (!process.env.PAYOS_CLIENT_ID) {
      console.error('PayOS keys not loaded in webhook');
      return NextResponse.json({ success: false, code: "99" });
    }

    const payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY || '',
      checksumKey: process.env.PAYOS_CHECKSUM_KEY || ''
    });

    const body = await req.json();
    
    // PayOS requires webhook endpoints to respond with a specific success body
    // First, verify the webhook data using Checksum
    const webhookData = await payos.webhooks.verify(body);

    if (webhookData) {
      const orderCode = webhookData.orderCode;
      
      // Fetch transaction from Firebase
      const txRef = doc(db, 'transactions', String(orderCode));
      const txSnap = await getDoc(txRef);
      
      if (txSnap.exists()) {
        const txData = txSnap.data();
        
        // Prevent double processing
        if (txData.status !== 'SUCCESS') {
          // 1. Mark transaction as SUCCESS
          await updateDoc(txRef, {
            status: 'SUCCESS',
            updatedAt: new Date().toISOString()
          });

          // 2. Add funds to User's Wallet
          const userId = txData.userId;
          const amount = txData.amount;
          
          if (userId && amount) {
            const userRef = doc(db, 'users', userId);
            
            // Increment the user's wallet balance
            await updateDoc(userRef, {
              walletBalance: increment(amount)
            });
            console.log(`Successfully added ${amount} to user ${userId}'s wallet.`);
          }
        }
      }
    }

    // PayOS requires this exact JSON response
    return NextResponse.json({
      success: true,
      code: "00",
      data: null
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Even if error, return success false to let PayOS know we received it but failed
    return NextResponse.json({
      success: false,
      code: "99",
      data: null
    });
  }
}
