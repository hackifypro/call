import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const analytics = ServerDatabase.getRealTimeAnalytics();
  return NextResponse.json({ success: true, analytics });
}
