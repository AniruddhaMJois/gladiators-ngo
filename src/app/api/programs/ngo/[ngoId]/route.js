import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { ngoId } = params;
    const snapshot = await db.collection('programs').where('ngoId', '==', ngoId).get();
    const programs = [];

    for (const doc of snapshot.docs) {
      let p = doc.data();
      p._id = doc.id;

      const appsSnap = await db.collection('applications')
        .where('programId', '==', p._id)
        .where('status', '==', 'Approved')
        .get();
      p.volunteerCount = appsSnap.size;

      programs.push(p);
    }

    programs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(programs, { status: 200 });
  } catch (error) {
    console.error('Error fetching NGO programs:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
