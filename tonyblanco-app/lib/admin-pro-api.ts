import { API_BASE_URL } from './api';
import { getAuthToken } from './auth';

export type AdminProApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const json = await response.json();
    if (isObject(json)) {
      const message = (json as any).message || (json as any).detail || (json as any).error;
      if (typeof message === 'string' && message.trim()) return message;
      return JSON.stringify(json);
    }
    return String(json);
  } catch {
    const text = await response.text().catch(() => '');
    return text?.trim() || `Error ${response.status}: ${response.statusText}`;
  }
}

async function adminProRequest<T>(endpoint: string, options: RequestInit = {}): Promise<AdminProApiResult<T>> {
  const token = getAuthToken();
  if (!token) {
    return { ok: false, status: 401, error: 'No autenticado' };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    Authorization: `Token ${token}`,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await parseErrorMessage(response);
      const authMsg = response.status === 401 || response.status === 403 ? 'No autorizado' : error;
      return { ok: false, status: response.status, error: authMsg };
    }

    if (response.status === 204) {
      return { ok: true, status: response.status, data: undefined as unknown as T };
    }

    const data = (await response.json()) as T;
    return { ok: true, status: response.status, data };
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Error de red';
    return { ok: false, status: 0, error: message };
  }
}

export function adminCheck(): Promise<AdminProApiResult<unknown>> {
  return adminProRequest('/admin/check/', { method: 'GET' });
}

export function getAdminStats(): Promise<AdminProApiResult<unknown>> {
  return adminProRequest('/admin/stats/', { method: 'GET' });
}

export function getAdminUsers(): Promise<AdminProApiResult<unknown>> {
  return adminProRequest('/admin/users/', { method: 'GET' });
}

export function patchAdminUser(id: number, payload: Record<string, unknown>): Promise<AdminProApiResult<unknown>> {
  return adminProRequest(`/admin/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminUser(id: number): Promise<AdminProApiResult<unknown>> {
  return adminProRequest(`/admin/users/${id}/`, { method: 'DELETE' });
}
