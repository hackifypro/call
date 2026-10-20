import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'moderator', 'support']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status');
  const city = searchParams.get('city');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);

  let companions = ServerDatabase.getCompanions();

  if (search) {
    companions = companions.filter(
      (c) =>
        c.displayName.toLowerCase().includes(search) ||
        (c.legalNamePrivate && c.legalNamePrivate.toLowerCase().includes(search)) ||
        c.cityName.toLowerCase().includes(search)
    );
  }

  if (status && status !== 'all') {
    companions = companions.filter((c) => c.status === status);
  }

  if (city && city !== 'all') {
    companions = companions.filter((c) => c.citySlug === city || c.cityName.toLowerCase() === city.toLowerCase());
  }

  const total = companions.length;
  const paginated = companions.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    success: true,
    companions: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function PATCH(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'moderator']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { companionId, action, rejectionReason } = body;

    if (!companionId) {
      return NextResponse.json({ success: false, error: 'Companion ID is required.' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const ok = ServerDatabase.updateCompanionStatus(companionId, 'approved', undefined, authCheck.user.email);
      if (!ok) return NextResponse.json({ success: false, error: 'Companion profile not found.' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Profile approved and published to live directory.' });
    }

    if (action === 'REJECT') {
      if (!rejectionReason) {
        return NextResponse.json({ success: false, error: 'Rejection reason is required for audit.' }, { status: 400 });
      }
      const ok = ServerDatabase.updateCompanionStatus(companionId, 'rejected', rejectionReason, authCheck.user.email);
      if (!ok) return NextResponse.json({ success: false, error: 'Companion profile not found.' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Profile rejected with audit notification dispatched.' });
    }

    if (action === 'SUSPEND') {
      const ok = ServerDatabase.updateCompanionStatus(companionId, 'suspended', rejectionReason || 'Administrative suspension', authCheck.user.email);
      if (!ok) return NextResponse.json({ success: false, error: 'Companion profile not found.' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Companion profile temporarily suspended.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid verification action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
