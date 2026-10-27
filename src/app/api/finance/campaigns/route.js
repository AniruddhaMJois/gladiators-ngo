import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { ngoId, title, description, targetAmount, endDate } = await request.json();
    if (!ngoId) return NextResponse.json({ error: 'ngoId is required' }, { status: 400 });

    const newCampaign = {
      ngoId,
      title,
      description,
      targetAmount,
      endDate,
      status: 'Active',
      raisedAmount: 0,
      hasFinanceReport: false,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('programs').add(newCampaign);
    return NextResponse.json({ ...newCampaign, _id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Error creating campaign' }, { status: 500 });
  }
}
