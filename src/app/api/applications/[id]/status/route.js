import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const { status } = await request.json();

    if (!['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const appRef = db.collection('applications').doc(id);
    const doc = await appRef.get();
    if (!doc.exists) return NextResponse.json({ message: 'Application not found' }, { status: 404 });

    await appRef.update({ status });
    const updatedDoc = await appRef.get();

    return NextResponse.json({ ...updatedDoc.data(), _id: updatedDoc.id }, { status: 200 });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
