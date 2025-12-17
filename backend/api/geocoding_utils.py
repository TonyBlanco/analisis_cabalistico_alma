"""
Utilidades de Geocodificación para Astrología Cabalística
Calcula automáticamente coordenadas y zona horaria desde el nombre de la ciudad

ESTE ES EL MÓDULO CENTRAL DE GEO-RESOLUCIÓN.
Todas las actualizaciones de perfil DEBEN usar estas funciones.
"""

from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from typing import Dict, Optional, Tuple, Any
import time
import logging

logger = logging.getLogger(__name__)

# Cache simple para evitar múltiples llamadas a la API
_geocoding_cache = {}


class GeoResolutionError(Exception):
    """Error cuando la geo-resolución falla y es requerida."""
    pass


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
    if not city or not city.strip():
        return None
        
    city = city.strip()
    country = country.strip() if country else None
    
    # Crear clave de cache
    cache_key = f"{city.lower()},{country.lower() if country else ''}"
    
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
        logger.error(f"Error en geocodificación de {city}: {e}")
        return None


def geocode_city_simple(city: str, country: str = None) -> Optional[Tuple[float, float]]:
    """
    Versión simplificada que solo retorna (lat, lon)
    """
    result = geocode_city(city, country)
    if result:
        return (result['latitude'], result['longitude'])
    return None


def resolve_coordinates_for_profile(
    city: str,
    country: str,
    existing_lat: Optional[float] = None,
    existing_lng: Optional[float] = None,
    force_resolve: bool = False
) -> Dict[str, Any]:
    """
    Resuelve coordenadas para un perfil de usuario.
    
    REGLA CORE: Si hay city + country, DEBEN existir lat/lng.
    
    Args:
        city: Ciudad de nacimiento
        country: País de nacimiento
        existing_lat: Latitud existente (si la hay)
        existing_lng: Longitud existente (si la hay)
        force_resolve: Si True, re-resuelve aunque ya existan coordenadas
    
    Returns:
        Dict con:
            - latitude: float
            - longitude: float  
            - timezone: str
            - resolved: bool (True si se resolvieron nuevas coordenadas)
    
    Raises:
        GeoResolutionError: Si no se pueden resolver las coordenadas
    """
    # Si no hay ciudad ni país, no hay nada que resolver
    if not city and not country:
        return {
            'latitude': existing_lat,
            'longitude': existing_lng,
            'timezone': None,
            'resolved': False
        }
    
    # Si ya hay coordenadas válidas y no forzamos re-resolución
    if existing_lat is not None and existing_lng is not None and not force_resolve:
        return {
            'latitude': existing_lat,
            'longitude': existing_lng,
            'timezone': None,  # No cambiamos timezone si ya existe
            'resolved': False
        }
    
    # REGLA CORE: Si hay city o country, DEBEMOS resolver coordenadas
    if city or country:
        geo_result = geocode_city(city, country)
        
        if geo_result:
            return {
                'latitude': geo_result['latitude'],
                'longitude': geo_result['longitude'],
                'timezone': geo_result['timezone'],
                'city_normalized': geo_result.get('city'),
                'country_normalized': geo_result.get('country'),
                'resolved': True
            }
        else:
            # FALLO DE RESOLUCIÓN - esto es un error crítico
            location_str = f"{city}, {country}" if country else city
            raise GeoResolutionError(
                f"No se pudieron resolver las coordenadas para: {location_str}. "
                f"Verifica que el nombre de la ciudad y país sean correctos."
            )
    
    return {
        'latitude': existing_lat,
        'longitude': existing_lng,
        'timezone': None,
        'resolved': False
    }


def apply_geo_resolution_to_profile_data(
    data: Dict[str, Any],
    current_city: Optional[str] = None,
    current_country: Optional[str] = None,
    current_lat: Optional[float] = None,
    current_lng: Optional[float] = None,
    current_timezone: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Aplica geo-resolución a los datos de actualización de perfil.
    
    Esta función es el PUNTO CENTRAL de resolución de coordenadas.
    Debe ser llamada ANTES de guardar cualquier perfil.
    
    Args:
        data: Dict con los datos a actualizar (puede incluir birth_city, birth_country, etc.)
        current_*: Valores actuales del perfil
    
    Returns:
        Dict actualizado con coordenadas resueltas
    
    Raises:
        GeoResolutionError: Si la geo-resolución falla cuando es requerida
    """
    # Determinar qué ciudad/país usar
    new_city = data.get('birth_city', current_city)
    new_country = data.get('birth_country', current_country)
    
    # Detectar si la ciudad o país cambiaron
    city_changed = 'birth_city' in data and data['birth_city'] != current_city
    country_changed = 'birth_country' in data and data['birth_country'] != current_country
    location_changed = city_changed or country_changed
    
    # Si el usuario proporcionó coordenadas manualmente, respetarlas
    manual_lat = data.get('birth_latitude')
    manual_lng = data.get('birth_longitude')
    
    if manual_lat is not None and manual_lng is not None:
        # El frontend proporcionó coordenadas, las usamos
        return data
    
    # Si la ubicación no cambió y ya hay coordenadas, no re-resolver
    if not location_changed and current_lat is not None and current_lng is not None:
        return data
    
    # Si hay ciudad o país (nuevo o existente), resolver coordenadas
    if new_city or new_country:
        try:
            resolved = resolve_coordinates_for_profile(
                city=new_city,
                country=new_country,
                existing_lat=current_lat if not location_changed else None,
                existing_lng=current_lng if not location_changed else None,
                force_resolve=location_changed
            )
            
            if resolved['resolved']:
                data['birth_latitude'] = resolved['latitude']
                data['birth_longitude'] = resolved['longitude']
                if resolved.get('timezone'):
                    data['birth_timezone'] = resolved['timezone']
                # Opcionalmente normalizar ciudad/país
                if resolved.get('city_normalized'):
                    data['birth_city'] = resolved['city_normalized']
                if resolved.get('country_normalized'):
                    data['birth_country'] = resolved['country_normalized']
                    
        except GeoResolutionError:
            # Re-lanzar el error para que el endpoint lo maneje
            raise
    
    return data


def validate_profile_coordinates(
    city: Optional[str],
    country: Optional[str],
    latitude: Optional[float],
    longitude: Optional[float]
) -> Dict[str, Any]:
    """
    Valida que un perfil tenga coordenadas si tiene ciudad/país.
    
    REGLA CORE: Ciudad + País sin coordenadas es INVÁLIDO.
    
    Returns:
        Dict con:
            - valid: bool
            - error: str (si no es válido)
    """
    has_location = bool(city or country)
    has_coordinates = latitude is not None and longitude is not None
    
    if has_location and not has_coordinates:
        return {
            'valid': False,
            'error': f"El perfil tiene ubicación ({city}, {country}) pero faltan coordenadas. "
                     f"Esto indica un error en la geo-resolución."
        }
    
    return {'valid': True, 'error': None}















