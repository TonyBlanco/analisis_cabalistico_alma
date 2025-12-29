/**
 * API de Geocodificación
 * Calcula automáticamente coordenadas y zona horaria desde el nombre de la ciudad
 * 
 * Enhanced with robust fallback strategies for better matching.
 */

import { getCitySearchVariations } from './utils/normalizeLocation';
import { getApiBaseUrl } from './api-base';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json',
  };
}

export interface GeocodeResult {
  success: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  city: string;
  country: string;
  full_address: string;
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Single geocoding attempt with the backend API
 */
async function attemptGeocode(city: string, country?: string): Promise<GeocodeResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/geocode/city/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        city: city.trim(),
        country: country ? country.trim() : ''
      })
    });

    if (response.ok) {
      const data = await response.json();
      // Validate coordinates are valid (not 0, 0)
      if (data.success && 
          data.latitude !== 0 && 
          data.longitude !== 0 &&
          !isNaN(data.latitude) && 
          !isNaN(data.longitude)) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error en geocodificación:', error);
    return null;
  }
}

/**
 * Enhanced geocoding with multiple fallback strategies
 * 
 * Tries in order:
 * 1. Original city + country
 * 2. Normalized city + country (no accents, lowercase)
 * 3. English translation + country (if available)
 * 4. Title case + country
 * 
 * Returns the first successful result, or null if all attempts fail.
 */
export async function geocodeCity(
  city: string, 
  country?: string
): Promise<GeocodeResult | null> {
  if (!city || city.trim().length < 2) {
    return null;
  }

  // Strategy 1: Try original city + country first
  let result = await attemptGeocode(city, country);
  if (result?.success) {
    return result;
  }

  // Strategy 2: Try normalized variations
  const variations = getCitySearchVariations(city, country);
  for (const variation of variations) {
    // Skip the original if we already tried it
    if (variation === city.trim()) {
      continue;
    }
    
    result = await attemptGeocode(variation, country);
    if (result?.success) {
      return result;
    }
  }

  // Strategy 3: Try without country (broader search)
  if (country && country.trim().length > 0) {
    result = await attemptGeocode(city, '');
    if (result?.success) {
      // If result country matches or is close, accept it
      return result;
    }
  }

  // All attempts failed
  return null;
}

/**
 * Robust geo resolution function
 * 
 * Builds query as: "${city}, ${country}"
 * Normalizes input (trim, case-insensitive)
 * Accepts first valid result only
 * 
 * @param city City name (user input)
 * @param country Country name (user input)
 * @returns GeocodeResult with normalized_city and normalized_country, or null
 */
export async function resolveGeo(
  city: string,
  country?: string
): Promise<GeocodeResult & { normalized_city: string; normalized_country: string } | null> {
  // Normalize inputs
  const normalizedCity = city.trim();
  const normalizedCountry = country ? country.trim() : '';

  if (!normalizedCity || normalizedCity.length < 2) {
    return null;
  }

  // Build query: "city, country"
  const query = normalizedCountry 
    ? `${normalizedCity}, ${normalizedCountry}`
    : normalizedCity;

  // Try geocoding with the query
  const result = await geocodeCity(normalizedCity, normalizedCountry);

  if (result && result.success) {
    // Return with normalized fields
    return {
      ...result,
      normalized_city: result.city || normalizedCity,
      normalized_country: result.country || normalizedCountry,
    };
  }

  return null;
}











