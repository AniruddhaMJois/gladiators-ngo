import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const ngoId = params.id;
    const snapshot = await db.collection('programs').where('ngoId', '==', ngoId).get();
    const campaigns = [];
    snapshot.forEach(doc => campaigns.push({ ...doc.data(), _id: doc.id }));
    campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Error fetching campaigns' }, { status: 500 });
  }
}
