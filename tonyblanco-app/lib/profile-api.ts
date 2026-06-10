/**
 * Profile API Client
 *
 * Functions to interact with profile-related endpoints.
 */

import { getApiBaseUrl } from './api-base';

const API_BASE_URL = getApiBaseUrl();

// Obtiene el token de autenticación
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Headers con autenticación
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
  };
}

export interface MyProfile {
  clinical_mode_requested: boolean;
  clinical_mode_enabled: boolean;
  can_use_clinical_lexicon: boolean;
  [key: string]: unknown;
}

export async function fetchMyProfile(): Promise<MyProfile> {
  const response = await fetch(`${API_BASE_URL}/profile/me/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('No se pudo cargar el perfil');
  }
  return response.json() as Promise<MyProfile>;
}

export interface ProfileUpdateData {
  full_name?: string;
  birth_date?: string;
  birth_city?: string;
  birth_country?: string;
  phone?: string;
  // Note: The backend UpdateProfileView may need extension to support full_name and birth_date
  // Currently it only updates phone and birth_data fields
}

/**
 * Subset of /api/profile/me/ fields relevant to the Modo Híbrido clinical gate.
 * The clinical flags are read-only from the client's perspective (managed by
 * admins after credential verification).
 */
export interface MyProfile {
  user_type?: string | null;
  clinical_mode_requested?: boolean | null;
  clinical_mode_enabled?: boolean | null;
  can_use_clinical_lexicon?: boolean | null;
  [key: string]: unknown;
}

/**
 * Fetch the current user's profile (/api/profile/me/).
 *
 * @returns The profile payload, including clinical-mode flags.
 * @throws Error if request fails
 */
export async function fetchMyProfile(): Promise<MyProfile> {
  const response = await fetch(`${API_BASE_URL}/profile/me/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: string; message?: string }).error ||
        (errorData as { message?: string }).message ||
        'Error al obtener el perfil',
    );
  }

  return response.json();
}

/**
 * Update user profile
 *
 * @param data Profile data to update
 * @returns Updated profile response
 * @throws Error if request fails
 */
export async function updateProfile(data: ProfileUpdateData): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/profile/me/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error al actualizar el perfil');
  }

  return response.json();
}
