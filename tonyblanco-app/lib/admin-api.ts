import { API_BASE_URL } from './api';
import { getAuthToken } from './auth';

export type AdminApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status?: number; error: string };

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

async function adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<AdminApiResult<T>> {
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
      return { ok: false, status: response.status, error };
    }

    if (response.status === 204) {
      return { ok: true, data: undefined as unknown as T };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Error de red';
    return { ok: false, status: 0, error: message };
  }
}

export type AdminCheckResponse = { is_admin?: boolean } | { error?: string };

export function adminCheck(): Promise<AdminApiResult<AdminCheckResponse>> {
  return adminRequest<AdminCheckResponse>('/admin/check/', { method: 'GET' });
}

export type AdminStatsResponse = Record<string, unknown>;

export function getAdminStats(): Promise<AdminApiResult<AdminStatsResponse>> {
  return adminRequest<AdminStatsResponse>('/admin/stats/', { method: 'GET' });
}

export function getAdminUsers(): Promise<AdminApiResult<unknown>> {
  return adminRequest<unknown>('/admin/users/', { method: 'GET' });
}

export function getAdminUserDetail(id: number): Promise<AdminApiResult<unknown>> {
  return adminRequest<unknown>(`/admin/users/${id}/`, { method: 'GET' });
}

export function patchAdminUser(id: number, payload: Record<string, unknown>): Promise<AdminApiResult<unknown>> {
  return adminRequest<unknown>(`/admin/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminUser(id: number): Promise<AdminApiResult<unknown>> {
  return adminRequest<unknown>(`/admin/users/${id}/`, { method: 'DELETE' });
}





