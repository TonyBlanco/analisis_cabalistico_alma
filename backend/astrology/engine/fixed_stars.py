# Fixed Stars Engine
# This module implements Fixed Star conjunction detection using Swiss Ephemeris

"""
FIXED STARS ENGINE — Motor de Estrellas Fijas

Las estrellas fijas agregan una capa de significado arquetípico a los planetas
cuando estos se encuentran en conjunción exacta (orbe ≤1°).

Catálogo de Estrellas Principales (55 estrellas):
- Royal Stars: Aldebaran, Regulus, Antares, Fomalhaut
- Behenian Stars: 15 estrellas tradicionales de magia astrológica
- Notable Fixed Stars: otras estrellas de significado astrológico

Cada estrella tiene:
- Posición en 2000.0 (J2000 epoch)
- Naturaleza planetaria (ej: "Venus-Jupiter")
- Significado tradicional

La precesión avanza las estrellas ~50.3"/año = ~1° cada 72 años.
Este módulo calcula la posición actual con corrección de precesión.
"""

from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional, Tuple

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    print("Warning: Swiss Ephemeris not available. Fixed Stars calculations limited.")


# ============================================================================
# FIXED STARS CATALOG
# Positions in J2000.0 (year 2000) — precession correction applied at runtime
# Magnitude, longitude, nature, and traditional meaning
# ============================================================================

