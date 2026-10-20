import { NextResponse } from 'next/server';
import { registerNewUser } from '@/lib/userStore';
import { createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      legalNamePrivate,
      displayName,
      dob,
      email,
      password,
      phoneNumber,
      stateSlug,
      citySlug,
      bio,
      photoUrl,
      languages,
      interests,
      hourlyRate,
      documentType,
      documentNumberMasked,
      isAdultConfirmed,
      termsAccepted,
    } = body;

    if (!legalNamePrivate || !displayName || !email || !password || !dob) {
      return NextResponse.json(
        { success: false, error: 'Required identity fields missing.' },
        { status: 400 }
      );
    }

    if (!isAdultConfirmed || !termsAccepted) {
      return NextResponse.json(
        { success: false, error: 'Adult age certification and terms acceptance are mandatory.' },
        { status: 400 }
      );
    }

    // Server-side assignment: strictly 'companion'
    const result = await registerNewUser({
      fullName: displayName,
      email,
      passwordPlain: password,
      role: 'companion',
      phoneNumber,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create companion account.' },
        { status: 400 }
      );
    }

    const registrationRef = `CMP-${Date.now().toString().slice(-6)}`;

    // Issue session token so companion can access their own onboarding dashboard
    const sessionToken = await createSessionToken({
      id: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
      role: 'companion',
      phoneNumber: result.user.phoneNumber,
    });

    const response = NextResponse.json({
      success: true,
      user: result.user,
      registrationRef,
      status: 'pending_approval',
      message: 'Companion application submitted into Trust & Safety queue.',
      redirectUrl: '/dashboard/companion',
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
    console.error('Companion registration error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal companion registration error.' },
      { status: 500 }
    );
  }
}
