# Arabic Parts Engine
# This module implements traditional Arabic (Hermetic) Lots calculations

"""
ARABIC PARTS ENGINE — Motor de Partes Árabes (Lotes Herméticos)

Las Partes Árabes son puntos matemáticos sensibles calculados a partir de
la posición de planetas y puntos de la carta. Son técnicas helenísticas
preservadas por astrólogos árabes medievales.

Fórmula General:
    Parte = ASC + Planeta_A - Planeta_B (mod 360°)

Para cartas nocturnas (Sol bajo el horizonte), algunas fórmulas se invierten:
    Parte_Noche = ASC + Planeta_B - Planeta_A (mod 360°)

Partes Principales:
1. Parte de la Fortuna (Tyche): ASC + Luna - Sol
   → Recursos materiales, bienestar, el cuerpo

2. Parte del Espíritu (Daimon): ASC + Sol - Luna
   → Propósito, voluntad, el alma

3. Parte de Eros: ASC + Venus - Espíritu
   → Amor romántico, deseo

4. Parte de Necesidad: ASC + Fortuna - Mercurio
   → Necesidades materiales

... y muchas más (20+ partes implementadas)

Nota histórica:
Las partes fueron sistemáticamente usadas por Abu Ma'shar, Al-Biruni,
Bonatti, y otros maestros de la astrología medieval.
"""

from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional, Tuple


# ============================================================================
# ARABIC PARTS CATALOG
# Each part has: name, formula (diurnal), formula_nocturnal (if different),
# meaning, and rulership (traditional ruler of the part)
# ============================================================================

