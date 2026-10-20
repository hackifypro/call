import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const notifications = ServerDatabase.getCustomerNotifications(auth.user.id);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return NextResponse.json({
    success: true,
    notifications,
    unreadCount,
  });
}

export async function POST(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  ServerDatabase.markCustomerNotificationsRead(auth.user.id);

  return NextResponse.json({
    success: true,
    message: 'All notifications marked as read.',
  });
}
