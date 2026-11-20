import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

const checkHardcodedLogin = (gcId, pin, role) => {
  const rawId = String(gcId || '').trim().toUpperCase();
  const rawPin = String(pin || '').trim().toUpperCase();

  const configs = [
    { role: 'ngo', prefix: 'NGO', digit: '1', defaultName: 'Green Life NGO' },
    { role: 'volunteer', prefix: 'VLT', digit: '2', defaultName: 'Volunteer Member' },
    { role: 'company', prefix: 'CPY', digit: '3', defaultName: 'Partner Enterprise' }
  ];

  for (const cfg of configs) {
    if (role !== cfg.role) continue;

    const matchRegex = new RegExp(`^(?:${cfg.prefix})?(${cfg.digit}[0-3X])$`);
    const idMatch = rawId.match(matchRegex);

    if (idMatch) {
      const code = idMatch[1]; // e.g. "10", "11", "12", "13", "1X"
      if (rawPin === code || rawPin === rawId || rawPin === `${cfg.prefix}${code}`) {
        const fullGcId = `${cfg.prefix}${code}`;
        return {
          user: {
            _id: fullGcId,
            gcId: fullGcId,
            role: cfg.role,
            name: `${cfg.defaultName} (${code})`,
            email: `${cfg.role}${code.toLowerCase()}@gladiconnect.org`,
            pin: rawPin,
            ...(cfg.role === 'ngo' ? {
              headquarters: 'Bangalore, India',
              domain: 'Environment & Social Welfare',
              mediaGallery: [],
              interests: ['Environment', 'Education', 'Health'],
            } : cfg.role === 'volunteer' ? {
              age: 22,
              location: 'Bangalore, India',
              interests: ['Environment', 'Education', 'Social Welfare'],
              totalHours: 25,
              badges: ['Bronze', 'Silver'],
            } : {
              headquarters: 'Mumbai, India',
              csrFocus: ['Education', 'Environment', 'Healthcare'],
              cin: 'L27020MH1958PLC011107',
            })
          }
        };
      } else {
        return { error: 'Invalid PIN.' };
      }
    }
  }

  return null;
};

export async function POST(request) {
  try {
    const { gcId, pin, role } = await request.json();

    if (!gcId || !pin || !role) {
      return NextResponse.json({ message: 'Please provide GC-ID, PIN, and role.' }, { status: 400 });
    }

    // Check hardcoded logins first (1x for NGO, 2x for Volunteer, 3x for Company where x = 0,1,2,3 or X)
    const hardcodedCheck = checkHardcodedLogin(gcId, pin, role);
    if (hardcodedCheck) {
      if (hardcodedCheck.error) {
        return NextResponse.json({ message: hardcodedCheck.error }, { status: 401 });
      }
      return NextResponse.json({
        message: 'Login successful',
        user: hardcodedCheck.user
      }, { status: 200 });
    }

    // Fallback to present database users
    const doc = await db.collection('users').doc(gcId.toUpperCase()).get();

    if (!doc.exists) {
      return NextResponse.json({ message: 'User not found or role mismatch.' }, { status: 404 });
    }

    const user = doc.data();

    if (user.role !== role) {
      return NextResponse.json({ message: 'User not found or role mismatch.' }, { status: 404 });
    }

    if (user.pin !== pin) {
      return NextResponse.json({ message: 'Invalid PIN.' }, { status: 401 });
    }

    const userObj = { ...user, _id: doc.id, gcId: doc.id };

    return NextResponse.json({
      message: 'Login successful',
      user: userObj
    }, { status: 200 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'Server error during login.' }, { status: 500 });
  }
}
