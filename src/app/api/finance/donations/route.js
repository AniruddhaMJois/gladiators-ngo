import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { ngoId, donorId, campaignId, amount, donorName } = await request.json();
    if (!ngoId || !donorId || !amount) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const newDonation = {
      ngoId,
      donorId,
      campaignId,
      amount,
      donorName,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('donations').add(newDonation);

    if (campaignId) {
      const campaignRef = db.collection('programs').doc(campaignId);
      const campaignDoc = await campaignRef.get();
      if (campaignDoc.exists) {
        await campaignRef.update({ raisedAmount: (campaignDoc.data().raisedAmount || 0) + Number(amount) });
      }
    }

    return NextResponse.json({ ...newDonation, _id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error logging donation:', error);
    return NextResponse.json({ error: 'Error logging donation' }, { status: 500 });
  }
}
