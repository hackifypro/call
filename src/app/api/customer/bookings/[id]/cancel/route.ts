import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const bookingId = params.id;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'Personal schedule conflict';

    const result = ServerDatabase.cancelCustomerBooking(
      bookingId,
      auth.user.id,
      auth.user.email,
      reason
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to cancel booking.' },
      { status: 400 }
    );
  }
}
