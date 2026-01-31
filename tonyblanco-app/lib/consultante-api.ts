/**
 * Consultante API Client
 * 
 * Provides API functions for the new unified Consultante system.
 * Includes compatibility functions for legacy Patient API calls.
 * 
 * Ver: docs/UNIFIED_CONSULTANTE_ARCHITECTURE.md
 */

import { getApiBaseUrl } from './api-base';

// ==============================================================================
// TYPES & INTERFACES
// ==============================================================================

export interface ConsultanteUserAccount {
  id: number;
  username: string;
  email: string;
}

export interface ConsultanteTherapist {
  id: number;
  username: string;
  full_name: string;
}

export interface Consultante {
  // Primary key
  uuid: string;
  
  // Identidad personal
  full_name: string;
  email: string;
  phone?: string | null;
  
  // Datos de nacimiento
  birth_date?: string | null;
  birth_time?: string | null;
  birth_place?: string | null;
  birth_city?: string | null;
  birth_country?: string | null;
  birth_latitude?: number | null;
  birth_longitude?: number | null;
  birth_timezone?: string | null;
  
  // Identidad biológica
  biological_sex: 'male' | 'female' | 'intersex' | 'unknown';
  gender_identity?: string | null;
  
  // Relaciones (anidadas)
  therapist: ConsultanteTherapist;
  user_account: ConsultanteUserAccount;
  
  // Estado terapéutico
  therapy_status: 'active' | 'paused' | 'completed' | 'archived';
  pause_reason?: string | null;
  therapy_level: string;
  
  // Historia clínica
  main_complaint?: string | null;
  clinical_history?: string | null;
  treatment_plan?: string | null;
  
  // Consentimientos
  consent_federation: boolean;
  consent_federation_date?: string | null;
  
  // Metadatos
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avatar?: string | null;
  
  // Campos de compatibilidad legacy (SIEMPRE disponibles)
  id: number;       // alias de user_account.id
  user_id: number;  // alias de user_account.id
  user: {
    id: number;
    username: string;
  };
  legacy_patient_id?: number | null;
}

export interface ConsultanteCreateData {
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  birth_city?: string;
  birth_country?: string;
  biological_sex?: 'male' | 'female' | 'intersex' | 'unknown';
  gender_identity?: string;
  main_complaint?: string;
  therapy_level?: string;
}

export interface ConsultanteHealthCheck {
  total_consultantes: number;
  consultantes_without_user: number;
  active_consultantes: number;
  therapist_consultantes: number;
  status: 'healthy' | 'warning';
}

// ==============================================================================
// AUTH HELPERS
// ==============================================================================

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('token') 
    : null;
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Token ${token}` }),
  };
}

// ==============================================================================
// API FUNCTIONS
// ==============================================================================

/**
 * List all consultantes for the authenticated therapist
 */
export async function listConsultantes(): Promise<Consultante[]> {
  const response = await fetch(`${getApiBaseUrl()}/consultantes/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || 'Error al listar consultantes');
  }
  
  return response.json();
}

/**
 * Get a single consultante by UUID
 */
export async function getConsultante(uuid: string): Promise<Consultante> {
  const response = await fetch(`${getApiBaseUrl()}/consultantes/${uuid}/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || 'Error al obtener consultante');
  }
  
  return response.json();
}

/**
 * Create a new consultante
 * 
 * Auto-creates user_account based on email
 */
export async function createConsultante(data: ConsultanteCreateData): Promise<Consultante> {
  const response = await fetch(`${getApiBaseUrl()}/consultantes/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || error.email?.[0] || 'Error al crear consultante');
  }
  
  return response.json();
}

/**
 * Update a consultante
 */
export async function updateConsultante(
  uuid: string, 
  data: Partial<ConsultanteCreateData>
): Promise<Consultante> {
  const response = await fetch(`${getApiBaseUrl()}/consultantes/${uuid}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || 'Error al actualizar consultante');
  }
  
  return response.json();
}

/**
 * Archive a consultante (soft delete)
 */
export async function archiveConsultante(uuid: string): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/consultantes/${uuid}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || 'Error al archivar consultante');
  }
}

/**
 * Resolve consultante by legacy ID (user_account.id or legacy_patient_id)
 * 
 * Used for compatibility with legacy frontend code that uses integer IDs
 */
export async function resolveConsultanteByLegacyId(legacyId: number): Promise<Consultante> {
  const response = await fetch(`${getApiBaseUrl()}/consultantes/resolve/${legacyId}/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || 'Consultante no encontrado');
  }
  
  return response.json();
}

/**
 * Get system health check for consultantes
 */
export async function getConsultanteHealth(): Promise<ConsultanteHealthCheck> {
  const response = await fetch(`${getApiBaseUrl()}/consultantes/health/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || 'Error al verificar estado del sistema');
  }
  
  return response.json();
}

// ==============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// ==============================================================================

/**
 * Get patient detail (LEGACY COMPATIBILITY)
 * 
 * Maps to Consultante API with legacy response format.
 * Use getConsultante() for new code.
 * 
 * @deprecated Use getConsultante() or resolveConsultanteByLegacyId() instead
 */
export async function getPatientDetail(patientId: number): Promise<{
  id: number;
  full_name: string;
  email: string;
  user_id: number | null;
  user: { id: number; username: string } | null;
  therapy_status: string;
  uuid: string | null;
  biological_sex: string;
  birth_date: string | null;
  birth_city: string | null;
  birth_country: string | null;
}> {
  // Primero intentar resolver mediante el endpoint de Consultante (compatibilidad)
  let response = await fetch(`${getApiBaseUrl()}/consultantes/resolve/${patientId}/`, {
    headers: getAuthHeaders(),
  });

  if (response.ok) {
    return response.json();
  }

  // Fallback: consultar endpoint legacy si la resolución no funcionó
  response = await fetch(`${getApiBaseUrl()}/therapist/patients/${patientId}/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || 'Paciente no encontrado');
  }

  return response.json();
}

/**
 * List patients (LEGACY COMPATIBILITY)
 * 
 * Returns consultantes in legacy Patient format.
 * Use listConsultantes() for new code.
 * 
 * @deprecated Use listConsultantes() instead
 */
export async function listPatients(): Promise<Consultante[]> {
  return listConsultantes();
}

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

/**
 * Get user_id from a consultante (for assignments)
 * 
 * IMPORTANT: Assignments use user_id (integer), NOT uuid
 */
export function getConsultanteUserId(consultante: Consultante): number {
  return consultante.user_id ?? consultante.id ?? consultante.user_account?.id;
}

/**
 * Format consultante for display
 */
export function formatConsultanteDisplay(consultante: Consultante): string {
  return consultante.full_name;
}

/**
 * Check if a consultante has complete birth data for astrological analysis
 */
export function hasCompleteBirthData(consultante: Consultante): boolean {
  return !!(
    consultante.birth_date &&
    consultante.birth_city &&
    consultante.birth_country &&
    consultante.birth_latitude &&
    consultante.birth_longitude
  );
}
