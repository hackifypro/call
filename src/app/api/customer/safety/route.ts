import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function POST(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { action, reportedProfileId, reason, details, blockUserId } = body;

    if (action === 'block' && blockUserId) {
      ServerDatabase.blockUser(auth.user.id, blockUserId);
      return NextResponse.json({
        success: true,
        message: 'User successfully blocked. You will not see their listings.',
      });
    }

    if (action === 'report' && reportedProfileId && reason) {
      const report = ServerDatabase.reportCompanionProfile({
        reporterId: auth.user.id,
        reporterName: auth.user.fullName || 'Customer',
        reportedProfileId,
        reason,
        details: details || '',
      });

      return NextResponse.json({
        success: true,
        message: 'Report submitted confidentially to Trust & Safety. Investigation initiated.',
        report,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid safety action or missing parameters.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Safety action failed.' }, { status: 500 });
  }
}
