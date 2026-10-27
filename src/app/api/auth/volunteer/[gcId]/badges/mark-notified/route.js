import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { gcId } = params;
    const { level } = await request.json();
    const docRef = db.collection('users').doc(gcId.toUpperCase());
    const doc = await docRef.get();

    if (!doc.exists) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    const user = doc.data();

    if (user.badges && user.badges.length > 0) {
      let modified = false;
      user.badges.forEach(b => {
        if (!level || b.level === level) {
          if (!b.notified) {
            b.notified = true;
            modified = true;
          }
        }
      });
      if (modified) {
        await docRef.update({ badges: user.badges });
      }
    }

    return NextResponse.json({ success: true, badges: user.badges }, { status: 200 });
  } catch (error) {
    console.error('Error marking badges notified:', error);
    return NextResponse.json({ message: 'Server error marking badges as notified.' }, { status: 500 });
  }
}
