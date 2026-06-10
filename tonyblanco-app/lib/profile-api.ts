/**
 * Profile API Client
 *
 * Functions to interact with profile-related endpoints.
 */

import { getApiBaseUrl } from './api-base';

const API_BASE_URL = getApiBaseUrl();

// Obtiene el token de autenticacion
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Headers con autenticacion
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

/**
 * Subconjunto de /api/profile/me/ relevante para la puerta clinica del Modo
 * Interactivo Asistido (Hibrido).
 *
 * Los flags clinicos son de solo lectura desde el cliente: los gestiona el
 * administrador tras verificar la credencial profesional.
 */
export interface MyProfile {
  user_type?: string | null;
  clinical_mode_requested?: boolean;
  clinical_mode_enabled?: boolean;
  can_use_clinical_lexicon?: boolean;
  [key: string]: unknown;
}

/**
 * Obtiene el perfil del usuario actual (/api/profile/me/).
 *
 * @returns El payload del perfil, incluidos los flags de modo clinico.
 * @throws Error si la peticion falla.
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

export interface ProfileUpdateData {
  full_name?: string;
  birth_date?: string;
  birth_city?: string;
  birth_country?: string;
  phone?: string;
  // Nota: UpdateProfileView del backend podria necesitar extension para soportar
  // full_name y birth_date; actualmente solo actualiza phone y birth_data.
}

/**
 * Actualiza el perfil del usuario.
 *
 * @param data Datos del perfil a actualizar.
 * @returns Respuesta del perfil actualizado.
 * @throws Error si la peticion falla.
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
