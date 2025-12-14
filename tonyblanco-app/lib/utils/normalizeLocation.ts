/**
 * Location Normalization Utilities
 * 
 * Normalizes city/country names for better geocoding matching.
 * Handles accents, capitalization, and whitespace.
 */

/**
 * Removes accents and diacritics from a string
 * Examples: "Havána" → "Havana", "São Paulo" → "Sao Paulo"
 */
export function removeAccents(str: string): string {
  return str
    .normalize('NFD') // Decompose characters (á → a + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .normalize('NFC'); // Recompose
}

/**
 * Normalizes a city or country name for geocoding
 * - Trims whitespace
 * - Converts to lowercase
 * - Removes accents
 * 
 * Examples:
 * "La Habana" → "la habana"
 * "Havána" → "havana"
 * "São Paulo" → "sao paulo"
 */
export function normalizeLocationName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  return removeAccents(name.trim().toLowerCase());
}

/**
 * Gets common English name variations for cities
 * Useful for geocoding when the original language name fails
 */
const CITY_TRANSLATIONS: Record<string, string> = {
  'la habana': 'havana',
  'habana': 'havana',
  'méxico': 'mexico city',
  'mexico df': 'mexico city',
  'ciudad de méxico': 'mexico city',
  'cdmx': 'mexico city',
  'são paulo': 'sao paulo',
  'sao paulo': 'sao paulo',
  'buenos aires': 'buenos aires', // same in English
  'rio de janeiro': 'rio de janeiro', // same in English
};

/**
 * Returns English translation of city name if available
 */
export function getEnglishCityName(normalizedCity: string): string | null {
  const normalized = normalizeLocationName(normalizedCity);
  return CITY_TRANSLATIONS[normalized] || null;
}

/**
 * Generates multiple search variations for a city name
 * Returns array of variations to try in order
 */
export function getCitySearchVariations(city: string, country?: string): string[] {
  const variations: string[] = [];
  
  if (!city || city.trim().length === 0) {
    return variations;
  }

  const normalized = normalizeLocationName(city);
  
  // 1. Original city name (as-is)
  variations.push(city.trim());
  
  // 2. Normalized city name (no accents, lowercase)
  const normalizedOriginal = normalized;
  if (normalizedOriginal !== city.trim().toLowerCase()) {
    variations.push(normalizedOriginal);
  }
  
  // 3. English translation if available
  const englishName = getEnglishCityName(city);
  if (englishName && !variations.includes(englishName)) {
    variations.push(englishName);
  }
  
  // 4. Title case version (e.g., "La Habana" → "La habana")
  const titleCase = city.trim().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  if (titleCase !== city.trim() && !variations.includes(titleCase)) {
    variations.push(titleCase);
  }
  
  return [...new Set(variations)]; // Remove duplicates
}
