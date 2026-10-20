import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Constant-time generic response to prevent account enumeration
    return NextResponse.json({
      success: true,
      message:
        'If an account exists with this email address, password recovery instructions have been sent.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Malformed request.' },
      { status: 400 }
    );
  }
}
