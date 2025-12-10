"""
Utilidades de Geocodificación para Astrología Cabalística
Calcula automáticamente coordenadas y zona horaria desde el nombre de la ciudad
"""

from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from typing import Dict, Optional, Tuple
import time

# Cache simple para evitar múltiples llamadas a la API
_geocoding_cache = {}

def geocode_city(city: str, country: str = None) -> Optional[Dict]:
    """
    Obtiene coordenadas y zona horaria de una ciudad
    
    Args:
        city: Nombre de la ciudad (ej: "La Habana", "Buenos Aires")
        country: Nombre del país (opcional, ayuda a desambiguar)
    
    Returns:
        Dict con:
            - latitude: float
            - longitude: float
            - timezone: str (ej: "America/Havana")
            - city: str (nombre normalizado)
            - country: str (país detectado)
    """
    # Crear clave de cache
    cache_key = f"{city},{country}" if country else city
    
    # Verificar cache
    if cache_key in _geocoding_cache:
        return _geocoding_cache[cache_key]
    
    try:
        # Configurar geocodificador
        geolocator = Nominatim(user_agent="analisis_cabalistico_alma_v1")
        
        # Construir query
        if country:
            query = f"{city}, {country}"
        else:
            query = city
        
        # Geocodificar (con rate limiting)
        location = geolocator.geocode(query, timeout=10)
        
        if not location:
            # Intentar solo con la ciudad si falla
            if country:
                location = geolocator.geocode(city, timeout=10)
        
        if not location:
            return None
        
        # Obtener coordenadas
        lat = float(location.latitude)
        lon = float(location.longitude)
        
        # Obtener zona horaria
        tf = TimezoneFinder()
        timezone = tf.timezone_at(lng=lon, lat=lat)
        
        # Extraer país del resultado
        address_parts = location.raw.get('address', {})
        detected_country = address_parts.get('country', country or '')
        detected_city = address_parts.get('city') or address_parts.get('town') or city
        
        result = {
            'latitude': lat,
            'longitude': lon,
            'timezone': timezone or 'UTC',
            'city': detected_city,
            'country': detected_country,
            'full_address': location.address
        }
        
        # Guardar en cache
        _geocoding_cache[cache_key] = result
        
        # Rate limiting: esperar un poco para no saturar la API
        time.sleep(0.5)
        
        return result
        
    except Exception as e:
        print(f"Error en geocodificación de {city}: {e}")
        return None


def geocode_city_simple(city: str, country: str = None) -> Optional[Tuple[float, float]]:
    """
    Versión simplificada que solo retorna (lat, lon)
    """
    result = geocode_city(city, country)
    if result:
        return (result['latitude'], result['longitude'])
    return None

