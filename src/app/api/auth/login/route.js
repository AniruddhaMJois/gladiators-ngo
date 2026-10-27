import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { gcId, pin, role } = await request.json();

    if (!gcId || !pin || !role) {
      return NextResponse.json({ message: 'Please provide GC-ID, PIN, and role.' }, { status: 400 });
    }

    const doc = await db.collection('users').doc(gcId.toUpperCase()).get();

    if (!doc.exists) {
      return NextResponse.json({ message: 'User not found or role mismatch.' }, { status: 404 });
    }

    const user = doc.data();

    if (user.role !== role) {
      return NextResponse.json({ message: 'User not found or role mismatch.' }, { status: 404 });
    }

    if (user.pin !== pin) {
      return NextResponse.json({ message: 'Invalid PIN.' }, { status: 401 });
    }

    const userObj = { ...user, _id: doc.id, gcId: doc.id };

    return NextResponse.json({
      message: 'Login successful',
      user: userObj
    }, { status: 200 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'Server error during login.' }, { status: 500 });
  }
}
