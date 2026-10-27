import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { ngoId } = params;

    const appsSnapshot = await db.collection('applications')
      .where('ngoId', '==', ngoId)
      .where('status', '==', 'Approved')
      .get();
    const volunteers = appsSnapshot.size;

    const activeSnapshot = await db.collection('programs')
      .where('ngoId', '==', ngoId)
      .where('status', '==', 'Active')
      .get();
    const activeCampaigns = activeSnapshot.size;

    const completedSnapshot = await db.collection('programs')
      .where('ngoId', '==', ngoId)
      .where('status', '==', 'Completed')
      .get();

    const cancelledSnapshot = await db.collection('programs')
      .where('ngoId', '==', ngoId)
      .where('status', '==', 'Cancelled')
      .get();

    const endedCampaigns = completedSnapshot.size + cancelledSnapshot.size;
    const campaigns = activeCampaigns + endedCampaigns;

    let hours = 0;
    completedSnapshot.forEach(doc => {
      const prog = doc.data();
      hours += (prog.hours || 0);
    });

    return NextResponse.json({ volunteers, campaigns, activeCampaigns, endedCampaigns, hours }, { status: 200 });
  } catch (error) {
    console.error('Error fetching NGO stats:', error);
    return NextResponse.json({ error: 'Server error while fetching NGO stats' }, { status: 500 });
  }
}
