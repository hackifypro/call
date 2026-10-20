import { NextResponse } from 'next/server';
import { registerNewUser } from '@/lib/userStore';
import { createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, phoneNumber, isAdultConfirmed, termsAccepted } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (!isAdultConfirmed) {
      return NextResponse.json(
        { success: false, error: 'Adult age verification (18+) is legally mandatory.' },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { success: false, error: 'You must accept the platform terms of service and privacy policy.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Server-side role assignment: STRICTLY 'customer' (Never trust client-submitted roles!)
    const result = await registerNewUser({
      fullName,
      email,
      passwordPlain: password,
      role: 'customer',
      phoneNumber,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create customer account.' },
        { status: 400 }
      );
    }

    // Auto-login newly registered customer
    const sessionToken = await createSessionToken({
      id: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
      role: result.user.role,
      phoneNumber: result.user.phoneNumber,
    });

    const response = NextResponse.json({
      success: true,
      user: result.user,
      redirectUrl: '/explore',
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal registration server error.' },
      { status: 500 }
    );
  }
}
