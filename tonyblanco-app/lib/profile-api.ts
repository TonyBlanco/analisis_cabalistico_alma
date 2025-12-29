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
