import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    await db.collection('programs').doc(id).delete();
    return NextResponse.json({ message: 'Program deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
