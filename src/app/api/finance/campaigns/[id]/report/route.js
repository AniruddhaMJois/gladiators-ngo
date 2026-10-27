import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const { reportUrl } = await request.json();
    const campaignRef = db.collection('programs').doc(id);
    await campaignRef.update({
      hasFinanceReport: true,
      financeReportUrl: reportUrl || 'generated_report.pdf'
    });
    const updatedDoc = await campaignRef.get();
    return NextResponse.json({ ...updatedDoc.data(), _id: updatedDoc.id }, { status: 200 });
  } catch (error) {
    console.error('Error generating finance report:', error);
    return NextResponse.json({ error: 'Error generating finance report' }, { status: 500 });
  }
}
