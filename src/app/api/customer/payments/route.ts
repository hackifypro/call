import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const paymentData = ServerDatabase.getCustomerPayments(auth.user.id, auth.user.email);

  return NextResponse.json({
    success: true,
    ...paymentData,
  });
}
