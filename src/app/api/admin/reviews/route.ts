import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'moderator', 'support']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const reviews = ServerDatabase.getReviews();
  return NextResponse.json({ success: true, reviews });
}

export async function PATCH(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'moderator']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'Review ID required.' }, { status: 400 });
    }

    const ok = ServerDatabase.toggleReviewFlag(reviewId, authCheck.user.email);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Review not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Review moderation status updated.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
