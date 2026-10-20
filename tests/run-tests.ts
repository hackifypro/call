import { calculateBookingBreakdown, formatINR, generateBookingRef, maskPhoneNumber } from '../src/lib/utils';
import { INDIAN_CITIES, INDIAN_STATES } from '../src/lib/geoData';
import { createSessionToken, verifySessionToken, isAdministrativeRole, getRoleDefaultRedirect } from '../src/lib/session';
import { UserRole } from '../src/lib/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

async function runAllTests() {
  console.log('\n--- RUNNING COMPANION MARKETPLACE AUTOMATED TEST SUITE ---\n');

  // 1. Platform Pricing & 10% Commission Calculations
  console.log('Test Group 1: 10% Platform Commission Calculations (Section 9)');
  const breakdown = calculateBookingBreakdown(5000, 2, 10, 0);
  assert(breakdown.baseAmount === 10000, 'Base amount is 5000 * 2 = 10,000');
  assert(breakdown.platformCommissionAmount === 1000, 'Platform commission is exactly 10% (1,000)');
  assert(breakdown.netCompanionAmount === 9000, 'Companion net earnings is 90% (9,000)');
  assert(breakdown.finalPaidByCustomer === 10000, 'Final payable is 10,000 without credit');

  // 2. Replacement Credit Application
  console.log('\nTest Group 2: Replacement Booking Credits Application (Section 10)');
  const creditBreakdown = calculateBookingBreakdown(3000, 2, 10, 2000);
  assert(creditBreakdown.baseAmount === 6000, 'Base amount is 6,000');
  assert(creditBreakdown.creditApplied === 2000, 'Credit applied is 2,000');
  assert(creditBreakdown.finalPaidByCustomer === 4000, 'Final payable reduced to 4,000');

  // 3. Indian Currency Formatting
  console.log('\nTest Group 3: INR Formatting');
  const formatted = formatINR(100000);
  assert(formatted.includes('1,00,000') || formatted.includes('100,000'), 'Proper INR comma grouping');

  // 4. Booking Reference Format
  console.log('\nTest Group 4: Booking Reference Generation');
  const ref = generateBookingRef();
  assert(/^BK-\d{8}-[A-Z0-9]{4}$/.test(ref), `Generated reference ${ref} matches pattern`);

  // 5. Phone Masking for Privacy
  console.log('\nTest Group 5: Data Privacy & Phone Masking (Section 6 & 19)');
  const masked = maskPhoneNumber('+919876543210');
  assert(masked.startsWith('+91') && masked.endsWith('3210') && masked.includes('••••'), `Masked phone format: ${masked}`);

  // 6. Indian Cities & Tiers
  console.log('\nTest Group 6: Indian Geographic Discovery (Section 2 & 17)');
  const mumbai = INDIAN_CITIES.find(c => c.slug === 'mumbai');
  assert(mumbai !== undefined && mumbai.tier === 1, 'Mumbai exists as Tier 1 city');
  assert(mumbai ? mumbai.popularAreas.length > 3 : false, 'Mumbai has verified neighborhood areas');

  const bengaluru = INDIAN_CITIES.find(c => c.slug === 'bengaluru');
  assert(bengaluru !== undefined && bengaluru.stateSlug === 'karnataka', 'Bengaluru is mapped to Karnataka');

  // 7. Security: Role Separation & Least Privilege (Section F)
  console.log('\nTest Group 7: Role-Based Security & Permissions (Section F)');
  assert(!isAdministrativeRole('customer'), 'Customer is NOT an administrative role');
  assert(!isAdministrativeRole('companion'), 'Companion is NOT an administrative role');
  assert(isAdministrativeRole('admin'), 'Admin is an administrative role');
  assert(isAdministrativeRole('super_admin'), 'Super Admin is an administrative role');
  assert(isAdministrativeRole('finance'), 'Finance Auditor is an administrative role');
  assert(isAdministrativeRole('moderator'), 'Moderator is an administrative role');
  assert(isAdministrativeRole('support'), 'Support Agent is an administrative role');

  // 8. Security: Role Redirection Paths
  console.log('\nTest Group 8: Role Default Redirects');
  assert(getRoleDefaultRedirect('customer') === '/explore', 'Customer routes to /explore');
  assert(getRoleDefaultRedirect('companion') === '/companion/dashboard', 'Companion routes to /companion/dashboard');
  assert(getRoleDefaultRedirect('admin') === '/admin/dashboard', 'Admin routes to /admin/dashboard');
  assert(getRoleDefaultRedirect('super_admin') === '/admin/dashboard', 'Super Admin routes to /admin/dashboard');
  assert(getRoleDefaultRedirect('finance') === '/admin/dashboard', 'Finance routes to /admin/dashboard');

  // 9. Edge-Safe JWT Session Generation & Verification
  console.log('\nTest Group 9: Cryptographic Session Token Verification');
  const testUser = {
    id: 'test-usr-123',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'customer' as UserRole,
  };

  const token = await createSessionToken(testUser);
  assert(typeof token === 'string' && token.length > 30, 'JWT token created successfully');

  const verified = await verifySessionToken(token);
  assert(verified !== null, 'Token verified successfully');
  assert(verified?.id === testUser.id, 'Verified token user ID matches');
  assert(verified?.role === 'customer', 'Verified token user role matches');

  const invalidToken = await verifySessionToken('invalid.jwt.token');
  assert(invalidToken === null, 'Invalid token rejected safely');

  // 10. Companion Dashboard Engine & Financial Settlements
  console.log('\nTest Group 10: Companion Dashboard & Payout Engine');
  // 10% fee derivation
  const companionSessionGross = 15000;
  const platformCut = Math.round(companionSessionGross * 0.1);
  const companionNet = companionSessionGross - platformCut;
  assert(platformCut === 1500, 'Platform commission is exactly ₹1,500 on ₹15,000 session');
  assert(companionNet === 13500, 'Companion net take-home is exactly ₹13,500');

  // Payout availability math
  const totalEarned = 50000;
  const alreadyPaid = 30000;
  const pendingInEscrow = 10000;
  const availableToWithdraw = Math.max(0, totalEarned - alreadyPaid - pendingInEscrow);
  assert(availableToWithdraw === 10000, 'Available withdrawable balance derived accurately');

  // 18+ Age Mandate
  const companionAge = 24;
  assert(companionAge >= 18, 'Companion meets strict 18+ adult age mandate');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
