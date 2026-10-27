import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const receiverId = searchParams.get('receiverId');
    if (!receiverId) return NextResponse.json({ message: 'receiverId is required.' }, { status: 400 });

    const snapshot = await db.collection('messages')
      .where('receiverId', '==', receiverId)
      .where('read', '==', false)
      .get();

    const countsMap = {};
    snapshot.forEach(doc => {
      const senderId = doc.data().senderId;
      if (senderId) {
        countsMap[senderId] = (countsMap[senderId] || 0) + 1;
      }
    });

    return NextResponse.json(countsMap, { status: 200 });
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    return NextResponse.json({ message: 'Server error fetching unread counts.' }, { status: 500 });
  }
}
