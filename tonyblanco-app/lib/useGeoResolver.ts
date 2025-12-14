/**
 * useGeoResolver Hook
 * 
 * Resolves city + country to coordinates using OpenStreetMap Nominatim API.
 * Designed for React components that need geo resolution.
 */

import { useState, useCallback } from 'react';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  displayName?: string;
}

export interface GeoResolverResult {
  coordinates: GeoCoordinates | null;
  loading: boolean;
  error: string | null;
  resolve: (city: string, country?: string) => Promise<GeoCoordinates | null>;
  clear: () => void;
}

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Resolve city and country to coordinates using Nominatim
 */
async function resolveWithNominatim(
  city: string,
  country?: string
): Promise<GeoCoordinates | null> {
  if (!city || city.trim().length < 2) {
    return null;
  }

  try {
    // Build query: "city, country" or just "city"
    const query = country && country.trim()
      ? `${city.trim()}, ${country.trim()}`
      : city.trim();

    // Construct URL with proper encoding
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    });

    const url = `${NOMINATIM_API_URL}?${params.toString()}`;

    // Make request with proper headers (Nominatim requires User-Agent)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'CabalisticAnalysisApp/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    // Get first result
    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Validate coordinates
    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat === 0 ||
      lng === 0 ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
      displayName: result.display_name || query,
    };
  } catch (error) {
    console.error('Error resolving geo coordinates:', error);
    throw error;
  }
}

/**
 * React hook for resolving city/country to coordinates
 */
export function useGeoResolver(): GeoResolverResult {
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = useCallback(
    async (city: string, country?: string): Promise<GeoCoordinates | null> => {
      if (!city || city.trim().length < 2) {
        setCoordinates(null);
        setError(null);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await resolveWithNominatim(city, country);

        if (result) {
          setCoordinates(result);
          setError(null);
          return result;
        } else {
          setCoordinates(null);
          setError(`No se encontró la ubicación "${city}${country ? `, ${country}` : ''}". Verifica el nombre e intenta de nuevo.`);
          return null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Error al buscar la ubicación';
        
        setCoordinates(null);
        setError(`Error: ${errorMessage}`);
        console.error('Geo resolution error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setCoordinates(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    coordinates,
    loading,
    error,
    resolve,
    clear,
  };
}
