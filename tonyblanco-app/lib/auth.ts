// lib/auth.ts
import { API_BASE_URL } from './api';

const AUTH_TOKEN_KEY = 'authToken';

export interface MembershipStatus {
  membership_active: boolean;
  user_type: 'personal' | 'therapist';
  subscription_status: 'trial' | 'active' | 'canceled' | 'expired';
  subscription_plan: string;
  membership_expires: string | null;
  can_access_dashboard: boolean;
  can_create_ficha: boolean;
  is_superuser?: boolean;  // Flag para identificar superusuario
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// Token de prueba para desarrollo
const DEV_TOKEN = '08838cdb0140454c5fcbbc2164b6a8cb4f0c7cf5';

export function loginForTesting(): void {
  setAuthToken(DEV_TOKEN);
}

export function logout(): void {
  removeAuthToken();
}

// Nuevas funciones de verificación de membresía
export async function checkMembership(token: string): Promise<MembershipStatus | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/check-membership/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking membership:', error);
    return null;
  }
}

export async function requireAuth(redirectTo: string = '/login'): Promise<boolean> {
  const token = getAuthToken();
  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return false;
  }
  return true;
}

export async function requireMembership(
  allowedTypes?: ('personal' | 'therapist')[],
  redirectTo: string = '/membership-expired'
): Promise<MembershipStatus | null> {
  const token = getAuthToken();
  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  const membership = await checkMembership(token);
  
  if (!membership) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  // Verificar si la membresía está activa
  if (!membership.can_access_dashboard) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return null;
  }

  // Verificar tipo de usuario si se especifica
  if (allowedTypes && !allowedTypes.includes(membership.user_type)) {
    if (typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
    return null;
  }

  return membership;
}
