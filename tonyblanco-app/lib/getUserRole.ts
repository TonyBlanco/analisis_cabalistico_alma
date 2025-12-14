/**
 * User Role Helper
 * 
 * Extracts user role from session data.
 * Uses fetchSession() to get current user information.
 */

import { fetchSession } from './session';

export type UserRole = 'admin' | 'therapist' | 'personal' | 'patient' | null;

/**
 * Gets the current user's role from the backend session.
 * 
 * Priority order for role extraction:
 * 1. user.profile.user_type
 * 2. user.profile.role
 * 3. user.user_type
 * 4. user.role
 * 
 * @returns UserRole or null if not authenticated or role cannot be determined
 */
export async function getUserRole(): Promise<UserRole> {
  const session = await fetchSession();

  if (!session.isAuthenticated || !session.user) {
    return null;
  }

  const user = session.user;

  // Priority 1: profile.user_type
  if (user.profile?.user_type) {
    const role = user.profile.user_type;
    if (isValidRole(role)) {
      return role;
    }
  }

  // Priority 2: profile.role
  if (user.profile?.role) {
    const role = user.profile.role;
    if (isValidRole(role)) {
      return role;
    }
  }

  // Priority 3: user.user_type
  if (user.user_type) {
    const role = user.user_type;
    if (isValidRole(role)) {
      return role;
    }
  }

  // Priority 4: user.role
  if (user.role) {
    const role = user.role;
    if (isValidRole(role)) {
      return role;
    }
  }

  // No valid role found
  return null;
}

/**
 * Type guard to validate role value
 */
function isValidRole(value: any): value is UserRole {
  return value === 'admin' || value === 'therapist' || value === 'personal' || value === 'patient';
}

