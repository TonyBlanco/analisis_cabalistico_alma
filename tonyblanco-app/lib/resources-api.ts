/**
 * Resources API Client
 * 
 * Minimal API client for resources (PDF, Audio, Video).
 * Backend endpoints to be implemented:
 * - GET /api/resources/ - List resources (filtered by role)
 * - POST /api/resources/ - Create resource (therapist/admin only)
 * - GET /api/resources/{id}/ - Get resource detail
 * - PATCH /api/resources/{id}/ - Update resource (therapist/admin only)
 * - DELETE /api/resources/{id}/ - Delete resource (therapist/admin only)
 * - POST /api/resources/{id}/assign/ - Assign resource to patient (therapist only)
 * - GET /api/resources/assigned/ - Get assigned resources (patient only)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
  };
}

export interface Resource {
  id: number;
  title: string;
  description?: string;
  resource_type: 'pdf' | 'audio' | 'video' | 'class' | 'session';
  file_url?: string; // For PDF, audio, video
  external_link?: string; // For class/session (Zoom, WhatsApp, Google Meet, etc.)
  access_level: 'free' | 'assigned' | 'paid';
  file_size?: number;
  duration?: number; // For audio/video
  created_at: string;
  updated_at: string;
  created_by?: number;
  assigned_to?: number[]; // Patient IDs
  therapist_notes?: string; // Notes for assigned resources
}

export interface ResourceAssignment {
  resource_id: number;
  patient_id: number;
}

/**
 * Get all resources accessible to current user
 */
export async function getResources(): Promise<Resource[]> {
  const response = await fetch(`${API_BASE_URL}/resources/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener recursos');
  }

  return response.json();
}

/**
 * Get assigned resources (for patients)
 */
export async function getAssignedResources(): Promise<Resource[]> {
  const response = await fetch(`${API_BASE_URL}/resources/assigned/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener recursos asignados');
  }

  return response.json();
}

/**
 * Assign resource to patient (therapist only)
 */
export async function assignResourceToPatient(
  resourceId: number, 
  patientId: number,
  notes?: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/assign/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      patient_id: patientId,
      notes: notes || '',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Error al asignar recurso');
  }
}

/**
 * Update assignment notes (therapist only)
 */
export async function updateAssignmentNotes(
  resourceId: number,
  patientId: number,
  notes: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/assign/${patientId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar notas');
  }
}

/**
 * Unassign resource from patient (therapist only)
 */
export async function unassignResourceFromPatient(
  resourceId: number,
  patientId: number
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/assign/${patientId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al desasignar recurso');
  }
}

/**
 * Get resource detail
 */
export async function getResource(resourceId: number): Promise<Resource> {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener recurso');
  }

  return response.json();
}
