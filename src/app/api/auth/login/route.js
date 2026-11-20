import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

const ROLE_CONFIGS = {
  ngo: { prefix: 'NGO', digit: '1' },
  volunteer: { prefix: 'VLT', digit: '2' },
  company: { prefix: 'CPY', digit: '3' }
};

// Fallback known profiles in case database query is unreachable
const FALLBACK_PROFILES = {
  ngo: [
    { _id: 'NGO332831', gcId: 'NGO332831', role: 'ngo', name: 'ABCD NGO', email: 'abcdngo@gladiconnect.org' },
    { _id: 'NGO673525', gcId: 'NGO673525', role: 'ngo', name: 'UVWX NGO', email: 'uvwxngo@gladiconnect.org' }
  ],
  volunteer: [
    { _id: 'VLT407203', gcId: 'VLT407203', role: 'volunteer', name: 'Anish' },
    { _id: 'VLT419915', gcId: 'VLT419915', role: 'volunteer', name: 'Ananya Y K' },
    { _id: 'VLT477222', gcId: 'VLT477222', role: 'volunteer', name: 'Abhilash' },
    { _id: 'VLT756051', gcId: 'VLT756051', role: 'volunteer', name: 'Aniruddha' },
    { _id: 'VLT839781', gcId: 'VLT839781', role: 'volunteer', name: 'Akul' },
    { _id: 'VLT948201', gcId: 'VLT948201', role: 'volunteer', name: 'Abhiram' },
    { _id: 'VLT993217', gcId: 'VLT993217', role: 'volunteer', name: 'ertymujklfghjk' }
  ],
  company: [
    { _id: 'CPY107513', gcId: 'CPY107513', role: 'company', name: 'PQRS Group of Companies' }
  ]
};

async function getRoleProfiles(role) {
  try {
    const snap = await db.collection('users').where('role', '==', role).get();
    if (!snap.empty) {
      const docs = snap.docs.map(d => ({ _id: d.id, gcId: d.id, ...d.data() }));
      docs.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return a.gcId.localeCompare(b.gcId);
      });
      return docs;
    }
  } catch (err) {
    console.warn(`Failed to fetch ${role} profiles from Firestore:`, err.message);
  }
  return FALLBACK_PROFILES[role] || [];
}

export async function POST(request) {
  try {
    const { gcId, pin, role } = await request.json();

    if (!gcId || !pin || !role) {
      return NextResponse.json({ message: 'Please provide GC-ID, PIN, and role.' }, { status: 400 });
    }

    const config = ROLE_CONFIGS[role];
    if (!config) {
      return NextResponse.json({ message: 'Invalid role.' }, { status: 400 });
    }

    const rawId = String(gcId || '').trim().toUpperCase();
    const rawPin = String(pin || '').trim().toUpperCase();

    // Default short login pattern:
    // e.g. 1x for NGO (x=1..N), 2x for Volunteer (x=1..N), 3x for Company (x=1..N)
    const defaultPattern = new RegExp(`^(?:${config.prefix})?(${config.digit}(\\d+|[X]))$`, 'i');
    const match = rawId.match(defaultPattern);

    if (match) {
      const code = match[1].toUpperCase();
      const xVal = match[2].toUpperCase();

      const profiles = await getRoleProfiles(role);
      const totalCount = profiles.length;

      let index = -1;
      if (xVal === 'X') {
        index = 0; // Default 1x/2x/3x literal to 1st profile
      } else {
        const naturalNumber = parseInt(xVal, 10);
        if (naturalNumber >= 1 && naturalNumber <= totalCount) {
          index = naturalNumber - 1;
        }
      }

      if (index === -1) {
        return NextResponse.json({
          message: `Invalid default login. Only ${totalCount} ${role} profile(s) present (valid: ${config.digit}1 to ${config.digit}${totalCount}).`
        }, { status: 404 });
      }

      const matchedProfile = profiles[index];
      const validPins = [
        code,
        rawId,
        `${config.prefix}${code}`,
        String(matchedProfile.pin || '').trim().toUpperCase()
      ];

      if (validPins.includes(rawPin)) {
        return NextResponse.json({
          message: 'Login successful',
          user: matchedProfile
        }, { status: 200 });
      } else {
        return NextResponse.json({
          message: `Invalid PIN. Enter ${code} as your PIN.`
        }, { status: 401 });
      }
    }

    // Fallback to present database users by full GC-ID
    const doc = await db.collection('users').doc(rawId).get();

    if (!doc.exists) {
      return NextResponse.json({ message: 'User not found or role mismatch.' }, { status: 404 });
    }

    const user = doc.data();

    if (user.role !== role) {
      return NextResponse.json({ message: 'User not found or role mismatch.' }, { status: 404 });
    }

    if (String(user.pin).trim() !== String(pin).trim()) {
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
