"""Curated Sefaria references for key kabbalistic correspondences.

IMPORTANT:
- We only store reference metadata (title/url).
- We do NOT persist or return verbatim excerpts/snippets from Sefaria texts.
  The frontend can open the URL for full context.

This keeps the system scalable (refs can be expanded) while avoiding
redistribution of copyrighted text.
"""

from typing import Dict, List


SefariaRef = Dict[str, str]


PLANET_TO_SEFARIA_REFS: Dict[str, List[SefariaRef]] = {
    # Identity / Tiferet
    'Sun': [
        {
            'title': 'Zohar 1:1a',
            'url': 'https://www.sefaria.org/Zohar.1.1a',
        },
        {
            'title': 'Tanya, Likutei Amarim 1',
            'url': 'https://www.sefaria.org/Tanya%2C_Likutei_Amarim.1',
        },
    ],
    # Emotions / Yesod-Malkhut axis (curated starting points)
    'Moon': [
        {
            'title': 'Tanya, Likutei Amarim 9',
            'url': 'https://www.sefaria.org/Tanya%2C_Likutei_Amarim.9',
        },
        {
            'title': 'Tanya, Igeret HaKodesh 25',
            'url': 'https://www.sefaria.org/Tanya%2C_Igeret_HaKodesh.25',
        },
    ],
    # Limits / Binah
    'Saturn': [
        {
            'title': 'Sefer Yetzirah 4',
            'url': 'https://www.sefaria.org/Sefer_Yetzirah.4',
        },
        {
            'title': 'Tanya, Likutei Amarim 27',
            'url': 'https://www.sefaria.org/Tanya%2C_Likutei_Amarim.27',
        },
    ],
}


def get_sefaria_refs_for_planet(planet_title: str) -> List[SefariaRef]:
    return PLANET_TO_SEFARIA_REFS.get(planet_title, [])
