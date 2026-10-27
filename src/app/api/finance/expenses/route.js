import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { ngoId, campaignId, title, amountSpent, category, description, proofUrl } = await request.json();
    if (!ngoId || !title || !amountSpent || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newExpense = {
      ngoId,
      campaignId,
      title,
      amountSpent,
      category,
      description,
      proofUrl,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('expense_logs').add(newExpense);
    return NextResponse.json({ ...newExpense, _id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error logging expense:', error);
    return NextResponse.json({ error: 'Error logging expense' }, { status: 500 });
  }
}