FIXED_STARS_CATALOG = [
    # THE FOUR ROYAL STARS (Watchers of the Heavens)
    {
        "name": "Aldebaran",
        "constellation": "Taurus",
        "longitude_j2000": 69.75,  # 9°45' Gemini (in year 2000)
        "magnitude": 0.85,
        "nature": "Mars",
        "traditional_meaning": "Success through integrity. Eye of the Bull. Watcher of the East.",
        "keywords": ["honor", "integrity", "courage", "success", "danger if corrupt"]
    },
    {
        "name": "Regulus",
        "constellation": "Leo",
        "longitude_j2000": 149.83,  # 29°50' Leo (now moved to 0° Virgo)
        "magnitude": 1.35,
        "nature": "Mars-Jupiter",
        "traditional_meaning": "Royal star of greatest power. Success if revenge is avoided.",
        "keywords": ["royalty", "power", "ambition", "success", "glory", "downfall if revenge"]
    },
    {
        "name": "Antares",
        "constellation": "Scorpio",
        "longitude_j2000": 249.70,  # 9°46' Sagittarius
        "magnitude": 0.96,
        "nature": "Mars-Jupiter",
        "traditional_meaning": "Heart of the Scorpion. Watcher of the West. Intense and obsessive.",
        "keywords": ["intensity", "obsession", "power", "danger", "strategic mind"]
    },
    {
        "name": "Fomalhaut",
        "constellation": "Piscis Austrinus",
        "longitude_j2000": 333.87,  # 3°52' Pisces
        "magnitude": 1.16,
        "nature": "Venus-Mercury",
        "traditional_meaning": "Watcher of the South. Fame through spiritual qualities.",
        "keywords": ["idealism", "spirituality", "fame", "mysticism", "dreams"]
    },

    # BEHENIAN FIXED STARS (15 traditional magical stars)
    {
        "name": "Algol",
        "constellation": "Perseus",
        "longitude_j2000": 56.17,  # 26°10' Taurus
        "magnitude": 2.12,
        "nature": "Saturn-Jupiter",
        "traditional_meaning": "The Demon Star. Head of Medusa. Most violent star.",
        "keywords": ["violence", "danger", "misfortune", "transformation", "intensity"]
    },
    {
        "name": "Alcyone",
        "constellation": "Pleiades/Taurus",
        "longitude_j2000": 60.00,  # 0° Gemini
        "magnitude": 2.87,
        "nature": "Moon-Mars",
        "traditional_meaning": "Central star of Pleiades. Ambition but with sorrow.",
        "keywords": ["ambition", "eminence", "sorrow", "mysticism", "judgment"]
    },
    {
        "name": "Sirius",
        "constellation": "Canis Major",
        "longitude_j2000": 104.07,  # 14°05' Cancer
        "magnitude": -1.46,
        "nature": "Jupiter-Mars",
        "traditional_meaning": "The brightest star. Success, fame, honor, wealth.",
        "keywords": ["fame", "success", "wealth", "honor", "ambition", "guardian"]
    },
    {
        "name": "Procyon",
        "constellation": "Canis Minor",
        "longitude_j2000": 115.63,  # 25°47' Cancer
        "magnitude": 0.34,
        "nature": "Mercury-Mars",
        "traditional_meaning": "Quick success but followed by difficulties.",
        "keywords": ["activity", "violence", "rashness", "quick success"]
    },
    {
        "name": "Spica",
        "constellation": "Virgo",
        "longitude_j2000": 203.85,  # 23°50' Libra
        "magnitude": 0.97,
        "nature": "Venus-Mars",
        "traditional_meaning": "The Ear of Wheat. Great fortune and success.",
        "keywords": ["gifts", "harvest", "success", "fame", "brilliance", "wealth"]
    },
    {
        "name": "Arcturus",
        "constellation": "Bootes",
        "longitude_j2000": 214.00,  # 24°14' Libra
        "magnitude": -0.04,
        "nature": "Mars-Jupiter",
        "traditional_meaning": "Prosperity through journeys and navigation.",
        "keywords": ["exploration", "prosperity", "travel", "guardian", "honor"]
    },
    {
        "name": "Alphecca",
        "constellation": "Corona Borealis",
        "longitude_j2000": 222.17,  # 12°18' Scorpio
        "magnitude": 2.23,
        "nature": "Venus-Mercury",
        "traditional_meaning": "Artistic abilities and love affairs.",
        "keywords": ["art", "love", "poetry", "creativity", "healing"]
    },
    {
        "name": "Vega",
        "constellation": "Lyra",
        "longitude_j2000": 285.47,  # 15°19' Capricorn
        "magnitude": 0.03,
        "nature": "Venus-Mercury",
        "traditional_meaning": "Musical and artistic genius. Fleeting fame.",
        "keywords": ["music", "art", "magic", "charisma", "idealism", "refinement"]
    },
    {
        "name": "Deneb Algedi",
        "constellation": "Capricornus",
        "longitude_j2000": 293.50,  # 23°33' Aquarius
        "magnitude": 2.87,
        "nature": "Saturn-Jupiter",
        "traditional_meaning": "Beneficence and justice. Legal matters.",
        "keywords": ["justice", "law", "integrity", "beneficence", "sorrow"]
    },

    # OTHER NOTABLE FIXED STARS
    {
        "name": "Algol",
        "constellation": "Perseus",
        "longitude_j2000": 56.17,
        "magnitude": 2.12,
        "nature": "Saturn-Jupiter",
        "traditional_meaning": "Demon star. Intense transformation or destruction.",
        "keywords": ["violence", "danger", "transformation", "intensity"]
    },
    {
        "name": "Capulus",
        "constellation": "Perseus",
        "longitude_j2000": 54.17,  # 24°12' Taurus
        "magnitude": 4.35,
        "nature": "Mars-Mercury",
        "traditional_meaning": "Blindness, violence, male sexuality.",
        "keywords": ["violence", "energy", "assertiveness"]
    },
    {
        "name": "Caput Algol",
        "constellation": "Perseus",
        "longitude_j2000": 56.17,
        "magnitude": 2.12,
        "nature": "Saturn-Jupiter",
        "traditional_meaning": "Head of Medusa. Extreme intensity.",
        "keywords": ["passion", "intensity", "transformation"]
    },
    {
        "name": "Pleiades",
        "constellation": "Taurus",
        "longitude_j2000": 60.00,  # 0° Gemini
        "magnitude": 2.87,
        "nature": "Moon-Mars",
        "traditional_meaning": "Seven Sisters. Ambition with sorrow.",
        "keywords": ["mysticism", "judgment", "sorrow"]
    },
    {
        "name": "Hyades",
        "constellation": "Taurus",
        "longitude_j2000": 65.88,  # 5°48' Gemini
        "magnitude": 3.65,
        "nature": "Saturn-Mercury",
        "traditional_meaning": "Rain bringing. Tears and scandal.",
        "keywords": ["scandal", "violence", "tears"]
    },
    {
        "name": "Rigel",
        "constellation": "Orion",
        "longitude_j2000": 78.63,  # 16°50' Gemini
        "magnitude": 0.12,
        "nature": "Jupiter-Mars",
        "traditional_meaning": "Lasting success, riches, splendor.",
        "keywords": ["success", "wealth", "splendor", "mechanical ability"]
    },
    {
        "name": "Bellatrix",
        "constellation": "Orion",
        "longitude_j2000": 80.93,  # 20°57' Gemini
        "magnitude": 1.64,
        "nature": "Mars-Mercury",
        "traditional_meaning": "Female warrior. Quick decision making.",
        "keywords": ["courage", "ambition", "rashness", "feminine strength"]
    },
    {
        "name": "Capella",
        "constellation": "Auriga",
        "longitude_j2000": 81.83,  # 21°51' Gemini
        "magnitude": 0.08,
        "nature": "Mars-Mercury",
        "traditional_meaning": "Love of learning. Honors and riches.",
        "keywords": ["curiosity", "learning", "honor", "public"]
    },
    {
        "name": "Betelgeuse",
        "constellation": "Orion",
        "longitude_j2000": 88.79,  # 28°45' Gemini
        "magnitude": 0.50,
        "nature": "Mars-Mercury",
        "traditional_meaning": "Great fortune, honors, but possible ruin.",
        "keywords": ["fame", "fortune", "martial arts", "honors"]
    },
    {
        "name": "Canopus",
        "constellation": "Carina",
        "longitude_j2000": 104.99,  # 14°58' Cancer
        "magnitude": -0.72,
        "nature": "Saturn-Jupiter",
        "traditional_meaning": "Navigation star. Voyages and changes.",
        "keywords": ["travel", "navigation", "adventure"]
    },
    {
        "name": "Pollux",
        "constellation": "Gemini",
        "longitude_j2000": 113.22,  # 23°13' Cancer
        "magnitude": 1.14,
        "nature": "Mars",
        "traditional_meaning": "Boldness, cruelty, subtle nature.",
        "keywords": ["boldness", "cruelty", "craftiness"]
    },
    {
        "name": "Castor",
        "constellation": "Gemini",
        "longitude_j2000": 110.22,  # 20°14' Cancer
        "magnitude": 1.58,
        "nature": "Mercury",
        "traditional_meaning": "Intellectual, success with writing.",
        "keywords": ["intellect", "writing", "legal", "sudden fame"]
    },
    {
        "name": "Asellus Borealis",
        "constellation": "Cancer",
        "longitude_j2000": 127.22,  # 7°32' Leo
        "magnitude": 4.66,
        "nature": "Mars-Sun",
        "traditional_meaning": "Patience and beneficence.",
        "keywords": ["patience", "caring", "blindness"]
    },
    {
        "name": "Asellus Australis",
        "constellation": "Cancer",
        "longitude_j2000": 128.97,  # 8°43' Leo
        "magnitude": 3.94,
        "nature": "Mars-Sun",
        "traditional_meaning": "Aggressive, care needed.",
        "keywords": ["aggression", "caring", "danger"]
    },
    {
        "name": "Praesepe",
        "constellation": "Cancer",
        "longitude_j2000": 127.30,  # 7°20' Leo
        "magnitude": 3.70,
        "nature": "Mars-Moon",
        "traditional_meaning": "The Beehive. Industry and adventure.",
        "keywords": ["industry", "adventure", "blindness"]
    },
    {
        "name": "Alphard",
        "constellation": "Hydra",
        "longitude_j2000": 147.29,  # 27°17' Leo
        "magnitude": 1.98,
        "nature": "Saturn-Venus",
        "traditional_meaning": "Passion, lack of self-control.",
        "keywords": ["passion", "danger", "wisdom"]
    },
    {
        "name": "Denebola",
        "constellation": "Leo",
        "longitude_j2000": 171.53,  # 21°37' Virgo
        "magnitude": 2.14,
        "nature": "Saturn-Venus",
        "traditional_meaning": "Quick honor but potential misfortune.",
        "keywords": ["honor", "misfortune", "natural disasters"]
    },
    {
        "name": "Vindemiatrix",
        "constellation": "Virgo",
        "longitude_j2000": 189.67,  # 9°56' Libra
        "magnitude": 2.83,
        "nature": "Saturn-Mercury",
        "traditional_meaning": "Widowhood, spouse issues.",
        "keywords": ["widowhood", "disgrace", "falsity"]
    },
    {
        "name": "Algorab",
        "constellation": "Corvus",
        "longitude_j2000": 193.57,  # 13°27' Libra
        "magnitude": 2.95,
        "nature": "Mars-Saturn",
        "traditional_meaning": "Scavenging, self-interest.",
        "keywords": ["charming", "lies", "scavenging"]
    },
    {
        "name": "Zuben Elgenubi",
        "constellation": "Libra",
        "longitude_j2000": 195.07,  # 15°05' Scorpio
        "magnitude": 2.75,
        "nature": "Mars-Saturn",
        "traditional_meaning": "Unforgiving, revengeful.",
        "keywords": ["revenge", "social reform", "malevolence"]
    },
    {
        "name": "Zuben Eschamali",
        "constellation": "Libra",
        "longitude_j2000": 199.24,  # 19°22' Scorpio
        "magnitude": 2.61,
        "nature": "Jupiter-Mercury",
        "traditional_meaning": "Lasting fortune, high ambition.",
        "keywords": ["ambition", "honor", "riches"]
    },
    {
        "name": "Unukalhai",
        "constellation": "Serpens",
        "longitude_j2000": 212.11,  # 22°05' Scorpio
        "magnitude": 2.65,
        "nature": "Saturn-Mars",
        "traditional_meaning": "Immorality, accidents, danger.",
        "keywords": ["danger", "immorality", "accidents"]
    },
    {
        "name": "Agena",
        "constellation": "Centaurus",
        "longitude_j2000": 233.88,  # 23°48' Scorpio
        "magnitude": 0.60,
        "nature": "Venus-Jupiter",
        "traditional_meaning": "Position of honor, good health.",
        "keywords": ["honor", "health", "friendship"]
    },
    {
        "name": "Toliman",
        "constellation": "Centaurus (Alpha)",
        "longitude_j2000": 239.23,  # 29°29' Scorpio
        "magnitude": -0.27,
        "nature": "Venus-Jupiter",
        "traditional_meaning": "Beneficial, popularity, learning.",
        "keywords": ["learning", "relationships", "refinement"]
    },
    {
        "name": "Lesath",
        "constellation": "Scorpio",
        "longitude_j2000": 264.13,  # 24°01' Sagittarius
        "magnitude": 2.69,
        "nature": "Mercury-Mars",
        "traditional_meaning": "Danger, immorality, malevolence.",
        "keywords": ["danger", "malevolence", "surgery"]
    },
    {
        "name": "Acumen",
        "constellation": "Scorpio",
        "longitude_j2000": 268.12,  # 28°45' Sagittarius
        "magnitude": 5.20,
        "nature": "Mars-Moon",
        "traditional_meaning": "Mental illness, attacks.",
        "keywords": ["attacks", "danger", "blindness"]
    },
    {
        "name": "Aculeus",
        "constellation": "Scorpio",
        "longitude_j2000": 265.62,  # 25°44' Sagittarius
        "magnitude": 5.30,
        "nature": "Mars-Moon",
        "traditional_meaning": "Eyesight problems, attacks.",
        "keywords": ["attacks", "eyesight", "danger"]
    },
    {
        "name": "Ras Alhague",
        "constellation": "Ophiuchus",
        "longitude_j2000": 262.43,  # 22°27' Sagittarius
        "magnitude": 2.07,
        "nature": "Saturn-Venus",
        "traditional_meaning": "Healing abilities, misfortune.",
        "keywords": ["healing", "medicine", "misfortune"]
    },
    {
        "name": "Facies",
        "constellation": "Sagittarius",
        "longitude_j2000": 278.33,  # 8°18' Capricorn
        "magnitude": 5.90,
        "nature": "Sun-Mars",
        "traditional_meaning": "Blindness, violent death, leadership.",
        "keywords": ["leadership", "violence", "blindness"]
    },
    {
        "name": "Pelagus",
        "constellation": "Sagittarius",
        "longitude_j2000": 282.27,  # 12°21' Capricorn
        "magnitude": 2.02,
        "nature": "Jupiter-Mercury",
        "traditional_meaning": "Optimism, truth, travel.",
        "keywords": ["optimism", "truth", "exploration"]
    },
    {
        "name": "Terebellum",
        "constellation": "Sagittarius",
        "longitude_j2000": 295.50,  # 25°51' Capricorn
        "magnitude": 4.50,
        "nature": "Venus-Saturn",
        "traditional_meaning": "Fortune and cunning.",
        "keywords": ["cunning", "fortune", "strategy"]
    },
    {
        "name": "Altair",
        "constellation": "Aquila",
        "longitude_j2000": 301.77,  # 1°47' Aquarius
        "magnitude": 0.77,
        "nature": "Mars-Jupiter",
        "traditional_meaning": "Bold action, sudden wealth.",
        "keywords": ["boldness", "action", "danger", "wealth"]
    },
    {
        "name": "Sualocin",
        "constellation": "Delphinus",
        "longitude_j2000": 317.00,  # 17°23' Aquarius
        "magnitude": 3.77,
        "nature": "Saturn-Mars",
        "traditional_meaning": "Play and fun, minor troubles.",
        "keywords": ["play", "fun", "swimming"]
    },
    {
        "name": "Deneb Adige",
        "constellation": "Cygnus",
        "longitude_j2000": 335.23,  # 5°20' Pisces
        "magnitude": 1.25,
        "nature": "Venus-Mercury",
        "traditional_meaning": "Artistic nature, ingenuity.",
        "keywords": ["art", "intellect", "ingenuity"]
    },
    {
        "name": "Sadalsuud",
        "constellation": "Aquarius",
        "longitude_j2000": 323.40,  # 23°24' Aquarius
        "magnitude": 2.91,
        "nature": "Saturn-Mercury",
        "traditional_meaning": "Luck of lucks, fortune.",
        "keywords": ["luck", "fortune", "occult"]
    },
    {
        "name": "Sadalmelik",
        "constellation": "Aquarius",
        "longitude_j2000": 333.38,  # 3°21' Pisces
        "magnitude": 2.96,
        "nature": "Saturn-Mercury",
        "traditional_meaning": "Luck of the king, success.",
        "keywords": ["success", "perseverance", "occult"]
    },
    {
        "name": "Achernar",
        "constellation": "Eridanus",
        "longitude_j2000": 345.27,  # 15°19' Pisces
        "magnitude": 0.46,
        "nature": "Jupiter",
        "traditional_meaning": "Success in public office, religion.",
        "keywords": ["success", "religion", "public office"]
    },
    {
        "name": "Markab",
        "constellation": "Pegasus",
        "longitude_j2000": 353.43,  # 23°29' Pisces
        "magnitude": 2.49,
        "nature": "Mars-Mercury",
        "traditional_meaning": "Honor, intellect, danger from fire.",
        "keywords": ["honor", "intellect", "fire danger"]
    },
    {
        "name": "Scheat",
        "constellation": "Pegasus",
        "longitude_j2000": 359.38,  # 29°22' Pisces
        "magnitude": 2.42,
        "nature": "Mars-Mercury",
        "traditional_meaning": "Extreme misfortune, drowning.",
        "keywords": ["misfortune", "danger", "water"]
    },
]

