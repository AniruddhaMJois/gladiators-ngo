import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

// GET /api/chat/messages?senderId=...&receiverId=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get('senderId');
    const receiverId = searchParams.get('receiverId');

    if (!senderId || !receiverId) {
      return NextResponse.json({ message: 'Both senderId and receiverId are required.' }, { status: 400 });
    }

    const snap1 = await db.collection('messages')
      .where('senderId', '==', senderId)
      .where('receiverId', '==', receiverId)
      .get();

    const snap2 = await db.collection('messages')
      .where('senderId', '==', receiverId)
      .where('receiverId', '==', senderId)
      .get();

    const messages = [];
    snap1.forEach(doc => messages.push({ ...doc.data(), _id: doc.id }));
    snap2.forEach(doc => messages.push({ ...doc.data(), _id: doc.id }));

    messages.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ message: 'Server error fetching messages.' }, { status: 500 });
  }
}

// POST /api/chat/messages
export async function POST(request) {
  try {
    const { senderId, receiverId, content } = await request.json();

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ message: 'senderId, receiverId, and content are required.' }, { status: 400 });
    }

    const newMessage = {
      senderId,
      receiverId,
      content,
      read: false,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('messages').add(newMessage);
    return NextResponse.json({ ...newMessage, _id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json({ message: 'Server error saving message.' }, { status: 500 });
  }
}
