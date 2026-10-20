import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const ticketId = params.id;
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Reply message cannot be empty.' }, { status: 400 });
    }

    const ok = ServerDatabase.addCustomerTicketReply(
      ticketId,
      auth.user.id,
      auth.user.fullName || 'Customer',
      message.trim()
    );

    if (!ok) {
      return NextResponse.json({ success: false, error: 'Ticket not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Reply sent successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to send reply.' }, { status: 500 });
  }
}
