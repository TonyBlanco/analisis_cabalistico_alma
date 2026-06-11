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
    
    GET /api/therapist/patients/{patient_id}/context-summary/
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
    
    def _natal_planets_list(self, natal_chart) -> list:
        """Convert domain planets to dict format expected by engines."""
        return [
            {
                'planet_name': planet.planet_name,
                'longitude': float(planet.longitude),
            }
            for planet in natal_chart.planets
        ]

    def _natal_houses_list(self, natal_chart) -> list:
        """Convert domain houses to dict format expected by engines."""
        return [
            {
                'number': house.house_number,
                'cusp_longitude': float(house.longitude),
            }
            for house in natal_chart.houses
        ]

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

        for planet in natal_chart.planets:
            name = planet.planet_name.lower()
            if name == 'sun':
                summary['sun'] = {
                    'sign': self._get_sign_name(planet.sign),
                    'degree': round(float(planet.sign_degree), 1),
                    'house': planet.house,
                }
            elif name == 'moon':
                summary['moon'] = {
                    'sign': self._get_sign_name(planet.sign),
                    'degree': round(float(planet.sign_degree), 1),
                    'house': planet.house,
                }

        for house in natal_chart.houses:
            if house.house_number == 1:
                summary['rising'] = {
                    'sign': self._get_sign_name(house.sign),
                    'degree': round(float(house.sign_degree), 1),
                }
                break

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
        
        for planet in natal_chart.planets:
            sign_name = self._get_sign_name(planet.sign)
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
        
        for planet in natal_chart.planets:
            sign_name = self._get_sign_name(planet.sign)
            for modality, signs in modality_signs.items():
                if sign_name in signs:
                    modality_count[modality] += 1
                    break

        return max(modality_count, key=modality_count.get) if any(modality_count.values()) else 'Equilibrado'
    
    def _get_current_transits(self, natal_chart, orb: float = 2.0) -> list:
        """Get current planetary transits to natal chart."""
        try:
            engine = TransitsEngine()
            target_date = datetime.now().strftime('%Y-%m-%d')
            transits_result = engine.calculate_transits(
                natal_planets=self._natal_planets_list(natal_chart),
                natal_houses=self._natal_houses_list(natal_chart),
                target_date=target_date,
                include_outer_only=False,
            )

            formatted_transits = []
            aspects = transits_result.get('transit_aspects', [])

            for aspect in aspects:
                if aspect.get('orb', 999) > orb:
                    continue
                formatted_transits.append({
                    'planet': aspect.get('transit_planet', ''),
                    'aspect': aspect.get('aspect_type', ''),
                    'natal_point': aspect.get('natal_planet', ''),
                    'orb': round(aspect.get('orb', 0), 2),
                    'applying': aspect.get('applying', False),
                })
                if len(formatted_transits) >= 5:
                    break

            return formatted_transits
        except Exception as e:
            logger.warning(f"Transit calculation failed: {e}")
            return []
    
    def _get_progressions(self, natal_chart) -> dict:
        """Get secondary progressions summary."""
        try:
            engine = ProgressionsEngine()
            birth_datetime = natal_chart.birth_datetime
            birth_data = {
                'year': birth_datetime.year,
                'month': birth_datetime.month,
                'day': birth_datetime.day,
                'hour': birth_datetime.hour,
                'minute': birth_datetime.minute,
            }
            target_date = datetime.now().strftime('%Y-%m-%d')
            progressions_result = engine.calculate_progressions(
                birth_data=birth_data,
                natal_planets=self._natal_planets_list(natal_chart),
                natal_houses=self._natal_houses_list(natal_chart),
                target_date=target_date,
                latitude=float(natal_chart.latitude),
                longitude=float(natal_chart.longitude),
            )

            progressed_planets = progressions_result.get('progressed_planets', {})
            moon_phase = progressions_result.get('progressed_moon_phase', {})
            moon_phase_label = moon_phase.get('phase_name', '') if isinstance(moon_phase, dict) else str(moon_phase)

            return {
                'progressed_moon_sign': self._get_sign_name(
                    progressed_planets.get('moon', {}).get('progressed_sign')
                ),
                'progressed_moon_phase': moon_phase_label,
                'progressed_sun_sign': self._get_sign_name(
                    progressed_planets.get('sun', {}).get('progressed_sign')
                ),
                'key_aspects': progressions_result.get('key_progressions', [])[:3],
            }
        except Exception as e:
            logger.warning(f"Progressions calculation failed: {e}")
            return {}
    
    def _get_solar_return(self, natal_chart) -> dict:
        """Get current year's solar return themes."""
        try:
            engine = SolarReturnEngine()
            current_year = datetime.now().year

            house_system_name = natal_chart.house_system or 'P'
            house_system_map = {
                'placidus': 'P',
                'koch': 'K',
                'equal': 'E',
                'whole_sign': 'W',
                'campanus': 'C',
                'regiomontanus': 'R',
                'porphyry': 'O',
            }
            house_system = house_system_map.get(house_system_name.lower(), house_system_name)

            solar_return_result = engine.calculate_solar_return(
                patient_id=natal_chart.patient_id,
                birth_datetime=natal_chart.birth_datetime,
                natal_latitude=natal_chart.latitude,
                natal_longitude=natal_chart.longitude,
                target_year=current_year,
                timezone=natal_chart.timezone or 'UTC',
                house_system=house_system,
                zodiac_type=natal_chart.zodiac_type or 'T',
            )

            analysis = solar_return_result.get('analysis', {})
            themes = analysis.get('themes', [])
            sun_house = analysis.get('sun_house')
            sr_rising = analysis.get('ascendant', {}).get('sign')

            if not themes and sun_house:
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
                    12: 'Espiritualidad y cierre de ciclos',
                }
                themes = [house_themes.get(sun_house, f'Casa {sun_house}')]

            return {
                'year_themes': themes,
                'sr_rising': self._get_sign_name(sr_rising),
                'sr_sun_house': sun_house,
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
