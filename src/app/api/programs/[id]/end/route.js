import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const { hours, attendanceData } = await request.json();

    if (hours === undefined || isNaN(hours) || hours <= 0) {
      return NextResponse.json({ message: 'Valid hours are required to end a campaign' }, { status: 400 });
    }

    const progRef = db.collection('programs').doc(id);
    await progRef.update({ status: 'Completed', hours: Number(hours) });
    const updatedDoc = await progRef.get();

    if (!updatedDoc.exists) return NextResponse.json({ message: 'Program not found' }, { status: 404 });
    const program = updatedDoc.data();

    // Process attendance if provided
    if (attendanceData && Array.isArray(attendanceData)) {
      for (const att of attendanceData) {
        await db.collection('applications').doc(att.applicationId).update({
          attendance: att.status
        });

        // Notify absent volunteers
        if (att.status === 'Absent') {
          const newMsg = {
            senderId: program.ngoId,
            receiverId: att.volunteerId,
            content: `Attendance Update: You have been marked absent for the volunteer program "${program.title}". No hours have been credited for this session. If you believe this is an error, please contact the hosting NGO.`,
            createdAt: new Date().toISOString(),
            read: false
          };
          await db.collection('messages').add(newMsg);
        }
      }
    }

    return NextResponse.json({ ...program, _id: updatedDoc.id }, { status: 200 });
  } catch (error) {
    console.error('Error ending program:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
