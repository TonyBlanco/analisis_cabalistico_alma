# Harmonic Charts Engine
# This module implements Harmonic Chart calculations using Swiss Ephemeris
# Harmonics reveal hidden patterns by multiplying planetary positions

"""
HARMONIC CHARTS ENGINE — Motor de Cartas Armónicas

Las Cartas Armónicas revelan patrones ocultos en la carta natal
multiplicando todas las posiciones por un número armónico.

Fórmula:
    harmonic_position = (natal_position × harmonic_number) % 360

Armónicos principales:
- H4: Cuadraturas (tensión, acción, crisis)
- H5: Creatividad, talento, poder personal
- H7: Inspiración, mística, espiritualidad
- H8: Manifestación, karma, poder oculto
- H9: Paz interior, armonía, propósito del alma

Interpretación:
- Conjunciones en el armónico = el aspecto existe en la natal
- Ejemplo: Si Sol y Marte están en cuadratura natal (90°),
  en H4 estarán en conjunción (90° × 4 = 360° = 0°)

Uso:
- Identificar talentos ocultos (H5)
- Comprender propósito espiritual (H7, H9)
- Ver dinámica de tensión (H4)
"""

from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional, Tuple

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    print("Warning: Swiss Ephemeris not available. Harmonic calculations disabled.")

from ..config.astrology_settings import PLANET_IDS, PLANET_SYMBOLS, MAJOR_ASPECTS, ASPECT_ORBS


# Harmonic interpretations
HARMONIC_MEANINGS = {
    4: {
        'name': 'Cuarto Armónico (H4)',
        'theme': 'Tensión, acción, crisis constructiva',
        'description': 'Revela las cuadraturas y oposiciones ocultas. Muestra dónde hay tensión que impulsa la acción.',
    },
    5: {
        'name': 'Quinto Armónico (H5)',
        'theme': 'Creatividad, talento, poder personal',
        'description': 'Muestra talentos naturales y capacidad creativa. Los quintiles (72°) se vuelven conjunciones.',
    },
    7: {
        'name': 'Séptimo Armónico (H7)',
        'theme': 'Inspiración, mística, creatividad divina',
        'description': 'Conecta con la inspiración y el propósito espiritual. Los septiles (51.4°) se vuelven conjunciones.',
    },
    8: {
        'name': 'Octavo Armónico (H8)',
        'theme': 'Manifestación, karma, poder oculto',
        'description': 'Muestra capacidad de manifestación y patrones kármicos profundos.',
    },
    9: {
        'name': 'Noveno Armónico (H9)',
        'theme': 'Paz, armonía, propósito del alma',
        'description': 'Revela el nivel más elevado del ser. Los noviles (40°) muestran talentos del alma.',
    },
    12: {
        'name': 'Duodécimo Armónico (H12)',
        'theme': 'Síntesis, integración total',
        'description': 'Integra los armónicos menores. Muestra la síntesis completa de la personalidad.',
    },
}


