import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const tickets = ServerDatabase.getCustomerSupportTickets(auth.user.id, auth.user.email);
  const bookings = ServerDatabase.getCustomerBookings(auth.user.id, auth.user.email);

  return NextResponse.json({
    success: true,
    tickets,
    bookings: bookings.map((b) => ({ id: b.id, bookingRef: b.bookingRef, companionDisplayName: b.companionDisplayName })),
  });
}

export async function POST(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { subject, category, priority, message, bookingRef } = body;

    if (!subject || !category || !message) {
      return NextResponse.json(
        { success: false, error: 'Subject, category, and message are required.' },
        { status: 400 }
      );
    }

    const ticket = ServerDatabase.createCustomerSupportTicket({
      customerId: auth.user.id,
      customerName: auth.user.fullName || 'Verified Customer',
      customerEmail: auth.user.email,
      subject,
      category,
      priority: priority || 'medium',
      message,
      bookingRef,
    });

    return NextResponse.json({
      success: true,
      message: `Support ticket ${ticket.ticketRef} created. Our 24/7 team will respond shortly.`,
      ticket,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Support ticket creation failed.' }, { status: 400 });
  }
}
