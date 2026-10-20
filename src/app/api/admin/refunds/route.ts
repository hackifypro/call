import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const credits = ServerDatabase.getCredits();
  const bookings = ServerDatabase.getBookings().filter((b) => b.status === 'refund_pending' || b.status === 'refunded');

  return NextResponse.json({
    success: true,
    credits,
    refundRequests: bookings,
  });
}

export async function POST(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { action, bookingId, userId, amount, reason } = body;

    if (action === 'ISSUE_CREDIT') {
      if (!userId || !bookingId || !amount) {
        return NextResponse.json({ success: false, error: 'User ID, booking ID, and credit amount are required.' }, { status: 400 });
      }

      const credit = ServerDatabase.issueReplacementCredit({
        userId,
        originalBookingId: bookingId,
        creditAmount: amount,
        reason: reason || 'Section 11 Customer Cancellation Replacement Credit',
        operatorEmail: authCheck.user.email,
      });

      ServerDatabase.updateBookingStatus(bookingId, 'refunded', authCheck.user.email, 'Resolved via replacement credit');

      return NextResponse.json({
        success: true,
        message: `₹${amount} replacement credit issued successfully.`,
        credit,
      });
    }

    if (action === 'PROCESS_BANK_REFUND') {
      if (!bookingId || !amount) {
        return NextResponse.json({ success: false, error: 'Booking ID and amount required.' }, { status: 400 });
      }

      ServerDatabase.updateBookingStatus(bookingId, 'refunded', authCheck.user.email, 'Bank refund authorized');

      ServerDatabase.recordAuditLog({
        adminEmail: authCheck.user.email,
        action: 'PROCESS_BANK_REFUND',
        targetType: 'booking',
        targetId: bookingId,
        details: `Authorized direct payment gateway refund of ₹${amount}. Reason: ${reason || 'Customer request'}`,
      });

      return NextResponse.json({
        success: true,
        message: `Direct banking refund of ₹${amount} initiated. Reference: REF-${Date.now().toString().slice(-6)}`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid refund action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
