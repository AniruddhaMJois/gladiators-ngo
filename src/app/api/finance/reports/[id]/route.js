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

// GET: fetch all reports where ngoId == id
export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const snapshot = await db.collection('finance_reports').where('ngoId', '==', id).get();
    const reports = [];
    for (const doc of snapshot.docs) {
      let data = doc.data();
      data._id = doc.id;
      data = await populateCampaign(data);
      reports.push(data);
    }

    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error('Error fetching finance reports:', error);
    return NextResponse.json({ error: 'Error fetching finance reports' }, { status: 500 });
  }
}

// PUT: update report where doc id is id
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { title, campaignId, rows, totalAmount, bills } = body;
    const reportRef = db.collection('finance_reports').doc(id);

    await reportRef.update({ title, campaignId, rows, totalAmount, bills });
    const updatedDoc = await reportRef.get();

    return NextResponse.json({ ...updatedDoc.data(), _id: updatedDoc.id }, { status: 200 });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Error updating report' }, { status: 500 });
  }
}

// DELETE: delete report where doc id is id
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    await db.collection('finance_reports').doc(id).delete();
    return NextResponse.json({ message: 'Report deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: 'Error deleting report' }, { status: 500 });
  }
}
