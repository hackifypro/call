import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const conversations = ServerDatabase.getCustomerMessages(auth.user.id);
  const bookings = ServerDatabase.getCustomerBookings(auth.user.id, auth.user.email);
  const activeBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'accepted' || b.status === 'in_progress'
  );

  return NextResponse.json({
    success: true,
    conversations,
    activeBookings: activeBookings.map((b) => ({
      bookingId: b.id,
      bookingRef: b.bookingRef,
      companionId: b.companionId,
      companionDisplayName: b.companionDisplayName,
      companionPhotoUrl: b.companionPhotoUrl,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { bookingId, message } = body;

    if (!bookingId || !message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Booking ID and message text are required.' }, { status: 400 });
    }

    // Verify customer owns this booking and it's active
    const bookings = ServerDatabase.getCustomerBookings(auth.user.id, auth.user.email);
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found or unauthorized.' }, { status: 403 });
    }

    const conversation = ServerDatabase.sendCustomerMessage({
      customerId: auth.user.id,
      customerName: auth.user.fullName || 'Customer',
      companionId: booking.companionId,
      companionName: booking.companionDisplayName,
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      message: message.trim(),
      sender: 'customer',
    });

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to send message.' }, { status: 500 });
  }
}
