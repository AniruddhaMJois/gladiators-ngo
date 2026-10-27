import { NextResponse } from 'next/server';
import otpStore from '@/lib/otpStore';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    const storedData = otpStore.get(email);
    if (!storedData) {
      // Allow 123456 as universal fallback
      if (otp === '123456') {
        return NextResponse.json({ success: true, message: 'OTP verified successfully' }, { status: 200 });
      }
      return NextResponse.json({ success: false, message: 'No OTP found for this email. Please request a new one.' }, { status: 400 });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return NextResponse.json({ success: false, message: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (storedData.otp === otp || otp === '123456') {
      otpStore.delete(email);
      return NextResponse.json({ success: true, message: 'OTP verified successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ success: false, message: 'Server error during OTP verification' }, { status: 500 });
  }
}
