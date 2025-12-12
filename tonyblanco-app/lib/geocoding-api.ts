/**
 * API de Geocodificación
 * Calcula automáticamente coordenadas y zona horaria desde el nombre de la ciudad
 */

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

export async function geocodeCity(city: string, country?: string): Promise<GeocodeResult | null> {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/geocode/city/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        city: city,
        country: country || ''
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.json();
      console.error('Error geocodificando:', error);
      return null;
    }
  } catch (error) {
    console.error('Error en geocodificación:', error);
    return null;
  }
}





