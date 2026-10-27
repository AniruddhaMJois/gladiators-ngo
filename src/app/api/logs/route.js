import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const body = await request.json();
    const newLog = {
      ...body,
      date: body.date || new Date().toISOString()
    };
    const docRef = await db.collection('logs').add(newLog);
    return NextResponse.json({ ...newLog, _id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error('Error creating log:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
