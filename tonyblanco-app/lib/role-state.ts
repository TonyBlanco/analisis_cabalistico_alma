/**
 * Role State Management
 * 
 * Manages active role selection and persistence.
 * Supports users with multiple roles.
 */

export type UserRole = 'admin' | 'therapist' | 'personal' | 'patient';

const ACTIVE_ROLE_KEY = 'active_role';

/**
 * Get active role from localStorage
 */
export function getActiveRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  const role = localStorage.getItem(ACTIVE_ROLE_KEY);
  return role as UserRole | null;
}

/**
 * Set active role in localStorage
 */
export function setActiveRole(role: UserRole): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_ROLE_KEY, role);
}

/**
 * Clear active role
 */
export function clearActiveRole(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_ROLE_KEY);
}

