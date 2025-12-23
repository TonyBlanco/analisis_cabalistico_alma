/**
 * Bio-Emotional API Client
 *
 * Connects to backend bio-emotional endpoints
 * READ-ONLY access to dictionary
 * No automatic inference or conclusions
 */

import { getAuthToken } from "../api";

export interface BioEmotionalDictionaryEntry {
  termino: string;
  definicion: string;
  sentido_biologico?: string;
  conflicto_asociado?: string;
  fuente?: string;
  slug?: string;
}

export interface DictionarySearchParams {
  q?: string; // Search query
  limit?: number;
}

export interface DictionarySearchResponse {
  results: BioEmotionalDictionaryEntry[];
  count: number;
}

// Bio-Emotional Dictionary API URL
const BIOEMOTIONAL_DICTIONARY_URL = "/api/bioemotional/dictionary/";

/**
 * Get backend base URL
 * In development: Django backend on port 8000
 * In production: Use environment variable or same origin
 */
function getBackendBaseUrl(): string {
  // Check if we have an environment variable for backend URL
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  }
  // Server-side
  return process.env.BACKEND_URL || 'http://127.0.0.1:8000';
}

/**
 * Search bio-emotional dictionary
 * READ-ONLY endpoint
 * Requires therapist authentication
 */
export async function searchDictionary(
  params: DictionarySearchParams = {}
): Promise<DictionarySearchResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.q) {
      queryParams.append('q', params.q);
    }
    
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const backendUrl = getBackendBaseUrl();
    const url = `${backendUrl}${BIOEMOTIONAL_DICTIONARY_URL}?${queryParams.toString()}`;
    const token = getAuthToken();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      credentials: 'include', // Include auth cookies if present
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Se requiere autenticación de terapeuta.');
      }
      if (response.status === 403) {
        throw new Error('Acceso denegado. Solo terapeutas pueden acceder al diccionario.');
      }
      throw new Error(`Error al buscar en el diccionario: ${response.status}`);
    }

    const data = await response.json();
    
    // Backend returns array directly or wrapped in results
    if (Array.isArray(data)) {
      return {
        results: data,
        count: data.length,
      };
    }
    
    return {
      results: data.results || [],
      count: data.count || 0,
    };
  } catch (error) {
    console.error('Error searching dictionary:', error);
    throw error;
  }
}

/**
 * Get all dictionary entries (no search filter)
 * Use with caution - may return large dataset
 */
export async function getAllDictionaryEntries(): Promise<BioEmotionalDictionaryEntry[]> {
  const response = await searchDictionary({ limit: 1000 });
  return response.results;
}

/**
 * Search dictionary by term (exact or partial match)
 */
export async function searchDictionaryByTerm(term: string): Promise<BioEmotionalDictionaryEntry[]> {
  const response = await searchDictionary({ q: term });
  return response.results;
}
