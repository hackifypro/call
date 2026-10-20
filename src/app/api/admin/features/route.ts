import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const features = ServerDatabase.getFeatureSettings();
  return NextResponse.json({ success: true, features });
}

export async function PATCH(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const updates = await request.json();
    const updated = ServerDatabase.updateFeatureSettings(updates, authCheck.user.email);
    return NextResponse.json({ success: true, message: 'Feature configuration saved.', features: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
