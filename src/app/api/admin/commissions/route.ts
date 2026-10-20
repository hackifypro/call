import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const ledger = ServerDatabase.getCommissionLedger();
  const settings = ServerDatabase.getFeatureSettings();

  const totalGross = ledger.reduce((sum, e) => sum + (e.grossBookingAmount || 0), 0);
  const totalCommission = ledger.reduce((sum, e) => sum + (e.platformCommission || 0), 0);
  const totalCompanionPayout = ledger.reduce((sum, e) => sum + (e.companionPayoutAmount || 0), 0);

  return NextResponse.json({
    success: true,
    currentRate: settings.platformCommissionRate,
    summary: {
      totalGross,
      totalCommission,
      totalCompanionPayout,
      totalTransactions: ledger.length,
    },
    ledger,
  });
}

export async function POST(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { ratePercentage, reason } = body;

    if (typeof ratePercentage !== 'number' || ratePercentage < 1 || ratePercentage > 30) {
      return NextResponse.json(
        { success: false, error: 'Commission rate must be a valid percentage between 1% and 30%.' },
        { status: 400 }
      );
    }

    ServerDatabase.updateFeatureSettings({ platformCommissionRate: ratePercentage }, authCheck.user.email);

    ServerDatabase.recordAuditLog({
      adminEmail: authCheck.user.email,
      action: 'UPDATE_COMMISSION_RATE',
      targetType: 'commission',
      targetId: 'global_rate',
      details: `Platform commission rate set to ${ratePercentage}%. Reason: ${reason || 'Statutory review'}`,
    });

    return NextResponse.json({
      success: true,
      message: `Commission rate successfully updated to ${ratePercentage}%.`,
      newRate: ratePercentage,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
