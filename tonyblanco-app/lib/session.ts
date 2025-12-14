/**
 * Session Service
 * 
 * Provides a minimal way to fetch authenticated user session from backend.
 * No caching, no state management - just plain fetch with credentials.
 */

import { clearAuthState } from './auth-state';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: {
    user_type?: 'admin' | 'therapist' | 'personal' | 'patient';
    role?: 'admin' | 'therapist' | 'personal' | 'patient';
    full_name?: string;
    [key: string]: any;
  };
  role?: 'admin' | 'therapist' | 'personal' | 'patient';
  user_type?: 'admin' | 'therapist' | 'personal' | 'patient';
  [key: string]: any;
}

export interface SessionResponse {
  isAuthenticated: boolean;
  user: SessionUser | null;
}

/**
 * Fetches the current user session from the backend.
 * 
 * @returns SessionResponse with isAuthenticated flag and user object
 * 
 * Rules:
 * - If request succeeds → return authenticated user
 * - If request fails (401 or network error) → return { isAuthenticated: false, user: null }
 * - No caching - always makes fresh request
 * - Uses credentials from localStorage (authToken)
 * - On 401: clears auth state and dispatches 'auth:invalid-token' event
 */
export async function fetchSession(): Promise<SessionResponse> {
  // Only run in browser
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null };
  }

  // Get auth token from localStorage
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    // No token - user is not authenticated
    return { isAuthenticated: false, user: null };
  }

  try {
    const response = await fetch(`${API_URL}/me/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // If successful, return the real user from backend
    if (response.ok && response.status !== 401) {
      const user = await response.json();
      console.log('✅ /api/me returned real user:', user.username);
      return {
        isAuthenticated: true,
        user,
      };
    }

    // Token invalid or expired (401) - HARD RESET
    if (response.status === 401) {
      console.warn('⚠️ Token inválido detectado (401) - limpiando estado de autenticación');
      clearAuthState();
      // Trigger a custom event so components can react (e.g., redirect to login)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:invalid-token'));
      }
      return { isAuthenticated: false, user: null };
    }

    // Other errors
    console.error('❌ /api/me failed:', response.status, response.statusText);
    const errorText = await response.text().catch(() => '');
    console.error('Error response:', errorText);
    
    return { isAuthenticated: false, user: null };
  } catch (error) {
    // Network errors, etc.
    // IMPORTANT: If we have a token, this is a REAL network error - don't bypass!
    console.error('❌ Session fetch error (network):', error);
    
    // Only use bypass if NO token was provided (already handled above)
    return { isAuthenticated: false, user: null };
  }
}

