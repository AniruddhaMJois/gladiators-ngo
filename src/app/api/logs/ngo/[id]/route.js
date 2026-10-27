import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const snapshot = await db.collection('logs').where('ngoId', '==', id).get();
    const logs = [];
    snapshot.forEach(doc => logs.push({ ...doc.data(), _id: doc.id }));
    logs.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return NextResponse.json(logs, { status: 200 });
  } catch (err) {
    console.error('Error fetching logs:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
