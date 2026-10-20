import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const coupons = ServerDatabase.getCoupons();
  return NextResponse.json({ success: true, coupons });
}

export async function POST(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { code, discountPercentage, maxDiscount, minBookingValue, description } = body;

    if (!code || typeof discountPercentage !== 'number') {
      return NextResponse.json({ success: false, error: 'Coupon code and discount % are required.' }, { status: 400 });
    }

    const created = ServerDatabase.createCoupon(
      {
        code: code.trim().toUpperCase(),
        discountPercentage,
        maxDiscount: maxDiscount || 1000,
        minBookingValue: minBookingValue || 2000,
        description: description || 'Promotional Discount',
        isActive: true,
      },
      authCheck.user.email
    );

    return NextResponse.json({ success: true, message: 'Coupon created successfully.', coupon: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
