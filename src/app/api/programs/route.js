import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

const populateNgo = async (programData) => {
  if (!programData.ngoId) return programData;
  try {
    const ngoDoc = await db.collection('users').doc(programData.ngoId).get();
    if (ngoDoc.exists) {
      const { name, domain, location, profilePhoto, headquarters, about } = ngoDoc.data();
      return { ...programData, ngoId: { _id: ngoDoc.id, name, domain, location, profilePhoto, headquarters, about } };
    }
  } catch (err) {
    console.error('Error populating NGO for program:', err);
  }
  return programData;
};

// GET /api/programs
export async function GET() {
  try {
    const snapshot = await db.collection('programs').where('status', '==', 'Active').get();
    const programs = [];

    for (const doc of snapshot.docs) {
      let p = doc.data();
      p._id = doc.id;
      p = await populateNgo(p);

      const appsSnap = await db.collection('applications')
        .where('programId', '==', p._id)
        .where('status', '==', 'Approved')
        .get();
      p.volunteerCount = appsSnap.size;

      programs.push(p);
    }

    programs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(programs, { status: 200 });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// POST /api/programs
export async function POST(request) {
  try {
    const body = await request.json();
    const { ngoId, title, description, rolesNeeded, location } = body;

    if (!ngoId || !title || !description || !rolesNeeded || !location) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newProgram = {
      ngoId,
      title,
      description,
      rolesNeeded,
      location,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('programs').add(newProgram);
    return NextResponse.json({ ...newProgram, _id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
