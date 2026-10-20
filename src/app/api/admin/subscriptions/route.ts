import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  const subscriptions = ServerDatabase.getSubscriptions();
  const features = ServerDatabase.getFeatureSettings();

  return NextResponse.json({
    success: true,
    registrationFee: features.registrationFee,
    isRegistrationFree: features.isRegistrationFree,
    subscriptions,
  });
}

export async function PATCH(request: Request) {
  const authCheck = await authenticateAdminRequest(request, ['super_admin', 'finance']);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { registrationFee, isRegistrationFree, updatedPlans } = body;

    if (typeof registrationFee === 'number') {
      ServerDatabase.updateFeatureSettings(
        { registrationFee, isRegistrationFree: Boolean(isRegistrationFree) },
        authCheck.user.email
      );
    }

    if (Array.isArray(updatedPlans)) {
      ServerDatabase.saveSubscriptions(updatedPlans);
      ServerDatabase.recordAuditLog({
        adminEmail: authCheck.user.email,
        action: 'UPDATE_SUBSCRIPTION_PLANS',
        targetType: 'subscription',
        targetId: 'tiers',
        details: 'Updated subscription tiers configuration',
      });
    }

    return NextResponse.json({ success: true, message: 'Pricing and tier configuration saved.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 500 });
  }
}
