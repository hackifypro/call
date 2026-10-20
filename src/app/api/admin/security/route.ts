import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const auditLogs = ServerDatabase.getAuditLogs();

  const securityStatus = {
    authProtocol: 'Bcrypt (10 Salt Rounds) + Edge WebCrypto JWT (HS256)',
    sessionExpiry: '7 Days',
    cookieConfig: 'HttpOnly; Secure; SameSite=Lax; Path=/',
    rateLimiting: 'Active (200 requests/min per IP)',
    ipFirewall: 'Enabled (Zero unauthorized edge leaks)',
    totalAuditLogsRecorded: auditLogs.length,
    recentSecurityEvents: auditLogs.slice(0, 50),
  };

  return NextResponse.json({ success: true, securityStatus });
}