ARABIC_PARTS_CATALOG = [
    # ========================
    # THE SEVEN HERMETIC LOTS
    # ========================
    {
        "name": "Part of Fortune",
        "arabic_name": "Pars Fortunae",
        "formula_diurnal": ("ASC", "+", "MOON", "-", "SUN"),
        "formula_nocturnal": ("ASC", "+", "SUN", "-", "MOON"),
        "meaning": "Material fortune, the body, wealth, health, general well-being",
        "rulership": "Moon",
        "significance": "major",
        "keywords": ["fortune", "wealth", "health", "body", "luck"]
    },
    {
        "name": "Part of Spirit",
        "arabic_name": "Pars Spiritus",
        "formula_diurnal": ("ASC", "+", "SUN", "-", "MOON"),
        "formula_nocturnal": ("ASC", "+", "MOON", "-", "SUN"),
        "meaning": "Soul, free will, purpose, mind, character, intellect",
        "rulership": "Sun",
        "significance": "major",
        "keywords": ["spirit", "soul", "will", "purpose", "mind"]
    },
    {
        "name": "Part of Eros",
        "arabic_name": "Pars Amoris",
        "formula_diurnal": ("ASC", "+", "VENUS", "-", "SPIRIT"),
        "formula_nocturnal": ("ASC", "+", "SPIRIT", "-", "VENUS"),
        "meaning": "Romantic love, desire, attraction, passionate connections",
        "rulership": "Venus",
        "significance": "major",
        "keywords": ["love", "desire", "attraction", "romance"]
    },
    {
        "name": "Part of Victory",
        "arabic_name": "Pars Victoriae",
        "formula_diurnal": ("ASC", "+", "JUPITER", "-", "SPIRIT"),
        "formula_nocturnal": ("ASC", "+", "SPIRIT", "-", "JUPITER"),
        "meaning": "Success, triumph, achievement, overcoming obstacles",
        "rulership": "Jupiter",
        "significance": "major",
        "keywords": ["victory", "success", "achievement", "triumph"]
    },
    {
        "name": "Part of Necessity",
        "arabic_name": "Pars Necessitatis",
        "formula_diurnal": ("ASC", "+", "FORTUNE", "-", "MERCURY"),
        "formula_nocturnal": ("ASC", "+", "MERCURY", "-", "FORTUNE"),
        "meaning": "Bondage, constraints, limitations, obligations, fate",
        "rulership": "Mercury",
        "significance": "major",
        "keywords": ["necessity", "obligation", "constraint", "fate"]
    },
    {
        "name": "Part of Courage",
        "arabic_name": "Pars Audaciae",
        "formula_diurnal": ("ASC", "+", "FORTUNE", "-", "MARS"),
        "formula_nocturnal": ("ASC", "+", "MARS", "-", "FORTUNE"),
        "meaning": "Boldness, bravery, audacity, military matters",
        "rulership": "Mars",
        "significance": "major",
        "keywords": ["courage", "boldness", "bravery", "action"]
    },
    {
        "name": "Part of Nemesis",
        "arabic_name": "Pars Nemesis",
        "formula_diurnal": ("ASC", "+", "FORTUNE", "-", "SATURN"),
        "formula_nocturnal": ("ASC", "+", "SATURN", "-", "FORTUNE"),
        "meaning": "Hidden enemies, self-undoing, karma, retribution",
        "rulership": "Saturn",
        "significance": "major",
        "keywords": ["nemesis", "karma", "enemies", "retribution"]
    },

    # ========================
    # RELATIONSHIP PARTS
    # ========================
    {
        "name": "Part of Marriage",
        "arabic_name": "Pars Matrimonii",
        "formula_diurnal": ("ASC", "+", "DSC", "-", "VENUS"),
        "formula_nocturnal": None,  # Same formula
        "meaning": "Marriage, committed partnerships, spouse",
        "rulership": "Venus",
        "significance": "moderate",
        "keywords": ["marriage", "partnership", "spouse", "commitment"]
    },
    {
        "name": "Part of Children",
        "arabic_name": "Pars Filiorum",
        "formula_diurnal": ("ASC", "+", "SATURN", "-", "JUPITER"),
        "formula_nocturnal": ("ASC", "+", "JUPITER", "-", "SATURN"),
        "meaning": "Children, fertility, creative offspring",
        "rulership": "Jupiter",
        "significance": "moderate",
        "keywords": ["children", "fertility", "offspring", "creativity"]
    },
    {
        "name": "Part of the Father",
        "arabic_name": "Pars Patris",
        "formula_diurnal": ("ASC", "+", "SUN", "-", "SATURN"),
        "formula_nocturnal": ("ASC", "+", "SATURN", "-", "SUN"),
        "meaning": "Father, paternal lineage, authority figures",
        "rulership": "Saturn",
        "significance": "moderate",
        "keywords": ["father", "authority", "paternal"]
    },
    {
        "name": "Part of the Mother",
        "arabic_name": "Pars Matris",
        "formula_diurnal": ("ASC", "+", "MOON", "-", "VENUS"),
        "formula_nocturnal": ("ASC", "+", "VENUS", "-", "MOON"),
        "meaning": "Mother, maternal lineage, nurturing",
        "rulership": "Venus",
        "significance": "moderate",
        "keywords": ["mother", "nurture", "maternal"]
    },
    {
        "name": "Part of Brothers/Siblings",
        "arabic_name": "Pars Fratrum",
        "formula_diurnal": ("ASC", "+", "SATURN", "-", "JUPITER"),
        "formula_nocturnal": ("ASC", "+", "JUPITER", "-", "SATURN"),
        "meaning": "Siblings, brothers, sisters, close allies",
        "rulership": "Mercury",
        "significance": "minor",
        "keywords": ["siblings", "brothers", "sisters"]
    },

    # ========================
    # CAREER & WEALTH PARTS
    # ========================
    {
        "name": "Part of Profession",
        "arabic_name": "Pars Professionis",
        "formula_diurnal": ("ASC", "+", "MOON", "-", "SATURN"),
        "formula_nocturnal": ("ASC", "+", "SATURN", "-", "MOON"),
        "meaning": "Career, profession, vocation, public role",
        "rulership": "Saturn",
        "significance": "moderate",
        "keywords": ["career", "profession", "work", "vocation"]
    },
    {
        "name": "Part of Commerce",
        "arabic_name": "Pars Mercaturae",
        "formula_diurnal": ("ASC", "+", "MERCURY", "-", "SPIRIT"),
        "formula_nocturnal": ("ASC", "+", "SPIRIT", "-", "MERCURY"),
        "meaning": "Business, trade, commerce, financial acumen",
        "rulership": "Mercury",
        "significance": "minor",
        "keywords": ["business", "commerce", "trade", "money"]
    },
    {
        "name": "Part of Inheritance",
        "arabic_name": "Pars Hereditatis",
        "formula_diurnal": ("ASC", "+", "MOON", "-", "SATURN"),
        "formula_nocturnal": ("ASC", "+", "SATURN", "-", "MOON"),
        "meaning": "Inheritance, legacies, resources from others",
        "rulership": "Saturn",
        "significance": "minor",
        "keywords": ["inheritance", "legacy", "ancestral wealth"]
    },

    # ========================
    # SPIRITUAL PARTS
    # ========================
    {
        "name": "Part of Faith",
        "arabic_name": "Pars Fidei",
        "formula_diurnal": ("ASC", "+", "MERCURY", "-", "MOON"),
        "formula_nocturnal": ("ASC", "+", "MOON", "-", "MERCURY"),
        "meaning": "Religious faith, spiritual beliefs, philosophy",
        "rulership": "Jupiter",
        "significance": "moderate",
        "keywords": ["faith", "religion", "belief", "spirituality"]
    },
    {
        "name": "Part of Understanding",
        "arabic_name": "Pars Intellectus",
        "formula_diurnal": ("ASC", "+", "MARS", "-", "MERCURY"),
        "formula_nocturnal": ("ASC", "+", "MERCURY", "-", "MARS"),
        "meaning": "Intellectual capacity, learning, comprehension",
        "rulership": "Mercury",
        "significance": "minor",
        "keywords": ["intellect", "understanding", "learning"]
    },
    {
        "name": "Part of Hidden Things",
        "arabic_name": "Pars Occulti",
        "formula_diurnal": ("ASC", "+", "MOON", "-", "NEPTUNE"),
        "formula_nocturnal": None,
        "meaning": "Secrets, hidden matters, occult knowledge",
        "rulership": "Neptune",
        "significance": "minor",
        "keywords": ["secrets", "hidden", "occult", "mystery"]
    },

    # ========================
    # HEALTH PARTS
    # ========================
    {
        "name": "Part of Death",
        "arabic_name": "Pars Mortis",
        "formula_diurnal": ("ASC", "+", "HOUSE_8", "-", "MOON"),
        "formula_nocturnal": ("ASC", "+", "MOON", "-", "HOUSE_8"),
        "meaning": "Mortality, transformation, major life transitions",
        "rulership": "Saturn",
        "significance": "moderate",
        "keywords": ["death", "transformation", "endings"]
    },
    {
        "name": "Part of Sickness",
        "arabic_name": "Pars Infirmitatis",
        "formula_diurnal": ("ASC", "+", "MARS", "-", "SATURN"),
        "formula_nocturnal": ("ASC", "+", "SATURN", "-", "MARS"),
        "meaning": "Health vulnerabilities, chronic conditions",
        "rulership": "Saturn",
        "significance": "minor",
        "keywords": ["sickness", "illness", "health issues"]
    },

    # ========================
    # TRAVEL PARTS
    # ========================
    {
        "name": "Part of Journeys",
        "arabic_name": "Pars Itineris",
        "formula_diurnal": ("ASC", "+", "HOUSE_9", "-", "HOUSE_9_RULER"),
        "formula_nocturnal": None,
        "meaning": "Travel, journeys, foreign lands",
        "rulership": "Jupiter",
        "significance": "minor",
        "keywords": ["travel", "journeys", "exploration"]
    },
]


