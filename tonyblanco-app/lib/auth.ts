// lib/auth.ts
const AUTH_TOKEN_KEY = 'authToken';

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
