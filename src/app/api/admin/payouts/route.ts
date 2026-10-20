import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const payouts = ServerDatabase.getPayouts();
  return NextResponse.json({ success: true, payouts });
}

export async function POST(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { payoutId } = body;

    if (!payoutId) {
      return NextResponse.json({ success: false, error: 'Payout ID is required.' }, { status: 400 });
    }

    const ok = ServerDatabase.authorizePayout(payoutId, authCheck.user.email);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Payout record not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Bank payout authorized and settled.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
