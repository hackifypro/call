import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const reviews = ServerDatabase.getCustomerReviews(auth.user.id);
  const bookings = ServerDatabase.getCustomerBookings(auth.user.id, auth.user.email);
  const completedWithoutReview = bookings.filter((b) => b.status === 'completed' && !b.hasReview);

  return NextResponse.json({
    success: true,
    reviews,
    eligibleToReview: completedWithoutReview,
  });
}

export async function POST(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { bookingId, rating, comment } = body;

    if (!bookingId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Booking ID, rating (1-5), and written feedback are required.' },
        { status: 400 }
      );
    }

    const review = ServerDatabase.createCustomerReview({
      customerId: auth.user.id,
      customerName: auth.user.fullName || 'Verified Customer',
      bookingId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your verified review has been published.',
      review,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Review submission failed.' }, { status: 400 });
  }
}
