import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { userId } = params;
    const snapshot = await db.collection('messages')
      .where('receiverId', '==', userId)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
    return NextResponse.json({ message: 'Inbox messages marked as read.' }, { status: 200 });
  } catch (error) {
    console.error('Error marking inbox read:', error);
    return NextResponse.json({ message: 'Server error marking inbox read.' }, { status: 500 });
  }
}
