import bcrypt from 'bcryptjs';
import { UserRole } from './types';
export * from './session';

/**
 * Hashes a plaintext password using bcrypt with 10 salt rounds (Node.js runtime only)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Compares plaintext password against stored bcrypt hash in constant time
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
}

/**
 * Validates role-based permissions using least-privilege matrix
 */
export function hasPermission(
  userRole: UserRole,
  allowedRoles: UserRole[] | UserRole
): boolean {
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(userRole);
  }
  return userRole === allowedRoles;
}
