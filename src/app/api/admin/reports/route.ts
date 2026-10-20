import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'moderator', 'support']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const reports = ServerDatabase.getReports();
  return NextResponse.json({ success: true, reports });
}

export async function PATCH(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'moderator']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { reportId, status, resolutionNotes } = body;

    if (!reportId || !status) {
      return NextResponse.json({ success: false, error: 'Report ID and status are required.' }, { status: 400 });
    }

    const ok = ServerDatabase.updateReportStatus(reportId, status, authCheck.user.email, resolutionNotes);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Report not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Report status updated to ${status}.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
