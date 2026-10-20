import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') || 'all';

  const allBookings = ServerDatabase.getCustomerBookings(auth.user.id, auth.user.email);

  const filtered = allBookings.filter((b) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return b.status === 'pending_acceptance';
    if (statusFilter === 'confirmed') return b.status === 'confirmed' || b.status === 'accepted';
    if (statusFilter === 'upcoming')
      return b.status === 'confirmed' || b.status === 'accepted' || b.status === 'pending_acceptance';
    if (statusFilter === 'in_progress') return b.status === 'in_progress';
    if (statusFilter === 'completed') return b.status === 'completed';
    if (statusFilter === 'rejected') return b.status === 'rejected';
    if (statusFilter === 'cancelled') return b.status === 'cancelled';
    if (statusFilter === 'refunded') return b.status === 'refunded';
    return b.status === statusFilter;
  });

  return NextResponse.json({
    success: true,
    bookings: filtered,
    totalCount: allBookings.length,
  });
}

export async function POST(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      companionId,
      bookingDate,
      startTime,
      durationHours,
      meetupLocation,
      occasionType,
      specialNotes,
      paymentMethod,
      useCreditId,
    } = body;

    if (!companionId || !bookingDate || !startTime || !durationHours || !meetupLocation) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking parameters (companion, date, time, duration, location).' },
        { status: 400 }
      );
    }

    const booking = ServerDatabase.createCustomerBooking({
      customerId: auth.user.id,
      customerName: auth.user.fullName || 'Customer',
      customerEmail: auth.user.email,
      customerPhone: auth.user.phoneNumber,
      companionId,
      bookingDate,
      startTime,
      durationHours: Number(durationHours),
      meetupLocation,
      occasionType,
      specialNotes,
      paymentMethod,
      useCreditId,
    });

    return NextResponse.json({
      success: true,
      message: 'Booking request confirmed and escrow authorized.',
      booking,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Booking creation failed.' }, { status: 400 });
  }
}