class HarmonicsEngine:
    """
    Engine for calculating Harmonic Charts
    
    Harmonic Charts are created by multiplying all planetary positions
    by a harmonic number, then reducing to 0-360°.
    
    This reveals hidden aspect patterns:
    - Natal squares become conjunctions in H4
    - Natal quintiles become conjunctions in H5
    - Natal septiles become conjunctions in H7
    
    Key harmonics:
    - H4: Action and crisis (squares/oppositions)
    - H5: Creativity and talent
    - H7: Inspiration and spirituality
    - H9: Inner peace and soul purpose
    """

    def __init__(self):
        pass  # No Swiss Ephemeris needed for calculation (just math)

    def calculate_harmonic_chart(
        self,
        natal_planets: List[Dict],
        harmonic_number: int,
        include_aspects: bool = True
    ) -> Dict:
        """
        Calculate Harmonic Chart for given harmonic number
        
        Args:
            natal_planets: List of natal planet positions
            harmonic_number: Harmonic to calculate (4, 5, 7, 8, 9, 12, or any)
            include_aspects: Whether to calculate aspects in harmonic chart
        
        Returns:
            Dictionary with:
                - harmonic_number: int
                - harmonic_info: Dict with name, theme, description
                - planets: List of harmonic planet positions
                - aspects: List of aspects in harmonic chart
                - clusters: Groups of planets in harmonic conjunction
        """
        # Validate harmonic number
        if harmonic_number < 1:
            raise ValueError("Harmonic number must be positive")

        # Get harmonic info
        harmonic_info = HARMONIC_MEANINGS.get(harmonic_number, {
            'name': f'Armónico {harmonic_number}',
            'theme': f'Patrón oculto del {harmonic_number}',
            'description': f'Revela aspectos basados en divisiones de {harmonic_number}',
        })

        # Calculate harmonic positions
        harmonic_planets = []
        for planet in natal_planets:
            h_planet = self._calculate_harmonic_position(planet, harmonic_number)
            if h_planet:
                harmonic_planets.append(h_planet)

        # Calculate aspects in harmonic chart
        aspects = []
        if include_aspects:
            aspects = self._calculate_harmonic_aspects(harmonic_planets)

        # Find clusters (planets in harmonic conjunction)
        clusters = self._find_harmonic_clusters(harmonic_planets)

        # Generate interpretation
        interpretation = self._generate_interpretation(
            harmonic_number, harmonic_planets, clusters
        )

        return {
            'harmonic_number': harmonic_number,
            'harmonic_info': harmonic_info,
            'planets': harmonic_planets,
            'aspects': aspects,
            'clusters': clusters,
            'interpretation': interpretation,
            'method': f'harmonic_chart_H{harmonic_number}'
        }

    def calculate_multiple_harmonics(
        self,
        natal_planets: List[Dict],
        harmonics: List[int] = None
    ) -> Dict:
        """
        Calculate multiple harmonic charts at once
        
        Args:
            natal_planets: List of natal planet positions
            harmonics: List of harmonics to calculate (default: [4, 5, 7, 9])
        
        Returns:
            Dictionary with results for each harmonic
        """
        if harmonics is None:
            harmonics = [4, 5, 7, 9]

        results = {}
        for h in harmonics:
            results[f'H{h}'] = self.calculate_harmonic_chart(
                natal_planets, h, include_aspects=True
            )

        # Find cross-harmonic patterns
        common_clusters = self._find_common_clusters(results)

        return {
            'harmonics': results,
            'common_clusters': common_clusters,
            'summary': self._generate_multi_harmonic_summary(results)
        }

    def _calculate_harmonic_position(
        self,
        planet: Dict,
        harmonic: int
    ) -> Optional[Dict]:
        """
        Calculate harmonic position for a single planet
        """
        # Get natal longitude
        if isinstance(planet, dict):
            p_name = planet.get('planet_name', planet.get('name', ''))
            natal_lon = planet.get('longitude', planet.get('natal_longitude', 0))
        else:
            p_name = getattr(planet, 'planet_name', '')
            natal_lon = float(getattr(planet, 'longitude', 0))

        if not p_name:
            return None

        # Calculate harmonic position
        harmonic_lon = (natal_lon * harmonic) % 360

        # Get sign and degree
        sign, sign_degree = self._get_zodiac_sign(harmonic_lon)

        return {
            'planet_name': p_name,
            'natal_longitude': natal_lon,
            'harmonic_longitude': round(harmonic_lon, 4),
            'sign': sign,
            'sign_degree': round(sign_degree, 2),
            'symbol': PLANET_SYMBOLS.get(p_name.lower(), '?')
        }

    def _calculate_harmonic_aspects(
        self,
        harmonic_planets: List[Dict]
    ) -> List[Dict]:
        """
        Calculate aspects between planets in harmonic chart
        
        In harmonic charts, we primarily look for conjunctions,
        as these represent the hidden aspect patterns.
        """
        aspects = []

        for i, p1 in enumerate(harmonic_planets):
            for j, p2 in enumerate(harmonic_planets):
                if i >= j:
                    continue

                lon1 = p1['harmonic_longitude']
                lon2 = p2['harmonic_longitude']

                # Check conjunction (most important in harmonics)
                diff = abs(lon1 - lon2)
                if diff > 180:
                    diff = 360 - diff

                # Tight orb for harmonic conjunctions
                if diff <= 10:  # 10° orb for harmonic conjunctions
                    aspects.append({
                        'planet1': p1['planet_name'],
                        'planet2': p2['planet_name'],
                        'aspect_type': 'conjunction',
                        'orb': round(diff, 2),
                        'exactness': round(100 - (diff / 10 * 100), 1),
                        'significance': 'high' if diff <= 5 else 'medium'
                    })

                # Also check opposition (reveals natal semi-aspects)
                elif abs(diff - 180) <= 8:
                    aspects.append({
                        'planet1': p1['planet_name'],
                        'planet2': p2['planet_name'],
                        'aspect_type': 'opposition',
                        'orb': round(abs(diff - 180), 2),
                        'exactness': round(100 - (abs(diff - 180) / 8 * 100), 1),
                        'significance': 'medium'
                    })

        aspects.sort(key=lambda x: x.get('orb', 10))
        return aspects

    def _find_harmonic_clusters(
        self,
        harmonic_planets: List[Dict]
    ) -> List[Dict]:
        """
        Find clusters of planets in harmonic conjunction
        
        A cluster is 3+ planets within 15° of each other
        """
        clusters = []
        used = set()

        for i, p1 in enumerate(harmonic_planets):
            if i in used:
                continue

            cluster_planets = [p1]
            cluster_indices = {i}

            for j, p2 in enumerate(harmonic_planets):
                if j in used or j == i:
                    continue

                # Check if p2 is close to any planet in cluster
                for cp in cluster_planets:
                    diff = abs(p2['harmonic_longitude'] - cp['harmonic_longitude'])
                    if diff > 180:
                        diff = 360 - diff

                    if diff <= 15:  # 15° for cluster membership
                        cluster_planets.append(p2)
                        cluster_indices.add(j)
                        break

            if len(cluster_planets) >= 3:
                # Found a cluster
                avg_lon = sum(p['harmonic_longitude'] for p in cluster_planets) / len(cluster_planets)
                sign, degree = self._get_zodiac_sign(avg_lon)

                clusters.append({
                    'planets': [p['planet_name'] for p in cluster_planets],
                    'center_longitude': round(avg_lon, 2),
                    'sign': sign,
                    'degree': round(degree, 2),
                    'planet_count': len(cluster_planets),
                    'significance': 'very_high' if len(cluster_planets) >= 4 else 'high'
                })

                used.update(cluster_indices)

        return clusters

    def _find_common_clusters(self, results: Dict) -> List[Dict]:
        """
        Find planets that appear clustered across multiple harmonics
        """
        # Count how often each planet pair appears in clusters
        pair_counts = {}

        for h_name, h_data in results.items():
            for cluster in h_data.get('clusters', []):
                planets = cluster['planets']
                for i, p1 in enumerate(planets):
                    for p2 in planets[i+1:]:
                        pair = tuple(sorted([p1, p2]))
                        if pair not in pair_counts:
                            pair_counts[pair] = []
                        pair_counts[pair].append(h_name)

        # Find pairs that appear in multiple harmonics
        common = []
        for pair, harmonics in pair_counts.items():
            if len(harmonics) >= 2:
                common.append({
                    'planets': list(pair),
                    'harmonics': harmonics,
                    'count': len(harmonics),
                    'significance': 'Pattern found across harmonics'
                })

        return common

    def _generate_interpretation(
        self,
        harmonic: int,
        planets: List[Dict],
        clusters: List[Dict]
    ) -> Dict:
        """
        Generate interpretation for harmonic chart
        """
        interp = {
            'summary': '',
            'key_patterns': [],
            'strengths': [],
        }

        # Summary based on clusters
        if clusters:
            cluster_planets = [c['planets'] for c in clusters]
            interp['summary'] = f"Armónico {harmonic} muestra {len(clusters)} concentración(es) planetaria(s) importantes."

            for cluster in clusters:
                if 'sun' in [p.lower() for p in cluster['planets']]:
                    interp['key_patterns'].append(f"Sol en cluster: identidad conectada con tema del H{harmonic}")
                if 'moon' in [p.lower() for p in cluster['planets']]:
                    interp['key_patterns'].append(f"Luna en cluster: emociones alineadas con tema del H{harmonic}")

        # H5 specific (creativity)
        if harmonic == 5:
            interp['strengths'].append("Buscar conjunciones Sol-Venus o Sol-Mercurio para talentos creativos")

        # H7 specific (spirituality)
        elif harmonic == 7:
            interp['strengths'].append("Conjunciones con Neptune o Jupiter indican dones espirituales")

        # H9 specific (soul purpose)
        elif harmonic == 9:
            interp['strengths'].append("Este armónico revela el propósito más elevado del alma")

        return interp

    def _generate_multi_harmonic_summary(self, results: Dict) -> str:
        """
        Generate summary across all calculated harmonics
        """
        total_clusters = sum(len(r.get('clusters', [])) for r in results.values())
        
        if total_clusters >= 5:
            return "Carta con múltiples patrones armónicos fuertes - personalidad rica y compleja"
        elif total_clusters >= 2:
            return "Patrones armónicos moderados - talentos específicos bien definidos"
        else:
            return "Pocos clusters armónicos - energías más dispersas, flexibilidad"

    def _get_zodiac_sign(self, longitude: float) -> Tuple[str, float]:
        """Get zodiac sign and degree within sign"""
        lon = longitude % 360
        if lon < 0:
            lon += 360

        signs = [
            "aries", "taurus", "gemini", "cancer", "leo", "virgo",
            "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
        ]

        sign_index = int(lon // 30)
        sign = signs[sign_index % 12]
        sign_degree = lon - (sign_index * 30)

        return sign, sign_degree
