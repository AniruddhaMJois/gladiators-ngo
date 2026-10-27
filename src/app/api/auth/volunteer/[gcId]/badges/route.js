import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

const checkAndAwardBadges = async (userId, user) => {
  if (user.role !== 'volunteer') return user;

  const appsSnapshot = await db.collection('applications')
    .where('volunteerId', '==', userId)
    .where('status', '==', 'Approved')
    .get();

  let totalHours = 0;

  for (const doc of appsSnapshot.docs) {
    const app = doc.data();
    if (app.attendance !== 'Absent' && app.programId) {
      const progDoc = await db.collection('programs').doc(app.programId).get();
      if (progDoc.exists) {
        const prog = progDoc.data();
        if (prog.status === 'Completed') {
          totalHours += (prog.hours || 0);
        }
      }
    }
  }

  const badgeTiers = [
    { limit: 5, name: 'Green Horn', level: 'Bronze', description: 'Active contributor supporting community events.' },
    { limit: 15, name: 'Earth Champion', level: 'Silver', description: 'Dedicated champion driving impactful initiatives.' },
    { limit: 30, name: 'Gladiator Hero', level: 'Gold', description: 'Outstanding leader making a significant difference.' },
    { limit: 50, name: 'Eco Vanguard', level: 'Platinum', description: 'Elite volunteer pioneer and community legend.' }
  ];

  let hasNewBadge = false;
  const currentBadges = user.badges || [];

  for (const tier of badgeTiers) {
    if (totalHours >= tier.limit) {
      const exists = currentBadges.some(b => b.level === tier.level);
      if (!exists) {
        currentBadges.push({
          name: tier.name,
          level: tier.level,
          description: tier.description,
          earnedAt: new Date().toISOString(),
          notified: false
        });
        hasNewBadge = true;
      }
    }
  }

  if (hasNewBadge) {
    user.badges = currentBadges;
    await db.collection('users').doc(userId).update({ badges: currentBadges });
  }

  return user;
};

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { gcId } = params;
    const docRef = db.collection('users').doc(gcId.toUpperCase());
    const doc = await docRef.get();

    if (!doc.exists) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    let user = doc.data();

    user = await checkAndAwardBadges(gcId.toUpperCase(), user);

    const appsSnapshot = await db.collection('applications')
      .where('volunteerId', '==', gcId.toUpperCase())
      .where('status', '==', 'Approved')
      .get();

    let totalHours = 0;
    let eventsCount = 0;

    for (const appDoc of appsSnapshot.docs) {
      const app = appDoc.data();
      if (app.attendance !== 'Absent' && app.programId) {
        const progDoc = await db.collection('programs').doc(app.programId).get();
        if (progDoc.exists) {
          const prog = progDoc.data();
          if (prog.status === 'Completed') {
            totalHours += (prog.hours || 0);
            eventsCount++;
          }
        }
      }
    }

    return NextResponse.json({
      badges: user.badges || [],
      totalHours,
      eventsCount
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching volunteer badges:', error);
    return NextResponse.json({ message: 'Server error fetching badges.' }, { status: 500 });
  }
}
