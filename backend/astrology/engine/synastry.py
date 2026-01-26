# Synastry Engine
# This module implements Synastry (relationship comparison) calculations
# Compare two natal charts to analyze compatibility and dynamics

"""
SYNASTRY ENGINE — Motor de Sinastría

La Sinastría es la técnica de comparación de dos cartas natales sin fusionarlas.
A diferencia del Composite (puntos medios) o Davison (momento/lugar medio),
la Sinastría mantiene ambas cartas separadas y analiza sus interacciones.

Técnicas implementadas:
1. Aspectos inter-carta: planetas de A aspectando planetas de B
2. Planetas en casas: planetas de A cayendo en casas de B
3. Compatibilidad elemental: distribución de elementos
4. Score de compatibilidad: puntuación basada en aspectos

Aspectos claves en sinastría:
- Sol-Luna: conexión emocional básica
- Venus-Marte: atracción y pasión
- Luna-Luna: compatibilidad emocional
- Sol-Sol: compatibilidad de ego/identidad
- Aspectos a ASC/MC: impacto en vida pública/privada

Orbes de sinastría (más amplios que natales):
- Luminarias (Sol/Luna): 10°
- Planetas personales: 8°
- Planetas sociales/externos: 6°
"""

from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional, Tuple
from math import fabs

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    print("Warning: Swiss Ephemeris not available. Synastry calculations disabled.")

from ..config.astrology_settings import PLANET_IDS, PLANET_SYMBOLS, MAJOR_ASPECTS


# Synastry-specific orbs (wider for relationship analysis)
SYNASTRY_ORBS = {
    "conjunction": 8,
    "opposition": 8,
    "trine": 8,
    "square": 7,
    "sextile": 6,
    "quincunx": 5,
}

# Luminaries get wider orbs
LUMINARY_ORB_BONUS = 2

# Aspect weights for compatibility scoring
ASPECT_WEIGHTS = {
    "conjunction": {"harmonious": 10, "challenging": -5},  # Depends on planets involved
    "trine": {"harmonious": 8, "challenging": 0},
    "sextile": {"harmonious": 6, "challenging": 0},
    "square": {"harmonious": 0, "challenging": -6},
    "opposition": {"harmonious": 3, "challenging": -4},
    "quincunx": {"harmonious": 0, "challenging": -3},
}

# Harmonious conjunctions (benefics or complementary)
HARMONIOUS_CONJUNCTIONS = [
    ('sun', 'moon'), ('sun', 'venus'), ('sun', 'jupiter'),
    ('moon', 'venus'), ('moon', 'jupiter'),
    ('venus', 'mars'), ('venus', 'jupiter'),
    ('mercury', 'jupiter'), ('mercury', 'venus'),
]

# Challenging conjunctions
CHALLENGING_CONJUNCTIONS = [
    ('sun', 'saturn'), ('sun', 'pluto'),
    ('moon', 'saturn'), ('moon', 'pluto'),
    ('mars', 'saturn'), ('mars', 'pluto'),
    ('venus', 'saturn'),
]


