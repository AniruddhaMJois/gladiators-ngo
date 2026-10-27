import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { userId } = params;
    const snapshot = await db.collection('messages').where('receiverId', '==', userId).get();

    const messages = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      let senderInfo = null;
      if (data.senderId) {
        const senderDoc = await db.collection('users').doc(data.senderId).get();
        if (senderDoc.exists) {
          senderInfo = { _id: senderDoc.id, name: senderDoc.data().name, profilePhoto: senderDoc.data().profilePhoto };
        }
      }
      messages.push({ ...data, _id: doc.id, senderId: senderInfo || data.senderId });
    }

    messages.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Error fetching inbox messages:', error);
    return NextResponse.json({ message: 'Server error fetching inbox messages.' }, { status: 500 });
  }
}
