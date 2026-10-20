import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const credits = ServerDatabase.getCustomerCredits(auth.user.id, auth.user.email);
  const bookings = ServerDatabase.getCustomerBookings(auth.user.id, auth.user.email);

  const refundableBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'accepted' || b.status === 'pending_acceptance'
  );

  const cancelledOrRefundedBookings = bookings.filter(
    (b) => b.status === 'cancelled' || b.status === 'refunded'
  );

  const availableBalance = credits
    .filter((c) => c.status === 'available')
    .reduce((sum, c) => sum + c.creditAmount, 0);

  return NextResponse.json({
    success: true,
    credits,
    availableBalance,
    refundableBookings,
    cancelledOrRefundedBookings,
    policy: {
      notice24h: '100% Replacement Booking Credit or Full Refund',
      notice12to24h: '50% Replacement Booking Credit',
      noticeUnder12h: 'Non-refundable (0%) per Section 11 platform terms',
    },
  });
}
