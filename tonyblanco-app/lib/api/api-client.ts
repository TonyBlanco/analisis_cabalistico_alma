/**
 * Generic API Client for SWM modules
 * 
 * Provides typed fetch wrappers for REST API calls.
 */

import { API_BASE_URL, getAuthToken } from '../api';

interface ApiResponse<T> {
    data: T;
    status: number;
}

async function request<T>(
    url: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }

    const fullUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : url;

    const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: `Error ${response.status}: Request failed`,
        }));
        throw new Error(error.message || error.detail || `Error: ${response.status}`);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
        return { data: null as unknown as T, status: response.status };
    }

    const data = await response.json();
    return { data, status: response.status };
}

export const apiClient = {
    async get<T>(url: string): Promise<ApiResponse<T>> {
        return request<T>(url, { method: 'GET' });
    },

    async post<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
        return request<T>(url, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    },

    async patch<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
        return request<T>(url, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    },

    async put<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
        return request<T>(url, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    },

    async delete(url: string): Promise<void> {
        await request(url, { method: 'DELETE' });
    },
};

export default apiClient;
