import { NextResponse } from 'next/server';
import { authenticateCredentials } from '@/lib/userStore';
import { createSessionToken, AUTH_COOKIE_NAME, getRoleDefaultRedirect } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Authenticate against server store (bcrypt comparison)
    const result = await authenticateCredentials(email, password);

    if (!result.success || !result.sessionUser) {
      // Generic error message to prevent account enumeration
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Generate encrypted JWT session token
    const token = await createSessionToken(result.sessionUser);
    const redirectUrl = getRoleDefaultRedirect(result.sessionUser.role);

    // Build response and set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: result.sessionUser,
      redirectUrl,
    });

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