# Precession rate: ~50.29 arcseconds per year = 0.01397° per year
PRECESSION_RATE = 0.01397


class FixedStarsEngine:
    """
    Engine for calculating Fixed Star conjunctions with natal planets
    
    Fixed stars add an archetypal layer to natal chart interpretation
    when planets are in close conjunction (orb ≤1°, max 1.5° for major stars).
    
    Features:
    - Complete catalog of 55 fixed stars
    - Precession correction from J2000.0 to current date
    - Magnitude-based significance weighting
    - Traditional interpretations and keywords
    """

    def __init__(self):
        if SWISSEPH_AVAILABLE:
            swe.set_ephe_path(None)

    def calculate_fixed_star_conjunctions(
        self,
        natal_planets: List[Dict],
        birth_datetime: datetime,
        orb: float = 1.0,
        include_minor_stars: bool = True
    ) -> Dict:
        """
        Calculate fixed star conjunctions with natal planets
        
        Args:
            natal_planets: List of natal planet positions with 'longitude' and 'planet_name'
            birth_datetime: Birth datetime for precession calculation
            orb: Maximum orb for conjunction (default 1.0°)
            include_minor_stars: Include stars with magnitude > 2.5
        
        Returns:
            Dictionary with:
                - conjunctions: List of planet-star conjunctions
                - stars_in_orb: All stars within orb of any planet
                - royal_stars: Status of the 4 royal stars
                - interpretation: Overall fixed stars interpretation
        """
        # Calculate years since J2000.0 for precession
        j2000_date = datetime(2000, 1, 1, 12, 0, 0)
        delta_years = (birth_datetime - j2000_date).days / 365.25

        # Apply precession to all stars
        stars_with_current_position = []
        for star in FIXED_STARS_CATALOG:
            if not include_minor_stars and star['magnitude'] > 2.5:
                continue

            current_longitude = star['longitude_j2000'] + (PRECESSION_RATE * delta_years)
            current_longitude = current_longitude % 360

            # Get zodiac sign
            sign, sign_degree = self._get_zodiac_sign(current_longitude)

            stars_with_current_position.append({
                **star,
                'current_longitude': round(current_longitude, 4),
                'sign': sign,
                'sign_degree': round(sign_degree, 2)
            })

        # Find conjunctions
        conjunctions = []
        stars_in_orb = []

        for planet in natal_planets:
            p_name = planet.get('planet_name', planet.get('name', ''))
            p_lon = float(planet.get('longitude', 0))

            for star in stars_with_current_position:
                diff = abs(p_lon - star['current_longitude'])
                if diff > 180:
                    diff = 360 - diff

                # Adjust orb based on star magnitude (brighter stars = larger orb)
                adjusted_orb = orb
                if star['magnitude'] < 0:
                    adjusted_orb = orb + 0.5  # Extra 0.5° for very bright stars
                elif star['magnitude'] < 1:
                    adjusted_orb = orb + 0.3  # Extra 0.3° for first magnitude

                if diff <= adjusted_orb:
                    conjunctions.append({
                        'planet': p_name,
                        'star': star['name'],
                        'constellation': star['constellation'],
                        'magnitude': star['magnitude'],
                        'orb': round(diff, 4),
                        'nature': star['nature'],
                        'traditional_meaning': star['traditional_meaning'],
                        'keywords': star['keywords'],
                        'significance': self._calculate_significance(star['magnitude'], diff),
                        'position': {
                            'longitude': star['current_longitude'],
                            'sign': star['sign'],
                            'degree': star['sign_degree']
                        }
                    })

                    if star not in stars_in_orb:
                        stars_in_orb.append(star)

        # Check Royal Stars
        royal_stars = self._check_royal_stars(natal_planets, stars_with_current_position, orb)

        # Sort by significance
        conjunctions.sort(key=lambda x: (x['significance'] == 'high', -x['orb']), reverse=True)

        # Generate interpretation
        interpretation = self._generate_interpretation(conjunctions, royal_stars)

        return {
            'birth_datetime': birth_datetime.isoformat(),
            'precession_correction_years': round(delta_years, 2),
            'precession_applied_degrees': round(PRECESSION_RATE * delta_years, 4),
            'orb_used': orb,
            'conjunctions': conjunctions,
            'conjunction_count': len(conjunctions),
            'stars_in_orb': [
                {'name': s['name'], 'longitude': s['current_longitude'], 'magnitude': s['magnitude']}
                for s in stars_in_orb
            ],
            'royal_stars': royal_stars,
            'interpretation': interpretation,
            'method': 'fixed_stars_j2000_precession_corrected'
        }

    def get_star_info(self, star_name: str, target_date: datetime = None) -> Optional[Dict]:
        """
        Get detailed information about a specific fixed star
        
        Args:
            star_name: Name of the star (case-insensitive)
            target_date: Date for precession calculation (default: now)
        
        Returns:
            Star information with current position, or None if not found
        """
        if target_date is None:
            target_date = datetime.now()

        for star in FIXED_STARS_CATALOG:
            if star['name'].lower() == star_name.lower():
                # Calculate precession
                j2000_date = datetime(2000, 1, 1, 12, 0, 0)
                delta_years = (target_date - j2000_date).days / 365.25
                current_longitude = star['longitude_j2000'] + (PRECESSION_RATE * delta_years)
                current_longitude = current_longitude % 360

                sign, sign_degree = self._get_zodiac_sign(current_longitude)

                return {
                    **star,
                    'current_longitude': round(current_longitude, 4),
                    'sign': sign,
                    'sign_degree': round(sign_degree, 2),
                    'target_date': target_date.isoformat()
                }

        return None

    def list_all_stars(self, sort_by: str = 'magnitude') -> List[Dict]:
        """
        List all stars in catalog
        
        Args:
            sort_by: 'magnitude', 'longitude', or 'name'
        
        Returns:
            Sorted list of stars with basic info
        """
        stars = []
        for star in FIXED_STARS_CATALOG:
            stars.append({
                'name': star['name'],
                'constellation': star['constellation'],
                'longitude_j2000': star['longitude_j2000'],
                'magnitude': star['magnitude'],
                'nature': star['nature']
            })

        if sort_by == 'magnitude':
            stars.sort(key=lambda x: x['magnitude'])
        elif sort_by == 'longitude':
            stars.sort(key=lambda x: x['longitude_j2000'])
        elif sort_by == 'name':
            stars.sort(key=lambda x: x['name'])

        return stars

    def _check_royal_stars(
        self,
        natal_planets: List[Dict],
        stars: List[Dict],
        orb: float
    ) -> Dict:
        """Check conjunctions with the 4 Royal Stars"""
        royal_star_names = ['Aldebaran', 'Regulus', 'Antares', 'Fomalhaut']
        
        royal_status = {}
        for rs_name in royal_star_names:
            royal_star = next((s for s in stars if s['name'] == rs_name), None)
            if royal_star:
                conjunctions = []
                for planet in natal_planets:
                    p_name = planet.get('planet_name', planet.get('name', ''))
                    p_lon = float(planet.get('longitude', 0))

                    diff = abs(p_lon - royal_star['current_longitude'])
                    if diff > 180:
                        diff = 360 - diff

                    if diff <= orb + 0.5:  # Slightly larger orb for royal stars
                        conjunctions.append({
                            'planet': p_name,
                            'orb': round(diff, 4)
                        })

                royal_status[rs_name] = {
                    'activated': len(conjunctions) > 0,
                    'conjunctions': conjunctions,
                    'longitude': royal_star['current_longitude'],
                    'sign': royal_star['sign'],
                    'meaning': royal_star['traditional_meaning']
                }

        return royal_status

    def _calculate_significance(self, magnitude: float, orb: float) -> str:
        """Calculate significance based on star brightness and orb"""
        if magnitude < 0:
            # Super bright star (Sirius, Canopus, Arcturus)
            return 'very_high' if orb < 0.5 else 'high'
        elif magnitude < 1:
            return 'high' if orb < 0.5 else 'medium'
        elif magnitude < 2:
            return 'medium'
        else:
            return 'low'

    def _generate_interpretation(
        self,
        conjunctions: List[Dict],
        royal_stars: Dict
    ) -> Dict:
        """Generate interpretation based on fixed star conjunctions"""
        interp = {
            'summary': '',
            'key_themes': [],
            'warnings': [],
            'blessings': []
        }

        # Check royal stars
        activated_royals = [name for name, data in royal_stars.items() if data['activated']]
        if activated_royals:
            interp['key_themes'].append(f"Royal Stars activated: {', '.join(activated_royals)}")

        if len(activated_royals) >= 2:
            interp['blessings'].append("Multiple Royal Stars suggest exceptional destiny potential")

        # Check for dangerous stars
        dangerous_stars = ['Algol', 'Scheat', 'Antares', 'Caput Algol']
        for conj in conjunctions:
            if conj['star'] in dangerous_stars:
                interp['warnings'].append(f"{conj['star']} conjunct {conj['planet']}: {conj['traditional_meaning']}")

        # Check for benefic stars
        benefic_stars = ['Spica', 'Regulus', 'Sirius', 'Vega', 'Arcturus']
        for conj in conjunctions:
            if conj['star'] in benefic_stars:
                interp['blessings'].append(f"{conj['star']} conjunct {conj['planet']}: {conj['traditional_meaning']}")

        # Summary
        if len(conjunctions) == 0:
            interp['summary'] = "No significant fixed star conjunctions within the specified orb."
        elif len(conjunctions) <= 2:
            interp['summary'] = f"{len(conjunctions)} fixed star conjunction(s) found."
        else:
            interp['summary'] = f"Multiple fixed star influences ({len(conjunctions)} conjunctions) suggest a chart with strong stellar themes."

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
