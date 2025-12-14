/**
 * Authentication State Management
 * 
 * Utility functions for managing authentication state cleanup.
 */

/**
 * Clears all authentication-related state from:
 * - localStorage
 * - sessionStorage
 * - cookies
 * 
 * This is a hard reset that should be called on:
 * - Logout
 * - Invalid token detection (401)
 * - Security events
 */
export function clearAuthState(): void {
  // Only run in browser
  if (typeof window === 'undefined') {
    return;
  }

  // Clear localStorage (includes authToken and any other auth data)
  localStorage.clear();

  // Clear sessionStorage
  sessionStorage.clear();

  // Clear all cookies
  document.cookie.split(';').forEach((c) => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  });
}
