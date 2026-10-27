import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { gcId } = params;
    const doc = await db.collection('users').doc(gcId).get();

    if (!doc.exists) return NextResponse.json({ message: 'Volunteer not found' }, { status: 404 });

    const data = doc.data();
    const volunteer = {
      _id: doc.id,
      name: data.name,
      profilePhoto: data.profilePhoto,
      location: data.location,
      interests: data.interests,
      age: data.age
    };

    return NextResponse.json(volunteer, { status: 200 });
  } catch (error) {
    console.error('Error fetching volunteer public profile:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
