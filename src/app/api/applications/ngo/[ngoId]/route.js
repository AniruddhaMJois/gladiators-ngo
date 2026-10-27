import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { populateVolunteer, populateProgram } from '@/lib/appHelpers';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { ngoId } = params;

    const snapshot = await db.collection('applications').where('ngoId', '==', ngoId).get();
    const applications = [];

    for (const doc of snapshot.docs) {
      let app = doc.data();
      app._id = doc.id;
      app = await populateVolunteer(app);
      app = await populateProgram(app);
      applications.push(app);
    }

    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