class ArabicPartsEngine:
    """
    Engine for calculating Arabic Parts (Lots/Hermetic Points)
    
    Arabic Parts are mathematical sensitive points derived from the
    positions of planets and chart angles using specific formulas.
    
    Features:
    - 22 traditional Arabic Parts
    - Diurnal/Nocturnal formula distinction
    - House placement for each part
    - Aspect detection to natal planets
    - Traditional interpretations
    """

    def __init__(self):
        pass

    def calculate_arabic_parts(
        self,
        natal_planets: List[Dict],
        natal_houses: List[Dict],
        asc_longitude: float,
        mc_longitude: float,
        sun_longitude: float,
        moon_longitude: float,
        is_nocturnal: bool = None,
        include_minor_parts: bool = True
    ) -> Dict:
        """
        Calculate all Arabic Parts for a natal chart
        
        Args:
            natal_planets: List of natal planets with longitude
            natal_houses: List of house cusps with cusp_longitude
            asc_longitude: Ascendant longitude
            mc_longitude: Midheaven longitude
            sun_longitude: Sun longitude
            moon_longitude: Moon longitude
            is_nocturnal: True if nighttime chart (Sun below horizon), None = auto-detect
            include_minor_parts: Whether to include minor significance parts
        
        Returns:
            Dictionary with all calculated parts and interpretations
        """
        # Auto-detect nocturnal if not specified
        if is_nocturnal is None:
            is_nocturnal = self._is_nocturnal_chart(sun_longitude, asc_longitude)

        # Build lookup dictionaries
        planet_lons = self._build_planet_lookup(natal_planets)
        house_cusps = self._build_house_lookup(natal_houses)

        # Pre-calculate derived points for formula evaluation
        dsc_longitude = (asc_longitude + 180) % 360
        ic_longitude = (mc_longitude + 180) % 360

        # Store special points
        special_points = {
            'ASC': asc_longitude,
            'MC': mc_longitude,
            'DSC': dsc_longitude,
            'IC': ic_longitude,
        }

        # Add house cusps
        for h in house_cusps:
            special_points[f'HOUSE_{h}'] = house_cusps[h]

        # Calculate each part
        calculated_parts = []
        fortune_lon = None  # Need this for parts that reference Fortune
        spirit_lon = None   # Need this for parts that reference Spirit

        # First pass: calculate Fortune and Spirit (needed by other parts)
        for part_def in ARABIC_PARTS_CATALOG:
            if part_def['name'] == 'Part of Fortune':
                fortune_lon = self._calculate_part(
                    part_def, planet_lons, special_points, is_nocturnal
                )
            elif part_def['name'] == 'Part of Spirit':
                spirit_lon = self._calculate_part(
                    part_def, planet_lons, special_points, is_nocturnal
                )

        # Add Fortune and Spirit to lookup
        planet_lons['FORTUNE'] = fortune_lon
        planet_lons['SPIRIT'] = spirit_lon

        # Second pass: calculate all parts
        for part_def in ARABIC_PARTS_CATALOG:
            # Skip minor parts if not requested
            if not include_minor_parts and part_def['significance'] == 'minor':
                continue

            try:
                part_lon = self._calculate_part(
                    part_def, planet_lons, special_points, is_nocturnal
                )

                if part_lon is not None:
                    # Get sign and degree
                    sign, sign_degree = self._get_zodiac_sign(part_lon)

                    # Find house placement
                    house = self._find_house(part_lon, list(house_cusps.values()))

                    # Find aspects to natal planets
                    aspects = self._find_aspects_to_part(part_lon, natal_planets)

                    calculated_parts.append({
                        'name': part_def['name'],
                        'arabic_name': part_def['arabic_name'],
                        'longitude': round(part_lon, 4),
                        'sign': sign,
                        'sign_degree': round(sign_degree, 2),
                        'house': house,
                        'is_nocturnal_formula': is_nocturnal and part_def.get('formula_nocturnal') is not None,
                        'meaning': part_def['meaning'],
                        'rulership': part_def['rulership'],
                        'significance': part_def['significance'],
                        'keywords': part_def['keywords'],
                        'aspects': aspects
                    })
            except Exception as e:
                # Skip parts that can't be calculated (missing planets, etc.)
                continue

        # Group by significance
        major_parts = [p for p in calculated_parts if p['significance'] == 'major']
        moderate_parts = [p for p in calculated_parts if p['significance'] == 'moderate']
        minor_parts = [p for p in calculated_parts if p['significance'] == 'minor']

        # Generate interpretation
        interpretation = self._generate_interpretation(
            calculated_parts, is_nocturnal, natal_planets
        )

        return {
            'chart_type': 'nocturnal' if is_nocturnal else 'diurnal',
            'total_parts_calculated': len(calculated_parts),
            'parts': calculated_parts,
            'major_parts': major_parts,
            'moderate_parts': moderate_parts,
            'minor_parts': minor_parts,
            'fortune': next((p for p in calculated_parts if p['name'] == 'Part of Fortune'), None),
            'spirit': next((p for p in calculated_parts if p['name'] == 'Part of Spirit'), None),
            'interpretation': interpretation,
            'method': 'arabic_parts_traditional'
        }

    def calculate_single_part(
        self,
        part_name: str,
        natal_planets: List[Dict],
        natal_houses: List[Dict],
        asc_longitude: float,
        mc_longitude: float,
        sun_longitude: float,
        is_nocturnal: bool = None
    ) -> Optional[Dict]:
        """
        Calculate a single specific Arabic Part
        
        Args:
            part_name: Name of the part (e.g., "Part of Fortune")
            ... other args same as calculate_arabic_parts
        
        Returns:
            Part calculation result or None if not found
        """
        # Find part definition
        part_def = None
        for p in ARABIC_PARTS_CATALOG:
            if p['name'].lower() == part_name.lower():
                part_def = p
                break

        if not part_def:
            return None

        # Auto-detect nocturnal
        if is_nocturnal is None:
            is_nocturnal = self._is_nocturnal_chart(sun_longitude, asc_longitude)

        # Build lookups
        planet_lons = self._build_planet_lookup(natal_planets)
        house_cusps = self._build_house_lookup(natal_houses)

        special_points = {
            'ASC': asc_longitude,
            'MC': mc_longitude,
            'DSC': (asc_longitude + 180) % 360,
            'IC': (mc_longitude + 180) % 360,
        }
        for h in house_cusps:
            special_points[f'HOUSE_{h}'] = house_cusps[h]

        # Calculate Fortune and Spirit if needed
        if 'FORTUNE' in str(part_def.get('formula_diurnal', [])):
            fortune_def = next((p for p in ARABIC_PARTS_CATALOG if p['name'] == 'Part of Fortune'), None)
            if fortune_def:
                planet_lons['FORTUNE'] = self._calculate_part(
                    fortune_def, planet_lons, special_points, is_nocturnal
                )
        if 'SPIRIT' in str(part_def.get('formula_diurnal', [])):
            spirit_def = next((p for p in ARABIC_PARTS_CATALOG if p['name'] == 'Part of Spirit'), None)
            if spirit_def:
                planet_lons['SPIRIT'] = self._calculate_part(
                    spirit_def, planet_lons, special_points, is_nocturnal
                )

        # Calculate the part
        part_lon = self._calculate_part(part_def, planet_lons, special_points, is_nocturnal)

        if part_lon is None:
            return None

        sign, sign_degree = self._get_zodiac_sign(part_lon)
        house = self._find_house(part_lon, list(house_cusps.values()))
        aspects = self._find_aspects_to_part(part_lon, natal_planets)

        return {
            'name': part_def['name'],
            'arabic_name': part_def['arabic_name'],
            'longitude': round(part_lon, 4),
            'sign': sign,
            'sign_degree': round(sign_degree, 2),
            'house': house,
            'is_nocturnal_formula': is_nocturnal and part_def.get('formula_nocturnal') is not None,
            'meaning': part_def['meaning'],
            'rulership': part_def['rulership'],
            'keywords': part_def['keywords'],
            'aspects': aspects
        }

    def _calculate_part(
        self,
        part_def: Dict,
        planet_lons: Dict,
        special_points: Dict,
        is_nocturnal: bool
    ) -> Optional[float]:
        """Calculate a single part from its formula"""
        # Choose formula based on chart type
        if is_nocturnal and part_def.get('formula_nocturnal'):
            formula = part_def['formula_nocturnal']
        else:
            formula = part_def['formula_diurnal']

        if not formula:
            return None

        # Formula format: (point1, op1, point2, op2, point3)
        # Example: ("ASC", "+", "MOON", "-", "SUN")
        try:
            point1 = self._get_point_longitude(formula[0], planet_lons, special_points)
            point2 = self._get_point_longitude(formula[2], planet_lons, special_points)
            point3 = self._get_point_longitude(formula[4], planet_lons, special_points)

            if any(p is None for p in [point1, point2, point3]):
                return None

            # Calculate: ASC + point2 - point3
            result = point1 + point2 - point3
            result = result % 360
            if result < 0:
                result += 360

            return result

        except (IndexError, KeyError, TypeError):
            return None

    def _get_point_longitude(
        self,
        point_name: str,
        planet_lons: Dict,
        special_points: Dict
    ) -> Optional[float]:
        """Get longitude for a point (planet, angle, or house)"""
        # Check special points first (ASC, MC, etc.)
        if point_name in special_points:
            return special_points[point_name]

        # Check planets
        if point_name.upper() in planet_lons:
            return planet_lons[point_name.upper()]

        # Try lowercase
        if point_name.lower() in planet_lons:
            return planet_lons[point_name.lower()]

        return None

    def _build_planet_lookup(self, natal_planets: List[Dict]) -> Dict:
        """Build planet name -> longitude lookup"""
        lookup = {}
        for planet in natal_planets:
            name = planet.get('planet_name', planet.get('name', '')).upper()
            lon = float(planet.get('longitude', 0))
            lookup[name] = lon
        return lookup

    def _build_house_lookup(self, natal_houses: List[Dict]) -> Dict:
        """Build house number -> cusp longitude lookup"""
        lookup = {}
        for house in natal_houses:
            num = house.get('number', house.get('house_number', house.get('house', 0)))
            cusp = float(house.get('cusp_longitude', house.get('cusp', 0)))
            lookup[num] = cusp
        return lookup

    def _is_nocturnal_chart(self, sun_longitude: float, asc_longitude: float) -> bool:
        """
        Determine if chart is nocturnal (Sun below horizon)
        
        Sun is above horizon if it's between DSC and ASC (going through MC)
        Sun is below horizon if it's between ASC and DSC (going through IC)
        """
        dsc = (asc_longitude + 180) % 360

        # Check if Sun is in upper hemisphere
        if asc_longitude < dsc:
            sun_above = asc_longitude > sun_longitude or sun_longitude >= dsc
        else:
            sun_above = dsc <= sun_longitude < asc_longitude

        return not sun_above  # Nocturnal if sun NOT above

    def _find_house(self, longitude: float, house_cusps: List[float]) -> int:
        """Find which house a longitude falls in"""
        if len(house_cusps) < 12:
            return 1

        lon = longitude % 360

        for i in range(12):
            cusp1 = house_cusps[i] if i < len(house_cusps) else house_cusps[0]
            cusp2 = house_cusps[(i + 1) % 12]

            # Handle wrap around
            if cusp2 < cusp1:
                if lon >= cusp1 or lon < cusp2:
                    return i + 1
            else:
                if cusp1 <= lon < cusp2:
                    return i + 1

        return 1

    def _find_aspects_to_part(
        self,
        part_lon: float,
        natal_planets: List[Dict],
        orb: float = 5.0
    ) -> List[Dict]:
        """Find aspects from natal planets to this part"""
        aspects = []
        aspect_angles = [
            (0, 'conjunction', 8.0),
            (60, 'sextile', 4.0),
            (90, 'square', 6.0),
            (120, 'trine', 6.0),
            (180, 'opposition', 8.0),
        ]

        for planet in natal_planets:
            p_name = planet.get('planet_name', planet.get('name', ''))
            p_lon = float(planet.get('longitude', 0))

            diff = abs(part_lon - p_lon)
            if diff > 180:
                diff = 360 - diff

            for angle, aspect_name, aspect_orb in aspect_angles:
                if abs(diff - angle) <= aspect_orb:
                    aspects.append({
                        'planet': p_name,
                        'aspect': aspect_name,
                        'orb': round(abs(diff - angle), 2)
                    })
                    break  # Only one aspect per planet

        return aspects

    def _generate_interpretation(
        self,
        parts: List[Dict],
        is_nocturnal: bool,
        natal_planets: List[Dict]
    ) -> Dict:
        """Generate interpretation of Arabic Parts"""
        interp = {
            'summary': '',
            'fortune_analysis': '',
            'spirit_analysis': '',
            'key_themes': [],
            'house_concentrations': []
        }

        if not parts:
            interp['summary'] = "No Arabic Parts could be calculated."
            return interp

        # Analyze Fortune and Spirit
        fortune = next((p for p in parts if p['name'] == 'Part of Fortune'), None)
        spirit = next((p for p in parts if p['name'] == 'Part of Spirit'), None)

        if fortune:
            interp['fortune_analysis'] = f"Part of Fortune in {fortune['sign'].capitalize()} in House {fortune['house']}: {fortune['meaning']}"
        if spirit:
            interp['spirit_analysis'] = f"Part of Spirit in {spirit['sign'].capitalize()} in House {spirit['house']}: {spirit['meaning']}"

        # Find house concentrations
        house_counts = {}
        for part in parts:
            h = part['house']
            house_counts[h] = house_counts.get(h, 0) + 1

        for h, count in sorted(house_counts.items(), key=lambda x: -x[1]):
            if count >= 2:
                interp['house_concentrations'].append(f"House {h} has {count} parts - emphasized life area")

        # Key themes based on major parts
        major = [p for p in parts if p['significance'] == 'major']
        for p in major:
            if p['aspects']:
                interp['key_themes'].append(f"{p['name']}: {', '.join([a['aspect'] + ' ' + a['planet'] for a in p['aspects']])}")

        # Summary
        chart_type = "nocturnal" if is_nocturnal else "diurnal"
        interp['summary'] = f"{len(parts)} Arabic Parts calculated for {chart_type} chart. Fortune and Spirit indicate the material and spiritual focus of this life."

        return interp

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
