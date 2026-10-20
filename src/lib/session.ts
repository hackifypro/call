import { SignJWT, jwtVerify } from 'jose';
import { UserRole, SessionUser, ADMIN_ROLES } from './types';

export const AUTH_COOKIE_NAME = 'aura_session_token';

// Secret key for JWT signing (Edge Runtime and Node.js compatible via Web Crypto)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'aura-companion-platform-secure-jwt-secret-2026-production-grade'
);

const TOKEN_EXPIRY = '7d'; // 7 days session duration

/**
 * Generates an encrypted session JWT with user claims and expiration
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phoneNumber: user.phoneNumber,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Validates a session JWT token and extracts verified user claims.
 * 100% Edge-safe without any Node.js crypto/bcrypt dependencies.
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload || !payload.id || !payload.role) {
      return null;
    }
    return {
      id: payload.id as string,
      email: (payload.email as string) || '',
      fullName: (payload.fullName as string) || '',
      role: payload.role as UserRole,
      phoneNumber: payload.phoneNumber as string | undefined,
    };
  } catch {
    return null; // invalid or expired
  }
}

/**
 * Checks if user role has administrative privileges
 */
export function isAdministrativeRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Authenticates an incoming API request and enforces administrative role requirements
 */
export async function authenticateAdminRequest(
  request: Request,
  allowedRoles?: UserRole[]
): Promise<{ authorized: true; user: SessionUser } | { authorized: false; status: number; error: string }> {
  const cookieHeader = request.headers.get('cookie') || '';
  let token = '';

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const found = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (found) {
    token = found.split('=')[1];
  } else {
    token = request.headers.get('authorization')?.replace('Bearer ', '') || '';
  }

  if (!token) {
    return { authorized: false, status: 401, error: 'Authentication required. No session token provided.' };
  }

  const user = await verifySessionToken(token);
  if (!user) {
    return { authorized: false, status: 401, error: 'Invalid or expired session token.' };
  }

  if (!isAdministrativeRole(user.role)) {
    return { authorized: false, status: 403, error: 'Forbidden. Administrative privileges required.' };
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'super_admin') {
    return {
      authorized: false,
      status: 403,
      error: `Forbidden. Role '${user.role}' lacks permission for this administrative module.`,
    };
  }

  return { authorized: true, user };
}

/**
 * Authenticates an incoming API request and returns verified customer session.
 * Rejects unauthenticated callers and companions attempting to access customer data.
 */
export async function authenticateCustomerRequest(
  request: Request
): Promise<{ authorized: true; user: SessionUser } | { authorized: false; status: number; error: string }> {
  const cookieHeader = request.headers.get('cookie') || '';
  let token = '';

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const found = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (found) {
    token = found.split('=')[1];
  } else {
    token = request.headers.get('authorization')?.replace('Bearer ', '') || '';
  }

  if (!token) {
    return { authorized: false, status: 401, error: 'Authentication required. Please sign in.' };
  }

  const user = await verifySessionToken(token);
  if (!user) {
    return { authorized: false, status: 401, error: 'Invalid or expired session. Please sign in again.' };
  }

  // Prevent companions from accessing customer records
  if (user.role === 'companion') {
    return { authorized: false, status: 403, error: 'Forbidden. Companion accounts cannot access customer endpoints.' };
  }

  return { authorized: true, user };
}

/**
 * Role specific landing redirects upon successful authentication
 */
export function getRoleDefaultRedirect(role: UserRole): string {
  switch (role) {
    case 'admin':
    case 'super_admin':
    case 'finance':
    case 'moderator':
    case 'support':
      return '/admin/dashboard';
    case 'companion':
      return '/companion/dashboard';
    case 'customer':
      return '/explore';
    default:
      return '/explore';
  }
}