class SynastryEngine:
    """
    Engine for calculating Synastry (relationship comparison)
    
    Synastry compares two natal charts to analyze:
    - Inter-chart aspects (how planets interact)
    - House overlays (where person A's planets fall in B's houses)
    - Elemental compatibility
    - Overall compatibility scoring
    
    Unlike Composite or Davison charts, Synastry keeps both charts
    separate and examines their mutual interactions.
    """

    def __init__(self):
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris (swisseph) is required for synastry calculations")

    def calculate_synastry(
        self,
        person1_planets: List[Dict],
        person1_houses: List[Dict],
        person2_planets: List[Dict],
        person2_houses: List[Dict],
        person1_name: str = "Persona 1",
        person2_name: str = "Persona 2"
    ) -> Dict:
        """
        Calculate complete Synastry analysis between two charts
        
        Args:
            person1_planets: List of planet positions for person 1
            person2_planets: List of planet positions for person 2
            person1_houses: List of house cusps for person 1
            person2_houses: List of house cusps for person 2
            person1_name: Name of person 1
            person2_name: Name of person 2
        
        Returns:
            Dictionary with:
                - inter_aspects: Aspects between charts
                - house_overlays_1_in_2: Person 1's planets in Person 2's houses
                - house_overlays_2_in_1: Person 2's planets in Person 1's houses
                - compatibility_score: Overall score
                - elemental_compatibility: Element distribution comparison
                - key_connections: Most significant aspects
                - analysis: Structured analysis for AI
        """
        # 1. Calculate inter-chart aspects
        inter_aspects = self._calculate_inter_aspects(
            person1_planets, person2_planets,
            person1_name, person2_name
        )

        # 2. Calculate house overlays (where planets fall in partner's houses)
        house_overlays_1_in_2 = self._calculate_house_overlays(
            person1_planets, person2_houses, person1_name, person2_name
        )
        house_overlays_2_in_1 = self._calculate_house_overlays(
            person2_planets, person1_houses, person2_name, person1_name
        )

        # 3. Calculate elemental compatibility
        elemental_compatibility = self._calculate_elemental_compatibility(
            person1_planets, person2_planets
        )

        # 4. Calculate compatibility score
        compatibility_score = self._calculate_compatibility_score(inter_aspects)

        # 5. Identify key connections
        key_connections = self._identify_key_connections(inter_aspects)

        # 6. Generate structured analysis
        analysis = self._generate_analysis(
            inter_aspects, house_overlays_1_in_2, house_overlays_2_in_1,
            compatibility_score, key_connections
        )

        return {
            'person1_name': person1_name,
            'person2_name': person2_name,
            'inter_aspects': inter_aspects,
            'house_overlays_1_in_2': house_overlays_1_in_2,
            'house_overlays_2_in_1': house_overlays_2_in_1,
            'elemental_compatibility': elemental_compatibility,
            'compatibility_score': compatibility_score,
            'key_connections': key_connections,
            'analysis': analysis,
            'method': 'synastry_comparison'
        }

    def _calculate_inter_aspects(
        self,
        planets1: List[Dict],
        planets2: List[Dict],
        name1: str,
        name2: str
    ) -> List[Dict]:
        """
        Calculate aspects between planets of two different charts
        """
        aspects = []

        for p1 in planets1:
            p1_name = self._get_planet_name(p1)
            p1_lon = self._get_longitude(p1)
            
            if p1_lon is None:
                continue

            for p2 in planets2:
                p2_name = self._get_planet_name(p2)
                p2_lon = self._get_longitude(p2)
                
                if p2_lon is None:
                    continue

                # Determine orb based on planets involved
                base_orb = SYNASTRY_ORBS.get("conjunction", 8)
                
                # Luminaries get bonus orb
                if p1_name in ['sun', 'moon'] or p2_name in ['sun', 'moon']:
                    base_orb += LUMINARY_ORB_BONUS

                # Check each aspect type
                for aspect_angle, aspect_type in MAJOR_ASPECTS.items():
                    orb_allowed = SYNASTRY_ORBS.get(aspect_type, base_orb)
                    
                    # Luminaries get bonus
                    if p1_name in ['sun', 'moon'] or p2_name in ['sun', 'moon']:
                        orb_allowed += LUMINARY_ORB_BONUS

                    # Calculate angular separation
                    diff = abs(p1_lon - p2_lon)
                    if diff > 180:
                        diff = 360 - diff

                    actual_orb = abs(diff - aspect_angle)

                    if actual_orb <= orb_allowed:
                        # Determine if aspect is harmonious or challenging
                        harmony = self._assess_aspect_harmony(
                            p1_name, p2_name, aspect_type
                        )

                        aspects.append({
                            'person1_planet': p1_name,
                            'person1_longitude': p1_lon,
                            'person1_name': name1,
                            'person2_planet': p2_name,
                            'person2_longitude': p2_lon,
                            'person2_name': name2,
                            'aspect_type': aspect_type,
                            'aspect_angle': aspect_angle,
                            'orb': round(actual_orb, 2),
                            'exactness': round(100 - (actual_orb / orb_allowed * 100), 1),
                            'harmony': harmony
                        })

        # Sort by exactness
        aspects.sort(key=lambda x: x['exactness'], reverse=True)

        return aspects

    def _calculate_house_overlays(
        self,
        planets: List[Dict],
        houses: List[Dict],
        planet_owner: str,
        house_owner: str
    ) -> List[Dict]:
        """
        Calculate where one person's planets fall in another's houses
        
        This shows which areas of life (houses) one person activates for the other.
        """
        overlays = []

        # Build house boundaries
        house_cusps = []
        for h in houses:
            if isinstance(h, dict):
                house_cusps.append({
                    'number': h.get('number', h.get('house_number', 0)),
                    'cusp': h.get('cusp_longitude', h.get('cusp', 0))
                })
            else:
                house_cusps.append({
                    'number': getattr(h, 'house_number', 0),
                    'cusp': float(getattr(h, 'cusp_longitude', 0))
                })

        house_cusps.sort(key=lambda x: x['number'])

        for planet in planets:
            p_name = self._get_planet_name(planet)
            p_lon = self._get_longitude(planet)
            
            if p_lon is None:
                continue

            # Find which house the planet falls in
            house_num = self._find_house_for_longitude(p_lon, house_cusps)

            if house_num:
                # Get house interpretation
                house_meaning = self._get_house_overlay_meaning(p_name, house_num)

                overlays.append({
                    'planet': p_name,
                    'planet_owner': planet_owner,
                    'longitude': p_lon,
                    'house': house_num,
                    'house_owner': house_owner,
                    'interpretation': house_meaning
                })

        return overlays

    def _calculate_elemental_compatibility(
        self,
        planets1: List[Dict],
        planets2: List[Dict]
    ) -> Dict:
        """
        Compare elemental distributions between two charts
        """
        elements = {
            'fire': ['aries', 'leo', 'sagittarius'],
            'earth': ['taurus', 'virgo', 'capricorn'],
            'air': ['gemini', 'libra', 'aquarius'],
            'water': ['cancer', 'scorpio', 'pisces']
        }

        def count_elements(planets):
            counts = {'fire': 0, 'earth': 0, 'air': 0, 'water': 0}
            for p in planets:
                sign = self._get_sign(p)
                if sign:
                    for element, signs in elements.items():
                        if sign.lower() in signs:
                            counts[element] += 1
                            break
            return counts

        elements1 = count_elements(planets1)
        elements2 = count_elements(planets2)

        # Calculate compatibility based on complementary elements
        # Fire-Air and Earth-Water are complementary
        complementary_score = (
            min(elements1['fire'], elements2['air']) +
            min(elements1['air'], elements2['fire']) +
            min(elements1['earth'], elements2['water']) +
            min(elements1['water'], elements2['earth'])
        )

        # Same element = understanding but potential friction
        same_element_score = (
            min(elements1['fire'], elements2['fire']) +
            min(elements1['earth'], elements2['earth']) +
            min(elements1['air'], elements2['air']) +
            min(elements1['water'], elements2['water'])
        )

        return {
            'person1_elements': elements1,
            'person2_elements': elements2,
            'complementary_score': complementary_score,
            'same_element_score': same_element_score,
            'balance': 'complementary' if complementary_score > same_element_score else 'similar'
        }

    def _calculate_compatibility_score(self, aspects: List[Dict]) -> Dict:
        """
        Calculate overall compatibility score based on aspects
        
        Score ranges from -100 (very challenging) to +100 (very harmonious)
        """
        harmonious_points = 0
        challenging_points = 0

        for aspect in aspects:
            aspect_type = aspect['aspect_type']
            harmony = aspect.get('harmony', 'neutral')
            exactness = aspect.get('exactness', 0) / 100  # Normalize to 0-1

            weights = ASPECT_WEIGHTS.get(aspect_type, {"harmonious": 0, "challenging": 0})

            if harmony == 'harmonious':
                harmonious_points += weights['harmonious'] * exactness
            elif harmony == 'challenging':
                challenging_points += abs(weights['challenging']) * exactness
            else:
                # Neutral - small bonus
                harmonious_points += 2 * exactness

        # Normalize score to -100 to +100 range
        total = harmonious_points + challenging_points
        if total > 0:
            raw_score = ((harmonious_points - challenging_points) / total) * 100
        else:
            raw_score = 0

        # Clamp to range
        final_score = max(-100, min(100, raw_score))

        return {
            'score': round(final_score, 1),
            'harmonious_aspects': round(harmonious_points, 1),
            'challenging_aspects': round(challenging_points, 1),
            'interpretation': self._interpret_score(final_score)
        }

    def _identify_key_connections(self, aspects: List[Dict]) -> List[Dict]:
        """
        Identify the most significant synastry connections
        
        Key connections involve:
        - Sun-Moon aspects (emotional bond)
        - Venus-Mars aspects (attraction)
        - Exact aspects (orb < 2°)
        """
        key_aspects = []

        for aspect in aspects:
            p1 = aspect['person1_planet'].lower()
            p2 = aspect['person2_planet'].lower()
            orb = aspect.get('orb', 10)

            significance = 'normal'
            reason = ''

            # Sun-Moon connection
            if (p1 == 'sun' and p2 == 'moon') or (p1 == 'moon' and p2 == 'sun'):
                significance = 'very_high'
                reason = 'Conexión Sol-Luna: vínculo emocional profundo'

            # Venus-Mars connection
            elif (p1 == 'venus' and p2 == 'mars') or (p1 == 'mars' and p2 == 'venus'):
                significance = 'very_high'
                reason = 'Conexión Venus-Marte: atracción y química'

            # Moon-Moon connection
            elif p1 == 'moon' and p2 == 'moon':
                significance = 'high'
                reason = 'Luna-Luna: sintonía emocional'

            # Exact aspects
            elif orb < 2:
                significance = 'high'
                reason = f'Aspecto exacto ({orb:.1f}°)'

            # Venus aspects
            elif 'venus' in [p1, p2]:
                significance = 'medium'
                reason = 'Aspectos de Venus: armonía y afecto'

            if significance != 'normal':
                key_aspect = aspect.copy()
                key_aspect['significance'] = significance
                key_aspect['reason'] = reason
                key_aspects.append(key_aspect)

        return key_aspects

    def _generate_analysis(
        self,
        inter_aspects: List[Dict],
        overlays_1_in_2: List[Dict],
        overlays_2_in_1: List[Dict],
        score: Dict,
        key_connections: List[Dict]
    ) -> Dict:
        """
        Generate structured analysis for AI interpretation
        """
        return {
            'total_aspects': len(inter_aspects),
            'harmonious_count': len([a for a in inter_aspects if a.get('harmony') == 'harmonious']),
            'challenging_count': len([a for a in inter_aspects if a.get('harmony') == 'challenging']),
            'key_connection_count': len(key_connections),
            'compatibility_level': score['interpretation'],
            'top_5_aspects': inter_aspects[:5],
            'summary': f"Compatibilidad: {score['interpretation']} (Score: {score['score']})"
        }

    def _assess_aspect_harmony(
        self,
        planet1: str,
        planet2: str,
        aspect_type: str
    ) -> str:
        """
        Assess if an aspect is harmonious or challenging
        """
        p1, p2 = planet1.lower(), planet2.lower()
        pair = tuple(sorted([p1, p2]))

        # Trines and sextiles are generally harmonious
        if aspect_type in ['trine', 'sextile']:
            return 'harmonious'

        # Squares and oppositions are generally challenging
        if aspect_type in ['square']:
            return 'challenging'

        # Conjunctions depend on planets involved
        if aspect_type == 'conjunction':
            if pair in HARMONIOUS_CONJUNCTIONS or (p2, p1) in HARMONIOUS_CONJUNCTIONS:
                return 'harmonious'
            elif pair in CHALLENGING_CONJUNCTIONS or (p2, p1) in CHALLENGING_CONJUNCTIONS:
                return 'challenging'
            else:
                return 'neutral'

        # Opposition can be growth-oriented
        if aspect_type == 'opposition':
            return 'challenging'  # Generally challenging but growth-oriented

        return 'neutral'

    def _interpret_score(self, score: float) -> str:
        """
        Interpret compatibility score
        """
        if score >= 60:
            return 'Muy alta compatibilidad'
        elif score >= 30:
            return 'Alta compatibilidad'
        elif score >= 0:
            return 'Compatibilidad moderada'
        elif score >= -30:
            return 'Compatibilidad con desafíos'
        else:
            return 'Compatibilidad desafiante'

    def _get_house_overlay_meaning(self, planet: str, house: int) -> str:
        """
        Get interpretation for planet in partner's house
        """
        meanings = {
            ('sun', 1): 'Impacto directo en la identidad del otro',
            ('sun', 7): 'Foco en la relación misma',
            ('moon', 4): 'Conexión hogareña y emocional profunda',
            ('moon', 7): 'Necesidad emocional de la relación',
            ('venus', 5): 'Romance y creatividad juntos',
            ('venus', 7): 'Amor y armonía en la pareja',
            ('mars', 1): 'Energiza y motiva al otro',
            ('mars', 7): 'Pasión en la relación',
        }
        
        key = (planet.lower(), house)
        return meanings.get(key, f'{planet.title()} activa la casa {house} del otro')

    def _find_house_for_longitude(
        self,
        longitude: float,
        house_cusps: List[Dict]
    ) -> Optional[int]:
        """
        Determine which house a longitude falls in
        """
        if not house_cusps:
            return None

        for i, cusp in enumerate(house_cusps):
            next_i = (i + 1) % 12
            cusp_start = cusp['cusp']
            cusp_end = house_cusps[next_i]['cusp']

            if cusp_end < cusp_start:
                if longitude >= cusp_start or longitude < cusp_end:
                    return cusp['number']
            else:
                if cusp_start <= longitude < cusp_end:
                    return cusp['number']

        return 1

    def _get_planet_name(self, planet: Dict) -> str:
        """Extract planet name from planet dict or object"""
        if isinstance(planet, dict):
            return planet.get('planet_name', planet.get('name', '')).lower()
        return getattr(planet, 'planet_name', '').lower()

    def _get_longitude(self, planet) -> Optional[float]:
        """Extract longitude from planet dict or object"""
        if isinstance(planet, dict):
            return planet.get('longitude', None)
        lon = getattr(planet, 'longitude', None)
        return float(lon) if lon is not None else None

    def _get_sign(self, planet) -> Optional[str]:
        """Extract sign from planet dict or object"""
        if isinstance(planet, dict):
            return planet.get('sign', None)
        return getattr(planet, 'sign', None)
