import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function PUT(request) {
  try {
    const { senderId, receiverId } = await request.json();
    if (!senderId || !receiverId) {
      return NextResponse.json({ message: 'senderId and receiverId are required.' }, { status: 400 });
    }

    const snapshot = await db.collection('messages')
      .where('senderId', '==', senderId)
      .where('receiverId', '==', receiverId)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
    return NextResponse.json({ message: 'Messages marked as read.' }, { status: 200 });
  } catch (error) {
    console.error('Error marking messages read:', error);
    return NextResponse.json({ message: 'Server error marking messages read.' }, { status: 500 });
  }
}
