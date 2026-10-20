import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'support']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const tickets = ServerDatabase.getTickets();
  return NextResponse.json({ success: true, tickets });
}

export async function POST(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'support']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { ticketId, replyMessage } = body;

    if (!ticketId || !replyMessage) {
      return NextResponse.json({ success: false, error: 'Ticket ID and reply message are required.' }, { status: 400 });
    }

    const ok = ServerDatabase.addTicketReply(ticketId, replyMessage, authCheck.user.email);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Ticket not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Reply sent and ticket updated.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
