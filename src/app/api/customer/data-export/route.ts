import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';
import { findUserById } from '@/lib/userStore';

export async function GET(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const user = await findUserById(auth.user.id);
  const bookings = ServerDatabase.getCustomerBookings(auth.user.id, auth.user.email);
  const credits = ServerDatabase.getCustomerCredits(auth.user.id, auth.user.email);
  const reviews = ServerDatabase.getCustomerReviews(auth.user.id);
  const tickets = ServerDatabase.getCustomerSupportTickets(auth.user.id, auth.user.email);
  const favorites = ServerDatabase.getCustomerFavorites(auth.user.id);

  const exportPayload = {
    exportDate: new Date().toISOString(),
    platform: 'AURA INDIA - Verified Companion Marketplace',
    compliance: 'Personal Data Protection Act (DPDP Act) Compliant Export',
    userProfile: {
      id: auth.user.id,
      email: auth.user.email,
      fullName: user?.fullName || auth.user.fullName,
      phoneNumber: user?.phoneNumber || auth.user.phoneNumber,
      role: auth.user.role,
      memberSince: user?.createdAt,
    },
    bookingsCount: bookings.length,
    bookings,
    creditsCount: credits.length,
    credits,
    reviewsCount: reviews.length,
    reviews,
    ticketsCount: tickets.length,
    tickets,
    favoriteCompanionIds: favorites,
  };

  return new Response(JSON.stringify(exportPayload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="aura-customer-data-${auth.user.id}.json"`,
    },
  });
}
