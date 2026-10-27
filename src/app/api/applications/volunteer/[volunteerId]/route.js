import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { populateProgram, populateNgo } from '@/lib/appHelpers';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { volunteerId } = params;
    const snapshot = await db.collection('applications').where('volunteerId', '==', volunteerId).get();

    const applications = [];
    for (const doc of snapshot.docs) {
      let app = doc.data();
      app._id = doc.id;
      app = await populateProgram(app);
      app = await populateNgo(app);
      applications.push(app);
    }

    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error('Error fetching volunteer applications:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
