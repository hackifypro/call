import { ServerDatabase } from '../src/lib/serverDatabase';
import { createSessionToken, verifySessionToken, authenticateCustomerRequest } from '../src/lib/session';
import { SessionUser } from '../src/lib/types';

async function runCustomerDashboardTests() {
  console.log('\n======================================================');
  console.log('AURA INDIA — CUSTOMER DASHBOARD & OPERATIONS TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // ------------------------------------------------------------------
  // TEST 1: Customer Authentication & Role Segregation
  // ------------------------------------------------------------------
  const customerUser: SessionUser = {
    id: `usr-cust-${Date.now()}`,
    email: `customer.${Date.now()}@aura-india.com`,
    fullName: 'Aditya Roy',
    role: 'customer',
    phoneNumber: '+919820099881',
  };

  const customerToken = await createSessionToken(customerUser);
  assert(Boolean(customerToken) && customerToken.length > 50, 'Session token signed for Customer');

  const claims = await verifySessionToken(customerToken);
  assert(claims?.role === 'customer', 'Token preserves customer role');
  assert(claims?.id === customerUser.id, 'Token preserves user ID claim');

  // Customer Request Authentication Helper
  const validCustomerReq = new Request('http://localhost:3000/api/customer/dashboard', {
    headers: { authorization: `Bearer ${customerToken}` },
  });
  const authCheck = await authenticateCustomerRequest(validCustomerReq);
  assert(authCheck.authorized === true, 'Customer request successfully authorized');
  if (authCheck.authorized) {
    assert(authCheck.user.id === customerUser.id, 'Authenticated user context extracted from token');
  }

  // Unauthorized companion crossover check
  const companionUser: SessionUser = {
    id: 'usr-comp-test-202',
    email: 'test.companion@aura-india.com',
    fullName: 'Companion User',
    role: 'companion',
  };
  const companionToken = await createSessionToken(companionUser);
  const companionReq = new Request('http://localhost:3000/api/customer/dashboard', {
    headers: { authorization: `Bearer ${companionToken}` },
  });
  const companionAuthCheck = await authenticateCustomerRequest(companionReq);
  assert(companionAuthCheck.authorized === false, 'Companion blocked from customer endpoints (403)');
  if (!companionAuthCheck.authorized) {
    assert(companionAuthCheck.status === 403, 'Returns 403 Forbidden on companion crossover attempt');
  }

  // Unauthenticated request check
  const unauthReq = new Request('http://localhost:3000/api/customer/dashboard');
  const unauthCheck = await authenticateCustomerRequest(unauthReq);
  assert(unauthCheck.authorized === false, 'Unauthenticated visitor blocked (401)');
  if (!unauthCheck.authorized) {
    assert(unauthCheck.status === 401, 'Returns 401 Unauthorized');
  }

  // ------------------------------------------------------------------
  // TEST 2: Customer Bookings & 10% Commission Escrow Creation
  // ------------------------------------------------------------------
  const companions = ServerDatabase.getCompanions();
  const approvedCompanion = companions.find((c) => c.status === 'approved') || companions[0];
  assert(Boolean(approvedCompanion), 'Approved companion available for booking');

  const randomDay = 10 + Math.floor(Math.random() * 15);
  const randomMin = Math.floor(Math.random() * 50).toString().padStart(2, '0');
  const testDate = `2026-11-${randomDay}`;
  const testTime = `19:${randomMin}`;
  const testDuration = 2;

  const newBooking = ServerDatabase.createCustomerBooking({
    customerId: customerUser.id,
    customerName: customerUser.fullName,
    customerEmail: customerUser.email,
    customerPhone: customerUser.phoneNumber,
    companionId: approvedCompanion.id,
    bookingDate: testDate,
    startTime: testTime,
    durationHours: testDuration,
    meetupLocation: 'The Taj Mahal Palace, Colaba, Mumbai',
    occasionType: 'Fine Dining & Art Gala',
    specialNotes: 'Table reserved in main dining room.',
    paymentMethod: 'UPI (Instant Escrow)',
  });

  assert(Boolean(newBooking.id), 'Booking record created with unique ID');
  assert(newBooking.bookingRef.startsWith('BK-'), 'Booking has standard BK- reference');
  assert(newBooking.customerId === customerUser.id, 'Booking strictly assigned to customer ID');
  assert(newBooking.status === 'confirmed', 'Booking confirmed in escrow');

  // Verify 10% Platform Commission calculation (Section 10)
  const expectedBase = approvedCompanion.hourlyRate * testDuration;
  const expectedCommission = Math.round(expectedBase * 0.1);
  const expectedNetCompanion = expectedBase - expectedCommission;

  assert(
    newBooking.priceBreakdown?.baseAmount === expectedBase,
    `Base amount (${expectedBase}) calculated accurately`
  );
  assert(
    newBooking.priceBreakdown?.platformCommissionAmount === expectedCommission,
    `10% platform commission (${expectedCommission}) calculated accurately`
  );
  assert(
    newBooking.priceBreakdown?.netCompanionAmount === expectedNetCompanion,
    `Net companion payout (${expectedNetCompanion}) calculated accurately`
  );

  // ------------------------------------------------------------------
  // TEST 3: Double-Booking Prevention / Availability Conflict
  // ------------------------------------------------------------------
  let doubleBookingBlocked = false;
  try {
    ServerDatabase.createCustomerBooking({
      customerId: 'usr-customer-another',
      customerName: 'Another Customer',
      customerEmail: 'another@example.com',
      companionId: approvedCompanion.id,
      bookingDate: testDate,
      startTime: testTime,
      durationHours: 2,
      meetupLocation: 'Bandra Club',
    });
  } catch (err: any) {
    if (err.message.includes('already reserved')) {
      doubleBookingBlocked = true;
    }
  }
  assert(doubleBookingBlocked, 'Double-booking at identical slot blocked server-side');

  // ------------------------------------------------------------------
  // TEST 4: Section 11 Graduated Cancellation & Replacement Credits
  // ------------------------------------------------------------------
  // Since testDate is in November 2026 (> 24 hours notice), policy must issue 100% replacement credit
  const cancelResult = ServerDatabase.cancelCustomerBooking(
    newBooking.id,
    customerUser.id,
    customerUser.email,
    'Client travel rescheduled'
  );

  assert(cancelResult.success === true, 'Booking cancelled successfully');
  assert(cancelResult.status === 'cancelled', 'Booking marked as cancelled');
  assert(
    cancelResult.creditIssued === expectedBase,
    `100% Replacement Credit (₹${expectedBase}) issued for >24h notice per Section 11 terms`
  );

  // Verify replacement credit in user's credits
  const credits = ServerDatabase.getCustomerCredits(customerUser.id);
  const issuedCredit = credits.find((c) => c.originalBookingId === newBooking.id);
  assert(Boolean(issuedCredit), 'Credit record persisted in database');
  assert(issuedCredit?.status === 'available', 'Credit status is available for redemption');
  assert(issuedCredit?.creditAmount === expectedBase, 'Credit amount matches cancelled booking amount');

  // ------------------------------------------------------------------
  // TEST 5: Replacement Credit Redemption on New Booking
  // ------------------------------------------------------------------
  if (issuedCredit) {
    const discountedDay = 10 + Math.floor(Math.random() * 15);
    const discountedMin = Math.floor(Math.random() * 50).toString().padStart(2, '0');
    const discountedBooking = ServerDatabase.createCustomerBooking({
      customerId: customerUser.id,
      customerName: customerUser.fullName,
      customerEmail: customerUser.email,
      companionId: approvedCompanion.id,
      bookingDate: `2026-12-${discountedDay}`,
      startTime: `20:${discountedMin}`,
      durationHours: 2,
      meetupLocation: 'Olive Bar & Kitchen, Khar',
      useCreditId: issuedCredit.id,
    });

    assert(
      discountedBooking.priceBreakdown?.totalPayableByCustomer === 0,
      'Full replacement credit applied at checkout (₹0 payable)'
    );

    // Verify credit is now marked redeemed
    const updatedCredits = ServerDatabase.getCustomerCredits(customerUser.id);
    const redeemedCredit = updatedCredits.find((c) => c.id === issuedCredit.id);
    assert(redeemedCredit?.status === 'redeemed', 'Credit status updated to redeemed');
  }

  // ------------------------------------------------------------------
  // TEST 6: Customer Favorites Toggle & Privacy Isolation
  // ------------------------------------------------------------------
  const favResult1 = ServerDatabase.toggleCustomerFavorite(customerUser.id, approvedCompanion.id);
  assert(favResult1.isFavorite === true, 'Companion added to favorites');
  assert(favResult1.favorites.includes(approvedCompanion.id), 'Favorite list contains companion ID');

  const favorites = ServerDatabase.getCustomerFavorites(customerUser.id);
  assert(favorites.includes(approvedCompanion.id), 'Favorites persisted and retrieved');

  // Verify another customer does not see this user's favorites
  const anotherFavorites = ServerDatabase.getCustomerFavorites('usr-stranger-999');
  assert(!anotherFavorites.includes(approvedCompanion.id), 'Favorites are 100% private to the customer');

  // Toggle off
  const favResult2 = ServerDatabase.toggleCustomerFavorite(customerUser.id, approvedCompanion.id);
  assert(favResult2.isFavorite === false, 'Companion removed from favorites on second toggle');

  // ------------------------------------------------------------------
  // TEST 7: Ratings & Verified Review Submission Controls
  // ------------------------------------------------------------------
  // 7a. Attempt review on non-completed booking -> must reject
  let uncompletedReviewBlocked = false;
  try {
    ServerDatabase.createCustomerReview({
      customerId: customerUser.id,
      customerName: customerUser.fullName,
      bookingId: newBooking.id, // is cancelled, not completed
      rating: 5,
      comment: 'Great time!',
    });
  } catch (err: any) {
    if (err.message.includes('completed companion appointments')) {
      uncompletedReviewBlocked = true;
    }
  }
  assert(uncompletedReviewBlocked, 'Review rejected if booking is not completed');

  // 7b. Create synthetic completed booking and submit verified review
  const bookings = ServerDatabase.getBookings();
  const completedBooking = bookings.find((b) => b.status === 'completed' && !b.hasReview);
  if (completedBooking) {
    const review = ServerDatabase.createCustomerReview({
      customerId: completedBooking.customerId,
      customerName: completedBooking.customerName,
      bookingId: completedBooking.id,
      rating: 5,
      comment: 'Exceptional professionalism, punctuality, and intellect. 100% recommended!',
    });
    assert(Boolean(review.id), 'Verified review submitted for completed booking');
    assert(review.isVerified === true, 'Review marked as verified appointment');

    // 7c. Attempt duplicate review on same completed booking -> must reject
    let duplicateBlocked = false;
    try {
      ServerDatabase.createCustomerReview({
        customerId: completedBooking.customerId,
        customerName: completedBooking.customerName,
        bookingId: completedBooking.id,
        rating: 4,
        comment: 'Trying duplicate review',
      });
    } catch (err: any) {
      if (err.message.includes('already submitted a review')) {
        duplicateBlocked = true;
      }
    }
    assert(duplicateBlocked, 'Duplicate review for identical completed booking strictly rejected');
  }

  // ------------------------------------------------------------------
  // TEST 8: Customer Support Ticket & Reply Thread
  // ------------------------------------------------------------------
  const ticket = ServerDatabase.createCustomerSupportTicket({
    customerId: customerUser.id,
    customerName: customerUser.fullName,
    customerEmail: customerUser.email,
    subject: 'Escrow verification question',
    category: 'payment',
    priority: 'medium',
    message: 'Could you please confirm if my GST invoice includes companion breakdown?',
    bookingRef: newBooking.bookingRef,
  });

  assert(Boolean(ticket.id), 'Support ticket created');
  assert(ticket.ticketRef.startsWith('TCK-'), 'Ticket has reference format TCK-');
  assert(ticket.status === 'open', 'Ticket status initialized to open');

  const replied = ServerDatabase.addCustomerTicketReply(
    ticket.id,
    customerUser.id,
    customerUser.fullName,
    'Following up with additional clarification.'
  );
  assert(replied === true, 'Reply successfully appended to customer ticket');

  // ------------------------------------------------------------------
  // TEST 9: Personal Data Export (DPDP Compliance)
  // ------------------------------------------------------------------
  const customerBookings = ServerDatabase.getCustomerBookings(customerUser.id, customerUser.email);
  const customerCredits = ServerDatabase.getCustomerCredits(customerUser.id);
  const customerTickets = ServerDatabase.getCustomerSupportTickets(customerUser.id, customerUser.email);

  assert(Array.isArray(customerBookings), 'Export includes customer bookings array');
  assert(Array.isArray(customerCredits), 'Export includes customer credits array');
  assert(Array.isArray(customerTickets), 'Export includes customer tickets array');

  // Final Test Report
  console.log('\n======================================================');
  console.log(`TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCustomerDashboardTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
