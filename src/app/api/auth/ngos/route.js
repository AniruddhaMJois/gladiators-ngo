import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const snapshot = await db.collection('users').where('role', '==', 'ngo').get();
    const ngos = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      delete data.pin;
      ngos.push({ ...data, _id: doc.id, gcId: doc.id });
    });
    return NextResponse.json(ngos, { status: 200 });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    return NextResponse.json({ message: 'Server error fetching NGOs.' }, { status: 500 });
  }
}
