/**
 * Diccionario de Palabras Clave Hebreas para Gematria
 * Incluye palabras importantes con sus valores y significados
 */

export interface HebrewKeyword {
  word: string;           // Palabra en hebreo
  transliteration: string; // Transliteración
  meaning: string;        // Significado en español
  value: number;          // Valor de Gematria Ragil
  category?: string;      // Categoría (opcional)
}

export const HEBREW_KEYWORDS: HebrewKeyword[] = [
  // Nombres de Dios y Conceptos Divinos
  {
    word: 'אלהים',
    transliteration: 'Elohim',
    meaning: 'Dios (nombre divino)',
    value: 86,
    category: 'Divino'
  },
  {
    word: 'יהוה',
    transliteration: 'YHVH',
    meaning: 'Tetragrammaton (nombre inefable)',
    value: 26,
    category: 'Divino'
  },
  {
    word: 'אחד',
    transliteration: 'Echad',
    meaning: 'Uno (unidad divina)',
    value: 13,
    category: 'Divino'
  },
  {
    word: 'אהבה',
    transliteration: 'Ahavah',
    meaning: 'Amor',
    value: 13,
    category: 'Emociones'
  },
  
  // Conceptos Espirituales Fundamentales
  {
    word: 'שלום',
    transliteration: 'Shalom',
    meaning: 'Paz, completitud',
    value: 376,
    category: 'Espiritual'
  },
  {
    word: 'אור',
    transliteration: 'Or',
    meaning: 'Luz',
    value: 207,
    category: 'Espiritual'
  },
  {
    word: 'חיים',
    transliteration: 'Chaim',
    meaning: 'Vida',
    value: 68,
    category: 'Espiritual'
  },
  {
    word: 'נשמה',
    transliteration: 'Neshamah',
    meaning: 'Alma',
    value: 395,
    category: 'Espiritual'
  },
  {
    word: 'רוח',
    transliteration: 'Ruach',
    meaning: 'Espíritu, viento',
    value: 214,
    category: 'Espiritual'
  },
  
  // Mesiánico y Redención
  {
    word: 'משיח',
    transliteration: 'Mashiach',
    meaning: 'Mesías, ungido',
    value: 358,
    category: 'Mesiánico'
  },
  {
    word: 'גאולה',
    transliteration: 'Geulah',
    meaning: 'Redención',
    value: 45,
    category: 'Mesiánico'
  },
  {
    word: 'תשובה',
    transliteration: 'Teshuvah',
    meaning: 'Retorno, arrepentimiento',
    value: 713,
    category: 'Mesiánico'
  },
  
  // Sefirot y Árbol de la Vida
  {
    word: 'חכמה',
    transliteration: 'Chochmah',
    meaning: 'Sabiduría (Sefirá)',
    value: 73,
    category: 'Sefirot'
  },
  {
    word: 'בינה',
    transliteration: 'Binah',
    meaning: 'Entendimiento (Sefirá)',
    value: 67,
    category: 'Sefirot'
  },
  {
    word: 'חסד',
    transliteration: 'Chesed',
    meaning: 'Bondad, misericordia (Sefirá)',
    value: 72,
    category: 'Sefirot'
  },
  {
    word: 'גבורה',
    transliteration: 'Gevurah',
    meaning: 'Fuerza, juicio (Sefirá)',
    value: 216,
    category: 'Sefirot'
  },
  {
    word: 'תפארת',
    transliteration: 'Tiferet',
    meaning: 'Belleza, armonía (Sefirá)',
    value: 1081,
    category: 'Sefirot'
  },
  
  // Conceptos de Torá y Estudio
  {
    word: 'תורה',
    transliteration: 'Torah',
    meaning: 'Ley, enseñanza',
    value: 611,
    category: 'Torá'
  },
  {
    word: 'מצוה',
    transliteration: 'Mitzvah',
    meaning: 'Mandamiento',
    value: 141,
    category: 'Torá'
  },
  {
    word: 'תפילה',
    transliteration: 'Tefillah',
    meaning: 'Oración',
    value: 515,
    category: 'Torá'
  },
  
  // Valores y Virtudes
  {
    word: 'צדק',
    transliteration: 'Tzedek',
    meaning: 'Justicia, caridad',
    value: 194,
    category: 'Valores'
  },
  {
    word: 'אמת',
    transliteration: 'Emet',
    meaning: 'Verdad',
    value: 441,
    category: 'Valores'
  },
  {
    word: 'חסד',
    transliteration: 'Chesed',
    meaning: 'Bondad',
    value: 72,
    category: 'Valores'
  },
  
  // Números Especiales
  {
    word: 'חי',
    transliteration: 'Chai',
    meaning: 'Vida (número 18)',
    value: 18,
    category: 'Números'
  },
  {
    word: 'טוב',
    transliteration: 'Tov',
    meaning: 'Bueno',
    value: 17,
    category: 'Valores'
  }
];

/**
 * Busca palabras por valor de Gematria
 */
export function findWordsByValue(value: number): HebrewKeyword[] {
  return HEBREW_KEYWORDS.filter(keyword => keyword.value === value);
}

/**
 * Busca palabras por categoría
 */
export function findWordsByCategory(category: string): HebrewKeyword[] {
  return HEBREW_KEYWORDS.filter(keyword => keyword.category === category);
}

/**
 * Busca palabras por significado o transliteración
 */
export function searchWords(query: string): HebrewKeyword[] {
  const lowerQuery = query.toLowerCase();
  return HEBREW_KEYWORDS.filter(keyword =>
    keyword.meaning.toLowerCase().includes(lowerQuery) ||
    keyword.transliteration.toLowerCase().includes(lowerQuery) ||
    keyword.word.includes(query)
  );
}

