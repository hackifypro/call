import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';
import { INDIAN_STATES } from '@/lib/geoData';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'moderator']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const cities = ServerDatabase.getCities();
  return NextResponse.json({
    success: true,
    states: INDIAN_STATES,
    cities,
  });
}

export async function PATCH(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'moderator']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { cityId } = body;

    if (typeof cityId !== 'number') {
      return NextResponse.json({ success: false, error: 'City ID is required.' }, { status: 400 });
    }

    const ok = ServerDatabase.toggleCityServed(cityId, authCheck.user.email);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'City not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'City coverage status toggled.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
