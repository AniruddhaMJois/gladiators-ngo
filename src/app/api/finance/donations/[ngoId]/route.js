import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { ngoId } = params;
    const snapshot = await db.collection('donations').where('ngoId', '==', ngoId).get();
    const donations = [];
    snapshot.forEach(doc => donations.push({ ...doc.data(), _id: doc.id }));
    donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(donations, { status: 200 });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json({ error: 'Error fetching donations' }, { status: 500 });
  }
}
