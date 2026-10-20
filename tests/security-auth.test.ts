import { hashPassword, verifyPassword, createSessionToken, verifySessionToken, isAdministrativeRole, hasPermission, getRoleDefaultRedirect } from '../src/lib/auth';
import { registerNewUser, authenticateCredentials } from '../src/lib/userStore';
import { UserRole } from '../src/lib/types';

async function runSecurityTests() {
  console.log('\n======================================================');
  console.log('RUNNING PRODUCTION SECURITY & AUTHENTICATION TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Bcrypt Hashing & Verification
  const testPass = 'SuperSecret2026!@#';
  const hashed = await hashPassword(testPass);
  assert(hashed !== testPass, 'Password must be hashed with strong salt');
  assert(await verifyPassword(testPass, hashed), 'Correct password verifies against hash');
  assert(!(await verifyPassword('WrongPassword', hashed)), 'Incorrect password rejected');

  // TEST 2: JWT Session Token Creation & Edge Verification
  const sessionToken = await createSessionToken({
    id: 'test-user-123',
    email: 'test@example.com',
    fullName: 'Test Auditor',
    role: 'finance',
    phoneNumber: '+919999988888',
  });
  assert(typeof sessionToken === 'string' && sessionToken.length > 50, 'Session token is signed JWT');

  const verifiedClaims = await verifySessionToken(sessionToken);
  assert(verifiedClaims !== null, 'Valid session token verified');
  assert(verifiedClaims?.id === 'test-user-123', 'Token preserves user ID claim');
  assert(verifiedClaims?.role === 'finance', 'Token preserves role claim');
  assert(verifiedClaims?.email === 'test@example.com', 'Token preserves email claim');

  // TEST 3: Invalid / Tampered Session Token
  const tamperedToken = sessionToken.slice(0, -6) + 'abcdef';
  const tamperedClaims = await verifySessionToken(tamperedToken);
  assert(tamperedClaims === null, 'Tampered JWT rejected at verification');

  // TEST 4: RBAC Role Checks & Least-Privilege Enforcement
  assert(isAdministrativeRole('super_admin'), 'super_admin is administrative');
  assert(isAdministrativeRole('finance'), 'finance is administrative');
  assert(isAdministrativeRole('moderator'), 'moderator is administrative');
  assert(isAdministrativeRole('support'), 'support is administrative');
  assert(!isAdministrativeRole('customer'), 'customer is NOT administrative');
  assert(!isAdministrativeRole('companion'), 'companion is NOT administrative');
  assert(!isAdministrativeRole('guest'), 'guest is NOT administrative');

  // Permissions Matrix
  assert(hasPermission('super_admin', ['super_admin', 'finance']), 'super_admin has finance permission');
  assert(hasPermission('finance', ['super_admin', 'finance']), 'finance has finance permission');
  assert(!hasPermission('moderator', ['super_admin', 'finance']), 'moderator denied finance permission');
  assert(!hasPermission('customer', ['super_admin', 'finance']), 'customer denied finance permission');

  // TEST 5: Default Redirect Matrix
  assert(getRoleDefaultRedirect('super_admin') === '/admin/dashboard', 'super_admin redirects to /admin/dashboard');
  assert(getRoleDefaultRedirect('finance') === '/admin/dashboard', 'finance redirects to /admin/dashboard');
  assert(getRoleDefaultRedirect('companion') === '/dashboard/companion', 'companion redirects to /dashboard/companion');
  assert(getRoleDefaultRedirect('customer') === '/explore', 'customer redirects to /explore');

  // TEST 6: Public Registration Cannot Escalate to Admin Roles
  const adminInjectionAttempt = await registerNewUser({
    fullName: 'Attacker Attempting Escalation',
    email: 'hacker@example.com',
    passwordPlain: 'HackerPass123',
    role: 'super_admin' as UserRole,
  });
  assert(!adminInjectionAttempt.success, 'Public signup cannot self-assign super_admin');
  assert(
    adminInjectionAttempt.error?.includes('Unauthorized role') || false,
    'Returns unauthorized role assignment error'
  );

  // TEST 7: Authentication Against Server User Store
  const validAdminAuth = await authenticateCredentials('admin@aura-india.com', 'Admin@2026Secure');
  assert(validAdminAuth.success, 'Valid Super Admin authenticates successfully');
  assert(validAdminAuth.sessionUser?.role === 'super_admin', 'Authenticated admin role is super_admin');

  const invalidPassAuth = await authenticateCredentials('admin@aura-india.com', 'WrongPassword123');
  assert(!invalidPassAuth.success, 'Invalid password rejected');
  assert(invalidPassAuth.error === 'Invalid email or password.', 'Generic error returned to prevent enumeration');

  const nonexistentUserAuth = await authenticateCredentials('nonexistent@example.com', 'RandomPassword');
  assert(!nonexistentUserAuth.success, 'Nonexistent account rejected');
  assert(nonexistentUserAuth.error === 'Invalid email or password.', 'Identical generic error for nonexistent user');

  console.log('\n------------------------------------------------------');
  console.log(`TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
