# Astrology configuration settings
# This module contains all configuration constants for the astrology engine

from typing import Dict, Any

# Default astronomical settings
DEFAULT_HOUSE_SYSTEM = "P"  # Placidus house system
DEFAULT_ZODIAC_TYPE = "T"   # Tropical zodiac

# Planet IDs (Swiss Ephemeris standard)
PLANET_IDS = {
    "sun": 0,
    "moon": 1,
    "mercury": 2,
    "venus": 3,
    "mars": 4,
    "jupiter": 5,
    "saturn": 6,
    "uranus": 7,
    "neptune": 8,
    "pluto": 9,
    "north_node": 11,
    "south_node": 12,
    "chiron": 15,
}

# House systems available
HOUSE_SYSTEMS = {
    "P": "Placidus",
    "K": "Koch",
    "R": "Regiomontanus",
    "C": "Campanus",
    "A": "Equal",
    "W": "Whole Sign",
    "V": "Vehlow",
    "X": "Axial Rotation",
    "H": "Azimuthal",
    "T": "Polich/Page",
    "B": "Alcabitius",
}

# Zodiac types
ZODIAC_TYPES = {
    "T": "Tropical",
    "S": "Sidereal",
}

# Aspect orbs (in degrees)
ASPECT_ORBS = {
    "conjunction": 8,
    "opposition": 8,
    "trine": 8,
    "square": 7,
    "sextile": 6,
    "quincunx": 5,
    "semisquare": 2,
    "sesquiquadrate": 2,
}

# Major aspects
MAJOR_ASPECTS = {
    0: "conjunction",
    60: "sextile",
    90: "square",
    120: "trine",
    150: "quincunx",
    180: "opposition",
}

# Minor aspects
MINOR_ASPECTS = {
    30: "semisextile",
    45: "semiquadrate",
    72: "quintile",
    135: "sesquiquadrate",
    144: "biquintile",
}

# Planet symbols for display
PLANET_SYMBOLS = {
    "sun": "☉",
    "moon": "☽",
    "mercury": "☿",
    "venus": "♀",
    "mars": "♂",
    "jupiter": "♃",
    "saturn": "♄",
    "uranus": "⛢",
    "neptune": "♆",
    "pluto": "♇",
    "north_node": "☊",
    "south_node": "☋",
    "chiron": "⚷",
}

# Zodiac sign symbols
ZODIAC_SYMBOLS = {
    "aries": "♈",
    "taurus": "♉",
    "gemini": "♊",
    "cancer": "♋",
    "leo": "♌",
    "virgo": "♍",
    "libra": "♎",
    "scorpio": "♏",
    "sagittarius": "♐",
    "capricorn": "♑",
    "aquarius": "♒",
    "pisces": "♓",
}

# House names
HOUSE_NAMES = {
    1: "Ascendant",
    2: "Wealth",
    3: "Siblings",
    4: "Home",
    5: "Children",
    6: "Health",
    7: "Partnership",
    8: "Transformation",
    9: "Philosophy",
    10: "Career",
    11: "Friends",
    12: "Spirituality",
}