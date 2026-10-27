import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

// POST /api/applications
export async function POST(request) {
  try {
    const { programId, ngoId, volunteerId, roleApplied } = await request.json();

    if (!programId || !ngoId || !volunteerId || !roleApplied) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if already applied
    const existingSnap = await db.collection('applications')
      .where('programId', '==', programId)
      .where('volunteerId', '==', volunteerId)
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json({ message: 'You have already applied for this program' }, { status: 400 });
    }

    const newApp = {
      programId,
      ngoId,
      volunteerId,
      roleApplied,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('applications').add(newApp);
    return NextResponse.json({ ...newApp, _id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
