import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { findUserById, updateUserProfile } from '@/lib/userStore';
import { verifyPassword, hashPassword } from '@/lib/auth';

export async function GET(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const user = await findUserById(auth.user.id);

  return NextResponse.json({
    success: true,
    user: {
      id: auth.user.id,
      email: auth.user.email,
      fullName: user?.fullName || auth.user.fullName,
      phoneNumber: user?.phoneNumber || auth.user.phoneNumber,
      phoneVerified: user?.phoneVerified ?? false,
      role: auth.user.role,
      createdAt: user?.createdAt || new Date().toISOString(),
      notificationPreferences: {
        emailBookings: true,
        smsReminders: true,
        promotions: false,
      },
      privacySettings: {
        hideProfileFromPublic: true,
        anonymizeReviews: false,
      },
    },
  });
}

export async function PATCH(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { fullName, phoneNumber, currentPassword, newPassword } = body;

    const updates: any = {};
    if (fullName) updates.fullName = fullName.trim();
    if (phoneNumber) updates.phoneNumber = phoneNumber.trim();

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, error: 'Current password is required to set a new password.' }, { status: 400 });
      }
      const verified = await verifyPassword(auth.user.email, currentPassword);
      if (!verified) {
        return NextResponse.json({ success: false, error: 'Incorrect current password.' }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ success: false, error: 'New password must be at least 8 characters long.' }, { status: 400 });
      }
      updates.passwordHash = await hashPassword(newPassword);
    }

    if (Object.keys(updates).length > 0) {
      await updateUserProfile(auth.user.id, updates);
    }

    return NextResponse.json({
      success: true,
      message: 'Account settings updated successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update account settings.' }, { status: 500 });
  }
}
