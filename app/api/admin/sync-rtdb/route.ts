import { NextResponse } from 'next/server';
import { adminDatabase, adminFirestore } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, purchasedProducts } = body;

    console.log("SYNC_RTDB: adminDatabase URL is", adminDatabase.app.options.databaseURL);

    if (!uid) {
      return NextResponse.json({ success: false, message: "Missing uid" }, { status: 400 });
    }

    // Identify which tools should be active
    const toolsToActivateSet = new Set<string>();

    if (purchasedProducts && Array.isArray(purchasedProducts)) {
      for (const p of purchasedProducts) {
        if (p.id === 'combo-khoi-nghiep') {
          toolsToActivateSet.add('ban-content');
          toolsToActivateSet.add('tool-seeding-pro');
        } else if (p.id === 'combo-scale-up') {
          toolsToActivateSet.add('ban-content');
          toolsToActivateSet.add('healing-bird');
        } else if (p.id === 'combo-all-in-one') {
          toolsToActivateSet.add('ban-content');
          toolsToActivateSet.add('healing-bird');
          toolsToActivateSet.add('tool-seeding-pro');
        } else {
          toolsToActivateSet.add(p.id);
        }
      }
    }

    // 1. Sync RTDB (try-catch because the RTDB instance may not exist or fails)
    /*
    try {
      const rtdbRef = adminDatabase.ref(`users/${uid}/purchased_tools`);
      const rtdbUpdates: any = {};
      const toolsToActivateArray = Array.from(toolsToActivateSet);

      // Overwrite entirely or set true for current ones.
      // Usually, it's safer to overwrite the entire node if we want to reflect the exact state.
      // But based on old logic, we just set `true`.
      for (const tId of toolsToActivateArray) {
        const rtdbKey = tId.replace(/-/g, '_');
        rtdbUpdates[rtdbKey] = true;
      }

      await rtdbRef.set(rtdbUpdates);
      console.log(`Successfully synced RTDB for user ${uid}. Tools: [${toolsToActivateArray.join(',')}]`);
    } catch (rtdbErr) {
      console.error(`RTDB sync failed (legacy), skipping:`, rtdbErr);
    }
    */

    // 2. Also sync Firestore `licenses` subcollection to ensure consistency
    // Here we can assume the user has the licenses if they are in purchasedProducts
    // If you need strict sync for licenses, you can do it here. 
    // Currently handled in webhook, but good to have fallback.

    return NextResponse.json({ success: true, activatedTools: Array.from(toolsToActivateSet) });

  } catch (error: any) {
    console.error("Failed to sync RTDB:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
