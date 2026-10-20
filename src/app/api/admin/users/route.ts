import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { getAllUsers, toggleUserStatus, updateUserRole } from '@/lib/userStore';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'moderator']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const role = searchParams.get('role');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  let users = await getAllUsers();

  if (search) {
    users = users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        (u.phoneNumber && u.phoneNumber.includes(search))
    );
  }

  if (role && role !== 'all') {
    users = users.filter((u) => u.role === role);
  }

  const total = users.length;
  const paginated = users.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    success: true,
    users: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function PATCH(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { userId, action, newRole, isActive } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    if (action === 'TOGGLE_STATUS') {
      const ok = await toggleUserStatus(userId, isActive);
      if (!ok) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });

      ServerDatabase.recordAuditLog({
        adminEmail: authCheck.user.email,
        action: 'USER_STATUS_TOGGLE',
        targetType: 'user',
        targetId: userId,
        details: `Account status updated to ${isActive ? 'ACTIVE' : 'SUSPENDED'}`,
      });

      return NextResponse.json({ success: true, message: 'Status updated.' });
    }

    if (action === 'UPDATE_ROLE') {
      if (!newRole) return NextResponse.json({ success: false, error: 'New role is required.' }, { status: 400 });
      const ok = await updateUserRole(userId, newRole);
      if (!ok) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });

      ServerDatabase.recordAuditLog({
        adminEmail: authCheck.user.email,
        action: 'USER_ROLE_UPDATE',
        targetType: 'user',
        targetId: userId,
        details: `Assigned role ${newRole}`,
      });

      return NextResponse.json({ success: true, message: 'Role updated.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
