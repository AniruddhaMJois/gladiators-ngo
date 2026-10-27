import { NextResponse } from 'next/server';
import otpStore from '@/lib/otpStore';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const otp = '123456';
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    console.log(`Bypassed OTP for ${email}. Use 123456`);
    return NextResponse.json({ success: true, message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ success: false, message: 'Failed to send OTP.' }, { status: 500 });
  }
}
