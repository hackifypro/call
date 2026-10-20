import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const customerId = auth.user.id;
  const customerEmail = auth.user.email;

  // Real database lookups
  const allBookings = ServerDatabase.getCustomerBookings(customerId, customerEmail);
  const credits = ServerDatabase.getCustomerCredits(customerId, customerEmail);
  const favorites = ServerDatabase.getCustomerFavorites(customerId);
  const recentlyViewed = ServerDatabase.getCustomerRecentlyViewed(customerId);
  const notifications = ServerDatabase.getCustomerNotifications(customerId);
  const tickets = ServerDatabase.getCustomerSupportTickets(customerId, customerEmail);
  const companions = ServerDatabase.getCompanions();

  // Categorize bookings
  const upcomingBookings = allBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'accepted' || b.status === 'in_progress'
  );
  const pendingRequests = allBookings.filter((b) => b.status === 'pending_acceptance');
  const completedBookings = allBookings.filter((b) => b.status === 'completed');
  const cancelledBookings = allBookings.filter(
    (b) => b.status === 'cancelled' || b.status === 'refunded' || b.status === 'rejected'
  );

  // Available Section 11 replacement credit balance
  const activeCredits = credits.filter((c) => c.status === 'available');
  const totalCreditBalance = activeCredits.reduce((sum, c) => sum + c.creditAmount, 0);

  // Favorite companions detailed profiles
  const favoriteCompanions = companions.filter((c) => favorites.includes(c.id));
  const recentCompanions = companions.filter((c) => recentlyViewed.includes(c.id));

  return NextResponse.json({
    success: true,
    user: {
      id: auth.user.id,
      email: auth.user.email,
      fullName: auth.user.fullName,
      phoneNumber: auth.user.phoneNumber || '+919820112233',
      role: auth.user.role,
    },
    metrics: {
      totalBookings: allBookings.length,
      upcomingCount: upcomingBookings.length,
      pendingCount: pendingRequests.length,
      completedCount: completedBookings.length,
      cancelledCount: cancelledBookings.length,
      favoritesCount: favorites.length,
      totalCreditBalance,
      unreadNotificationsCount: notifications.filter((n) => !n.isRead).length,
      openTicketsCount: tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
    },
    upcomingBookings: upcomingBookings.slice(0, 5),
    pendingRequests: pendingRequests.slice(0, 5),
    completedBookings: completedBookings.slice(0, 5),
    favoriteCompanions: favoriteCompanions.slice(0, 6),
    recentCompanions: recentCompanions.slice(0, 6),
    recentNotifications: notifications.slice(0, 5),
    recentTickets: tickets.slice(0, 4),
    activeCredits,
  });
}
