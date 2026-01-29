"""
Context Summary View for Astrology API
Endpoint read-only que agrega datos de múltiples engines astrológicos
para enriquecer lecturas simbólicas de Tarot/Oráculo.

Este es el ÚNICO punto de integración que expone el workspace astrology/
al workspace api/ para propósitos de enriquecimiento simbólico.
"""

from datetime import datetime
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist
import logging

from api.models import Patient
from ..services.chart_service import ChartService
from ..engine.transits import TransitsEngine
from ..engine.progressions import ProgressionsEngine
from ..engine.solar_return import SolarReturnEngine
from .permissions import IsTherapist, CanAccessPatient

logger = logging.getLogger(__name__)


class ContextSummaryView(APIView):
    """
    API endpoint for aggregated astrology context summary.
    
    Designed for enriching Tarot/Oracle symbolic readings with natal chart data.
    Read-only, aggregates data from multiple engines into a concise summary.
    
    GET /api/therapist/patients/{patient_id}/astrology/context-summary/
        Query parameters:
        - include_transits: bool (default: true)
        - include_progressions: bool (default: true)  
        - include_solar_return: bool (default: false)
        - transit_orb: float (default: 2.0)
    
    Response:
        {
            "natal_summary": {...},
            "current_transits": [...],
            "progressions": {...},
            "solar_return": {...},
            "symbolic_prompt_context": "..."
        }
    """
    permission_classes = [IsAuthenticated, IsTherapist, CanAccessPatient]
    
    def get(self, request, patient_id):
        """Get aggregated astrology context for symbolic enrichment."""
        try:
            # Verify patient exists and user has access
            patient = Patient.objects.get(id=patient_id)
            self.check_object_permissions(request, patient)
            
            # Parse query parameters
            include_transits = request.query_params.get('include_transits', 'true').lower() == 'true'
            include_progressions = request.query_params.get('include_progressions', 'true').lower() == 'true'
            include_solar_return = request.query_params.get('include_solar_return', 'false').lower() == 'true'
            transit_orb = float(request.query_params.get('transit_orb', '2.0'))
            
            # Get natal chart (required base)
            chart_service = ChartService()
            natal_chart = chart_service.get_natal_chart(patient_id)
            
            if not natal_chart:
                return Response(
                    {"error": "No natal chart found for this patient"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Build response
            response_data = {
                'natal_summary': self._build_natal_summary(natal_chart),
                'current_transits': [],
                'progressions': {},
                'solar_return': {},
                'symbolic_prompt_context': '',
                'metadata': {
                    'patient_id': patient_id,
                    'computed_at': datetime.now().isoformat(),
                    'natal_chart_date': natal_chart.birth_datetime.isoformat() if natal_chart.birth_datetime else None
                }
            }
            
            # Optional: Add transits
            if include_transits:
                try:
                    transits_data = self._get_current_transits(natal_chart, transit_orb)
                    response_data['current_transits'] = transits_data
                except Exception as e:
                    logger.warning(f"Could not compute transits: {e}")
            
            # Optional: Add progressions
            if include_progressions:
                try:
                    progressions_data = self._get_progressions(natal_chart)
                    response_data['progressions'] = progressions_data
                except Exception as e:
                    logger.warning(f"Could not compute progressions: {e}")
            
            # Optional: Add solar return
            if include_solar_return:
                try:
                    solar_return_data = self._get_solar_return(natal_chart)
                    response_data['solar_return'] = solar_return_data
                except Exception as e:
                    logger.warning(f"Could not compute solar return: {e}")
            
            # Build symbolic prompt context
            response_data['symbolic_prompt_context'] = self._build_symbolic_context(response_data)
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except ObjectDoesNotExist:
            return Response(
                {"error": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {"error": f"Invalid parameter: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error building astrology context: {e}")
            return Response(
                {"error": f"Error building context summary: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _build_natal_summary(self, natal_chart) -> dict:
        """Extract key natal chart data for summary."""
        summary = {
            'sun': {},
            'moon': {},
            'rising': {},
            'dominant_element': None,
            'dominant_modality': None,
            'chart_pattern': None
        }
        
        # Extract planet positions
        planets = getattr(natal_chart, 'planets', None)
        if planets:
            # Handle both dict and object access
            if isinstance(planets, dict):
                sun_data = planets.get('sun', {})
                moon_data = planets.get('moon', {})
            else:
                sun_data = getattr(planets, 'sun', {})
                moon_data = getattr(planets, 'moon', {})
            
            if sun_data:
                summary['sun'] = {
                    'sign': self._get_sign_name(sun_data.get('sign') if isinstance(sun_data, dict) else getattr(sun_data, 'sign', None)),
                    'degree': round(sun_data.get('longitude', 0) % 30, 1) if isinstance(sun_data, dict) else round(getattr(sun_data, 'longitude', 0) % 30, 1),
                    'house': sun_data.get('house') if isinstance(sun_data, dict) else getattr(sun_data, 'house', None)
                }
            
            if moon_data:
                summary['moon'] = {
                    'sign': self._get_sign_name(moon_data.get('sign') if isinstance(moon_data, dict) else getattr(moon_data, 'sign', None)),
                    'degree': round(moon_data.get('longitude', 0) % 30, 1) if isinstance(moon_data, dict) else round(getattr(moon_data, 'longitude', 0) % 30, 1),
                    'house': moon_data.get('house') if isinstance(moon_data, dict) else getattr(moon_data, 'house', None)
                }
        
        # Extract ascendant
        houses = getattr(natal_chart, 'houses', None)
        if houses:
            if isinstance(houses, dict):
                asc_data = houses.get('1', houses.get('ascendant', {}))
            else:
                asc_data = getattr(houses, 'ascendant', {})
            
            if asc_data:
                asc_sign = asc_data.get('sign') if isinstance(asc_data, dict) else getattr(asc_data, 'sign', None)
                asc_degree = asc_data.get('longitude', 0) if isinstance(asc_data, dict) else getattr(asc_data, 'longitude', 0)
                summary['rising'] = {
                    'sign': self._get_sign_name(asc_sign),
                    'degree': round(asc_degree % 30, 1) if asc_degree else None
                }
        
        # Calculate dominants (simplified)
        summary['dominant_element'] = self._calculate_dominant_element(natal_chart)
        summary['dominant_modality'] = self._calculate_dominant_modality(natal_chart)
        
        return summary
    
    def _get_sign_name(self, sign_index_or_name) -> str:
        """Convert sign index to name if needed."""
        signs = [
            'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
            'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
        ]
        if sign_index_or_name is None:
            return 'Desconocido'
        if isinstance(sign_index_or_name, int):
            return signs[sign_index_or_name % 12]
        return str(sign_index_or_name)
    
    def _calculate_dominant_element(self, natal_chart) -> str:
        """Calculate dominant element from planet positions."""
        element_signs = {
            'Fuego': ['Aries', 'Leo', 'Sagitario'],
            'Tierra': ['Tauro', 'Virgo', 'Capricornio'],
            'Aire': ['Géminis', 'Libra', 'Acuario'],
            'Agua': ['Cáncer', 'Escorpio', 'Piscis']
        }
        
        element_count = {'Fuego': 0, 'Tierra': 0, 'Aire': 0, 'Agua': 0}
        
        planets = getattr(natal_chart, 'planets', None)
        if planets:
            planet_data = planets if isinstance(planets, dict) else vars(planets)
            for planet_name, planet_info in planet_data.items():
                if planet_info:
                    sign = planet_info.get('sign') if isinstance(planet_info, dict) else getattr(planet_info, 'sign', None)
                    sign_name = self._get_sign_name(sign)
                    for element, signs in element_signs.items():
                        if sign_name in signs:
                            element_count[element] += 1
                            break
        
        return max(element_count, key=element_count.get) if any(element_count.values()) else 'Equilibrado'
    
    def _calculate_dominant_modality(self, natal_chart) -> str:
        """Calculate dominant modality from planet positions."""
        modality_signs = {
            'Cardinal': ['Aries', 'Cáncer', 'Libra', 'Capricornio'],
            'Fijo': ['Tauro', 'Leo', 'Escorpio', 'Acuario'],
            'Mutable': ['Géminis', 'Virgo', 'Sagitario', 'Piscis']
        }
        
        modality_count = {'Cardinal': 0, 'Fijo': 0, 'Mutable': 0}
        
        planets = getattr(natal_chart, 'planets', None)
        if planets:
            planet_data = planets if isinstance(planets, dict) else vars(planets)
            for planet_name, planet_info in planet_data.items():
                if planet_info:
                    sign = planet_info.get('sign') if isinstance(planet_info, dict) else getattr(planet_info, 'sign', None)
                    sign_name = self._get_sign_name(sign)
                    for modality, signs in modality_signs.items():
                        if sign_name in signs:
                            modality_count[modality] += 1
                            break
        
        return max(modality_count, key=modality_count.get) if any(modality_count.values()) else 'Equilibrado'
    
    def _get_current_transits(self, natal_chart, orb: float = 2.0) -> list:
        """Get current planetary transits to natal chart."""
        try:
            engine = TransitsEngine()
            transits_result = engine.calculate_transits(
                natal_chart=natal_chart,
                transit_date=datetime.now(),
                orb=orb
            )
            
            # Format for summary (take most significant)
            formatted_transits = []
            aspects = transits_result.get('aspects', [])
            
            for aspect in aspects[:5]:  # Limit to 5 most relevant
                formatted_transits.append({
                    'planet': aspect.get('transiting_planet', ''),
                    'aspect': aspect.get('aspect_name', ''),
                    'natal_point': aspect.get('natal_planet', ''),
                    'orb': round(aspect.get('orb', 0), 2),
                    'applying': aspect.get('is_applying', False)
                })
            
            return formatted_transits
        except Exception as e:
            logger.warning(f"Transit calculation failed: {e}")
            return []
    
    def _get_progressions(self, natal_chart) -> dict:
        """Get secondary progressions summary."""
        try:
            engine = ProgressionsEngine()
            progressions_result = engine.calculate_progressions(
                natal_chart=natal_chart,
                target_date=datetime.now()
            )
            
            return {
                'progressed_moon_sign': self._get_sign_name(
                    progressions_result.get('progressed_planets', {}).get('moon', {}).get('sign')
                ),
                'progressed_moon_phase': progressions_result.get('progressed_moon_phase', ''),
                'progressed_sun_sign': self._get_sign_name(
                    progressions_result.get('progressed_planets', {}).get('sun', {}).get('sign')
                ),
                'key_aspects': progressions_result.get('key_progressions', [])[:3]
            }
        except Exception as e:
            logger.warning(f"Progressions calculation failed: {e}")
            return {}
    
    def _get_solar_return(self, natal_chart) -> dict:
        """Get current year's solar return themes."""
        try:
            engine = SolarReturnEngine()
            
            # Calculate for current year
            current_year = datetime.now().year
            solar_return_result = engine.calculate_solar_return(
                natal_chart=natal_chart,
                year=current_year
            )
            
            # Extract key themes
            sr_houses = solar_return_result.get('houses', {})
            sr_sun = solar_return_result.get('planets', {}).get('sun', {})
            
            themes = []
            sun_house = sr_sun.get('house')
            if sun_house:
                house_themes = {
                    1: 'Identidad y nuevos comienzos',
                    2: 'Recursos y valores',
                    3: 'Comunicación y aprendizaje',
                    4: 'Hogar y raíces',
                    5: 'Creatividad y expresión',
                    6: 'Salud y servicio',
                    7: 'Relaciones y asociaciones',
                    8: 'Transformación profunda',
                    9: 'Expansión y filosofía',
                    10: 'Carrera y vocación',
                    11: 'Comunidad y metas',
                    12: 'Espiritualidad y cierre de ciclos'
                }
                themes.append(house_themes.get(sun_house, f'Casa {sun_house}'))
            
            # Rising sign of solar return
            sr_rising = sr_houses.get('1', {}).get('sign')
            
            return {
                'year_themes': themes,
                'sr_rising': self._get_sign_name(sr_rising),
                'sr_sun_house': sun_house
            }
        except Exception as e:
            logger.warning(f"Solar return calculation failed: {e}")
            return {}
    
    def _build_symbolic_context(self, response_data: dict) -> str:
        """Build concise symbolic context text for AI prompts."""
        parts = []
        
        # Natal summary
        natal = response_data.get('natal_summary', {})
        if natal.get('sun', {}).get('sign'):
            sun = natal['sun']
            text = f"Sol en {sun['sign']}"
            if sun.get('house'):
                text += f" (casa {sun['house']})"
            parts.append(text)
        
        if natal.get('moon', {}).get('sign'):
            moon = natal['moon']
            text = f"Luna en {moon['sign']}"
            if moon.get('house'):
                text += f" (casa {moon['house']})"
            parts.append(text)
        
        if natal.get('rising', {}).get('sign'):
            parts.append(f"Ascendente {natal['rising']['sign']}")
        
        if natal.get('dominant_element'):
            parts.append(f"Elemento dominante: {natal['dominant_element']}")
        
        # Transits (brief)
        transits = response_data.get('current_transits', [])
        if transits:
            t = transits[0]  # Most significant
            transit_text = f"Tránsito activo: {t.get('planet', '')} {t.get('aspect', '')} {t.get('natal_point', '')}"
            parts.append(transit_text)
        
        # Progressions
        progressions = response_data.get('progressions', {})
        if progressions.get('progressed_moon_phase'):
            parts.append(f"Luna progresada: fase {progressions['progressed_moon_phase']}")
        
        return ". ".join(parts)
