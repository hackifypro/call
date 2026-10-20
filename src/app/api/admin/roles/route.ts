import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const roles = ServerDatabase.getRolePermissions();
  return NextResponse.json({ success: true, roles });
}

export async function PATCH(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { role, permissions } = body;

    if (!role || !Array.isArray(permissions)) {
      return NextResponse.json({ success: false, error: 'Role and permissions array are required.' }, { status: 400 });
    }

    const ok = ServerDatabase.updateRolePermissions(role, permissions, authCheck.user.email);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Role not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Permissions updated for role '${role}'.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
