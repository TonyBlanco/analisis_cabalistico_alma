"""
Astrology Context Builder Service
Orquesta llamada HTTP interna al workspace de astrología para obtener
contexto enriquecido para lecturas simbólicas de Tarot/Oráculo.

IMPORTANTE: Este servicio NO importa módulos de astrology/ directamente.
Usa llamadas HTTP internas para mantener aislamiento de dominios.
"""

import logging
import requests
from typing import Any, Dict, Optional
from django.conf import settings

logger = logging.getLogger(__name__)

# Timeout for internal HTTP calls (seconds)
ASTROLOGY_SERVICE_TIMEOUT = 10


class AstrologyContextBuilder:
    """
    Construye contexto astrológico para enriquecer prompts de Tarot/Oráculo.
    
    Principios de diseño:
    - Zero imports de astrology/ (aislamiento de dominios)
    - Llamadas HTTP internas (preparado para futura extracción a microservicio)
    - Fallback graceful si no hay carta natal
    - Cache-ready (datos natales cambian poco)
    """
    
    def __init__(self, auth_token: Optional[str] = None):
        """
        Initialize builder with optional auth token for internal calls.
        
        Args:
            auth_token: Bearer token for authenticated internal calls.
                       If None, uses service-to-service auth.
        """
        self.auth_token = auth_token
        self.base_url = self._get_internal_base_url()
    
    def _get_internal_base_url(self) -> str:
        """Get base URL for internal astrology API calls."""
        # In development, use localhost. In production, use internal service URL.
        internal_url = getattr(settings, 'ASTROLOGY_SERVICE_URL', None)
        if internal_url:
            return internal_url.rstrip('/')
        
        # Default to same-process call via localhost
        port = getattr(settings, 'INTERNAL_API_PORT', 8000)
        return f"http://127.0.0.1:{port}"
    
    def _build_headers(self) -> Dict[str, str]:
        """Build headers for internal HTTP call."""
        headers = {
            'Content-Type': 'application/json',
            'X-Internal-Service': 'symbolic-tarot',  # Identifies caller
        }
        if self.auth_token:
            headers['Authorization'] = f'Bearer {self.auth_token}'
        return headers
    
    def get_prompt_context(
        self,
        patient_id: int,
        include_transits: bool = True,
        include_progressions: bool = True,
        include_solar_return: bool = False,
        transit_orb: float = 2.0
    ) -> Optional[Dict[str, Any]]:
        """
        Obtiene contexto astrológico para enriquecer prompts de Tarot.
        
        Args:
            patient_id: ID del consultante
            include_transits: Incluir tránsitos planetarios actuales
            include_progressions: Incluir progresiones secundarias
            include_solar_return: Incluir revolución solar (costoso)
            transit_orb: Orbe máximo para tránsitos (grados)
        
        Returns:
            Dict con contexto astrológico estructurado, o None si no hay carta natal.
            
        Example response:
            {
                "natal_summary": {
                    "sun": {"sign": "Leo", "degree": 15.5, "house": 10},
                    "moon": {"sign": "Cancer", "degree": 22.3, "house": 9},
                    "rising": {"sign": "Scorpio", "degree": 5.1},
                    "dominant_element": "Fire",
                    "dominant_modality": "Fixed"
                },
                "current_transits": [...],
                "progressions": {...},
                "solar_return": {...},
                "symbolic_prompt_context": "Texto resumido para prompts..."
            }
        """
        try:
            url = f"{self.base_url}/api/therapist/patients/{patient_id}/astrology/context-summary/"
            params = {
                'include_transits': str(include_transits).lower(),
                'include_progressions': str(include_progressions).lower(),
                'include_solar_return': str(include_solar_return).lower(),
                'transit_orb': transit_orb
            }
            
            response = requests.get(
                url,
                params=params,
                headers=self._build_headers(),
                timeout=ASTROLOGY_SERVICE_TIMEOUT
            )
            
            if response.status_code == 404:
                # No natal chart found - graceful fallback
                logger.info(f"No natal chart found for patient {patient_id}")
                return None
            
            if response.status_code == 403:
                logger.warning(f"Access denied to astrology data for patient {patient_id}")
                return None
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.Timeout:
            logger.warning(f"Astrology service timeout for patient {patient_id}")
            return None
        except requests.exceptions.ConnectionError:
            logger.warning(f"Astrology service unreachable for patient {patient_id}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Astrology context fetch error: {e}")
            return None
    
    def build_symbolic_context_text(
        self,
        astro_context: Dict[str, Any],
        max_length: int = 500
    ) -> str:
        """
        Construye texto de contexto simbólico para inyectar en prompts de IA.
        
        Args:
            astro_context: Respuesta de get_prompt_context()
            max_length: Longitud máxima del texto resultante
        
        Returns:
            Texto conciso para enriquecer prompts de Tarot/Oráculo.
        """
        if not astro_context:
            return ""
        
        parts = []
        
        # Natal summary
        natal = astro_context.get('natal_summary', {})
        if natal:
            sun = natal.get('sun', {})
            moon = natal.get('moon', {})
            rising = natal.get('rising', {})
            
            if sun.get('sign'):
                sun_text = f"Sol en {sun['sign']}"
                if sun.get('house'):
                    sun_text += f" casa {sun['house']}"
                parts.append(sun_text)
            
            if moon.get('sign'):
                moon_text = f"Luna en {moon['sign']}"
                if moon.get('house'):
                    moon_text += f" casa {moon['house']}"
                parts.append(moon_text)
            
            if rising.get('sign'):
                parts.append(f"Ascendente {rising['sign']}")
            
            if natal.get('dominant_element'):
                parts.append(f"Elemento dominante: {natal['dominant_element']}")
        
        # Current transits
        transits = astro_context.get('current_transits', [])
        if transits:
            # Take most significant (up to 3)
            significant_transits = transits[:3]
            for t in significant_transits:
                transit_text = f"{t.get('planet', '?')} {t.get('aspect', '?')} {t.get('natal_point', '?')}"
                if t.get('applying'):
                    transit_text += " (aplicativo)"
                parts.append(f"Tránsito: {transit_text}")
        
        # Progressions
        progressions = astro_context.get('progressions', {})
        if progressions:
            if progressions.get('progressed_moon_phase'):
                parts.append(f"Luna progresada fase: {progressions['progressed_moon_phase']}")
            if progressions.get('progressed_moon_sign'):
                parts.append(f"Luna progresada en {progressions['progressed_moon_sign']}")
        
        # Solar return themes
        solar_return = astro_context.get('solar_return', {})
        if solar_return and solar_return.get('year_themes'):
            themes = solar_return['year_themes'][:2]  # Max 2 themes
            parts.append(f"Temas del año: {', '.join(themes)}")
        
        # Join and truncate
        full_text = ". ".join(parts)
        if len(full_text) > max_length:
            full_text = full_text[:max_length - 3] + "..."
        
        return full_text
    
    def enrich_tarot_reading_context(
        self,
        patient_id: int,
        existing_context: Optional[str] = None,
        enrichment_options: Optional[Dict[str, bool]] = None
    ) -> Dict[str, Any]:
        """
        Enriquece el contexto de una lectura de Tarot con datos astrológicos.
        
        Args:
            patient_id: ID del consultante
            existing_context: Contexto existente (intención, pregunta, etc.)
            enrichment_options: {
                'include_transits': bool,
                'include_progressions': bool,
                'include_solar_return': bool
            }
        
        Returns:
            {
                'enriched': bool,
                'astrology_context': {...} or None,
                'symbolic_text': str,
                'combined_context': str,
                'error': str or None
            }
        """
        options = enrichment_options or {}
        
        astro_context = self.get_prompt_context(
            patient_id=patient_id,
            include_transits=options.get('include_transits', True),
            include_progressions=options.get('include_progressions', True),
            include_solar_return=options.get('include_solar_return', False)
        )
        
        if not astro_context:
            return {
                'enriched': False,
                'astrology_context': None,
                'symbolic_text': '',
                'combined_context': existing_context or '',
                'error': None  # Not an error, just no data available
            }
        
        symbolic_text = self.build_symbolic_context_text(astro_context)
        
        # Combine contexts
        combined_parts = []
        if existing_context:
            combined_parts.append(existing_context.strip())
        if symbolic_text:
            combined_parts.append(f"[Contexto astrológico: {symbolic_text}]")
        
        return {
            'enriched': True,
            'astrology_context': astro_context,
            'symbolic_text': symbolic_text,
            'combined_context': ' '.join(combined_parts),
            'error': None
        }


# Singleton-like helper for convenience
_default_builder: Optional[AstrologyContextBuilder] = None


def get_astrology_context_builder(auth_token: Optional[str] = None) -> AstrologyContextBuilder:
    """Get or create AstrologyContextBuilder instance."""
    global _default_builder
    if auth_token:
        # Return new instance with token
        return AstrologyContextBuilder(auth_token=auth_token)
    if _default_builder is None:
        _default_builder = AstrologyContextBuilder()
    return _default_builder


def get_tarot_astrology_context(
    patient_id: int,
    auth_token: Optional[str] = None,
    **kwargs
) -> Optional[Dict[str, Any]]:
    """
    Convenience function to get astrology context for Tarot enrichment.
    
    Args:
        patient_id: ID del consultante
        auth_token: Token de autenticación
        **kwargs: Opciones adicionales (include_transits, etc.)
    
    Returns:
        Contexto astrológico o None
    """
    builder = get_astrology_context_builder(auth_token)
    return builder.get_prompt_context(patient_id, **kwargs)
