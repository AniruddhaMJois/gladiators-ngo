import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const logRef = db.collection('logs').doc(id);
    await logRef.update(body);
    const updatedDoc = await logRef.get();
    return NextResponse.json({ ...updatedDoc.data(), _id: updatedDoc.id }, { status: 200 });
  } catch (err) {
    console.error('Error updating log:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    await db.collection('logs').doc(id).delete();
    return NextResponse.json({ message: 'Log deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('Error deleting log:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
