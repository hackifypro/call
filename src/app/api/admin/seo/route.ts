import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'moderator']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const seo = ServerDatabase.getSeoConfig();
  return NextResponse.json({ success: true, seo });
}

export async function PATCH(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'moderator']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const updates = await request.json();
    const updated = ServerDatabase.updateSeoConfig(updates, authCheck.user.email);
    return NextResponse.json({ success: true, message: 'SEO configuration updated.', seo: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
