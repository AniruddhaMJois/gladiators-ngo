import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { userId } = params;

    const sentSnap = await db.collection('messages').where('senderId', '==', userId).get();
    const receivedSnap = await db.collection('messages').where('receiverId', '==', userId).get();

    const contactIds = new Set();
    sentSnap.forEach(doc => {
      const data = doc.data();
      if (data.receiverId) contactIds.add(data.receiverId);
    });

    receivedSnap.forEach(doc => {
      const data = doc.data();
      if (data.senderId) contactIds.add(data.senderId);
    });

    const allNgos = await db.collection('users').where('role', '==', 'ngo').get();
    allNgos.forEach(ngo => contactIds.add(ngo.id));

    contactIds.delete(userId);

    const contacts = [];
    const contactIdsArray = Array.from(contactIds);

    for (const id of contactIdsArray) {
      const doc = await db.collection('users').doc(id).get();
      if (doc.exists) {
        const data = doc.data();
        contacts.push({
          _id: doc.id,
          gcId: doc.id,
          name: data.name,
          profilePhoto: data.profilePhoto,
          domain: data.domain,
          headquarters: data.headquarters,
          email: data.email,
          role: data.role
        });
      }
    }

    contacts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ message: 'Server error fetching contacts.' }, { status: 500 });
  }
}
