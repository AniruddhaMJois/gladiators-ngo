import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

const generateGcId = async (role) => {
  const prefix = role === 'volunteer' ? 'VLT' : role === 'ngo' ? 'NGO' : 'CPY';
  let isUnique = false;
  let newId = '';

  while (!isUnique) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    newId = `${prefix}${randomDigits}`;
    const docRef = await db.collection('users').doc(newId).get();
    if (!docRef.exists) {
      isUnique = true;
    }
  }
  return newId;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { role, ...userData } = body;

    // Basic validation
    if (!role || !['volunteer', 'ngo', 'company'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role provided.' }, { status: 400 });
    }

    // Role-specific constraints
    if (role === 'volunteer' && !userData.aadhaar) {
      return NextResponse.json({ message: 'Aadhaar is required for volunteers.' }, { status: 400 });
    }
    if (role === 'ngo' && !userData.ngoDarpanId) {
      return NextResponse.json({ message: 'NGO Darpan ID is required for NGOs.' }, { status: 400 });
    }
    if (role === 'company' && !userData.cin) {
      return NextResponse.json({ message: 'CIN is required for companies.' }, { status: 400 });
    }

    const gcId = await generateGcId(role);

    const newUser = {
      role,
      ...userData,
      createdAt: new Date().toISOString()
    };

    await db.collection('users').doc(gcId).set(newUser);

    const userObj = { ...newUser, _id: gcId, gcId };

    return NextResponse.json({
      message: 'User registered successfully',
      user: userObj
    }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Server error during registration.', error: error.message }, { status: 500 });
  }
}
