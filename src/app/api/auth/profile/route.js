import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function PUT(request) {
  try {
    const { gcId, updatedData } = await request.json();

    if (!gcId) {
      return NextResponse.json({ message: 'GC-ID is required for profile update.' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(gcId.toUpperCase());
    const doc = await userRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    await userRef.update(updatedData);
    const updatedDoc = await userRef.get();

    const userObj = { ...updatedDoc.data(), _id: updatedDoc.id, gcId: updatedDoc.id };

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userObj
    }, { status: 200 });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ message: 'Server error during profile update.' }, { status: 500 });
  }
}
