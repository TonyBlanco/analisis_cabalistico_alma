/**
 * User Role Helper
 *
 * Resolves the effective dashboard role from session (/api/me/) with fallbacks.
 */

import { getApiBaseUrl } from './api-base';
import { fetchSession } from './session';

export type UserRole = 'admin' | 'therapist' | 'personal' | 'patient' | null;

const VALID_ROLES = new Set(['admin', 'therapist', 'personal', 'patient']);

function isValidRole(value: unknown): value is Exclude<UserRole, null> {
  return typeof value === 'string' && VALID_ROLES.has(value);
}

function roleFromUserRecord(user: Record<string, unknown>): UserRole {
  // Dashboard route = user_type del perfil (admin workspace usa is_admin aparte)
  if (isValidRole(user.user_type)) return user.user_type;
  if (isValidRole(user.role)) return user.role;

  const profile = user.profile as Record<string, unknown> | undefined;
  if (profile) {
    if (isValidRole(profile.user_type)) return profile.user_type;
    if (isValidRole(profile.role)) return profile.role;
  }

  return null;
}

async function roleFromMembership(token: string): Promise<UserRole> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/check-membership/`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (isValidRole(data?.user_type)) return data.user_type;
  } catch {
    // ignore
  }
  return null;
}

function roleFromLocalStorage(): UserRole {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('userRole');
  return isValidRole(stored) ? stored : null;
}

/**
 * Gets the current user's role from the backend session.
 */
export async function getUserRole(): Promise<UserRole> {
  const session = await fetchSession();

  if (session.isAuthenticated && session.user) {
    const fromUser = roleFromUserRecord(session.user as Record<string, unknown>);
    if (fromUser) return fromUser;
  }

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    const fromMembership = await roleFromMembership(token);
    if (fromMembership) return fromMembership;
  }

  return roleFromLocalStorage();
}