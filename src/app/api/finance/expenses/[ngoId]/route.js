import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

const populateCampaign = async (docData) => {
  if (!docData.campaignId) return docData;
  try {
    const campaignDoc = await db.collection('programs').doc(docData.campaignId).get();
    if (campaignDoc.exists) {
      return { ...docData, campaignId: { _id: campaignDoc.id, title: campaignDoc.data().title } };
    }
  } catch (err) {
    console.error('Error populating campaign:', err);
  }
  return docData;
};

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { ngoId } = params;
    const snapshot = await db.collection('expense_logs').where('ngoId', '==', ngoId).get();
    const expenses = [];
    for (const doc of snapshot.docs) {
      let data = doc.data();
      data._id = doc.id;
      data = await populateCampaign(data);
      expenses.push(data);
    }
    expenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Error fetching expenses' }, { status: 500 });
  }
}
