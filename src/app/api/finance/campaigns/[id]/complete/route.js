import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const campaignRef = db.collection('programs').doc(id);
    await campaignRef.update({ status: 'Completed' });
    const updatedDoc = await campaignRef.get();
    return NextResponse.json({ ...updatedDoc.data(), _id: updatedDoc.id }, { status: 200 });
  } catch (error) {
    console.error('Error completing campaign:', error);
    return NextResponse.json({ error: 'Error completing campaign' }, { status: 500 });
  }
}
