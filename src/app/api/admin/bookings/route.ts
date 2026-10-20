import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance', 'support']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status');
  const city = searchParams.get('city');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  let bookings = ServerDatabase.getBookings();

  if (search) {
    bookings = bookings.filter(
      (b) =>
        b.bookingRef.toLowerCase().includes(search) ||
        b.customerName.toLowerCase().includes(search) ||
        b.companionDisplayName.toLowerCase().includes(search) ||
        b.cityName.toLowerCase().includes(search)
    );
  }

  if (status && status !== 'all') {
    bookings = bookings.filter((b) => b.status === status);
  }

  if (city && city !== 'all') {
    bookings = bookings.filter((b) => b.cityName.toLowerCase() === city.toLowerCase());
  }

  const total = bookings.length;
  const paginated = bookings.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    success: true,
    bookings: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function PATCH(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance', 'support']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { bookingId, newStatus, reason } = body;

    if (!bookingId || !newStatus) {
      return NextResponse.json({ success: false, error: 'Booking ID and status are required.' }, { status: 400 });
    }

    const ok = ServerDatabase.updateBookingStatus(bookingId, newStatus, authCheck.user.email, reason);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Booking status updated to ${newStatus}.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
