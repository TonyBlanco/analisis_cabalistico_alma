// lib/admin-api.ts
// API services for Admin Dashboard
// All endpoints connect to existing Django backend

import { API_BASE_URL } from './api';
import { getAuthToken } from './auth';

export interface AdminStats {
  total_users: number;
  active_memberships: number;
  pending_payments: number;
  total_tests: number;
  total_test_results: number;
  revenue_this_month: number;
  new_users_this_week: number;
  therapists: number;
  personal_users: number;
  total_fichas: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  profile: {
    full_name: string;
    user_type: 'personal' | 'therapist' | 'patient' | 'visitor';
    membership_active: boolean;
    membership_expires: string | null;
    subscription_plan: string;
    subscription_status: 'trial' | 'active' | 'canceled' | 'expired';
    phone?: string;
    birth_date?: string;
    profession?: string;
    license_number?: string;
  };
  stats?: {
    fichas_count: number;
    test_results_count: number;
    tests_used: Array<{
      test_name: string;
      uses_count: number;
      last_used: string | null;
    }>;
  };
}

export interface TestModule {
  id: number;
  code: string;
  name: string;
  description: string;
  test_type: string;
  required_access_level: string;
  is_active: boolean;
  available_for_therapists: boolean;
  available_for_personal: boolean;
  uses_per_month: number | null;
  requires_license: boolean;
}

export interface Patient {
  id: number;
  full_name: string;
  email: string;
  therapist_username: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Verifica si el usuario actual es administrador
 */
export async function checkAdminAccess(): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) return false;

    const response = await fetch(`${API_BASE_URL}/admin/check/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

/**
 * Obtiene estadísticas generales del sistema
 */
export async function getAdminStats(): Promise<AdminStats> {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token');

  const response = await fetch(`${API_BASE_URL}/admin/stats/`, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin stats');
  }

  return response.json();
}

/**
 * Obtiene lista de todos los usuarios
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token');

  const response = await fetch(`${API_BASE_URL}/admin/users/`, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

/**
 * Obtiene detalle de un usuario específico
 */
export async function getAdminUserDetail(userId: number): Promise<AdminUser> {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token');

  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/`, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user detail');
  }

  return response.json();
}

/**
 * Actualiza un usuario (activar/desactivar, cambiar plan, etc.)
 */
export async function updateAdminUser(
  userId: number,
  updates: {
    email?: string;
    is_active?: boolean;
    membership_active?: boolean;
    subscription_plan?: string;
    subscription_status?: 'trial' | 'active' | 'canceled' | 'expired';
  }
): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token');

  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }
}

/**
 * Elimina un usuario
 */
export async function deleteAdminUser(userId: number): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token');

  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }
}

/**
 * Obtiene lista de módulos de tests
 */
export async function getTestModules(): Promise<TestModule[]> {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token');

  try {
    const response = await fetch(`${API_BASE_URL}/tests/modules/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching test modules:', error);
    return [];
  }
}

/**
 * Obtiene pacientes (para vista de admin)
 */
export async function getAdminPatients(): Promise<Patient[]> {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token');

  try {
    const response = await fetch(`${API_BASE_URL}/patients/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}
