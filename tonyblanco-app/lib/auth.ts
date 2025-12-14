// lib/auth.ts
import { API_BASE_URL } from './api';

const AUTH_TOKEN_KEY = 'authToken';
const USER_ROLE_KEY = 'userRole';
const USERNAME_KEY = 'username';

export type UserRole = 'therapist' | 'patient' | 'personal' | 'visitor';

export interface MembershipStatus {
  membership_active: boolean;
  user_type: 'personal' | 'therapist' | 'patient' | 'visitor';
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

export function setUserRole(role: UserRole): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ROLE_KEY, role);
  }
}

export function getUserRole(): UserRole | null {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem(USER_ROLE_KEY) as UserRole) || null;
  }
  return null;
}

export function setUsername(username: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERNAME_KEY, username);
  }
}

export function getUsername(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(USERNAME_KEY);
  }
  return null;
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USERNAME_KEY);
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
  clearMembershipCache();
}

// Cache para evitar llamadas repetidas a check-membership
let membershipCache: {
  token: string;
  data: MembershipStatus;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5000; // 5 segundos de caché

// Nuevas funciones de verificación de membresía
export async function checkMembership(token: string, useCache: boolean = true): Promise<MembershipStatus | null> {
  // Verificar caché si está disponible y válido
  if (useCache && membershipCache) {
    const now = Date.now();
    if (
      membershipCache.token === token &&
      (now - membershipCache.timestamp) < CACHE_DURATION
    ) {
      return membershipCache.data;
    }
  }

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

    const data = await response.json();
    
    // Guardar en caché
    membershipCache = {
      token,
      data,
      timestamp: Date.now()
    };

    return data;
  } catch (error) {
    console.error('Error checking membership:', error);
    return null;
  }
}

// Función para limpiar el caché (útil después de logout o cambios de membresía)
export function clearMembershipCache(): void {
  membershipCache = null;
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
  allowedTypes?: ('personal' | 'therapist' | 'patient' | 'visitor')[],
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

// Función para guardar datos de login (token, role, username)
export function saveLoginData(token: string, role: UserRole, username: string): void {
  setAuthToken(token);
  setUserRole(role);
  setUsername(username);
}

// Función para verificar si el usuario tiene un rol específico
export function hasRole(role: UserRole): boolean {
  const userRole = getUserRole();
  return userRole === role;
}

// Función para verificar si el usuario es terapeuta
export function isTherapist(): boolean {
  return hasRole('therapist');
}

// Función para verificar si el usuario es paciente
export function isPatient(): boolean {
  return hasRole('patient');
}
