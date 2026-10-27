import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { ngoId, campaignId, title, rows, bills } = await request.json();
    if (!ngoId || !title || !rows) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const totalAmount = rows.reduce((acc, row) => acc + Number(row.expense || 0), 0);

    const newReport = {
      ngoId,
      campaignId: campaignId || null,
      title,
      rows,
      totalAmount,
      bills,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('finance_reports').add(newReport);
    return NextResponse.json({ ...newReport, _id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error generating finance report:', error);
    return NextResponse.json({ error: 'Error generating finance report' }, { status: 500 });
  }
}
