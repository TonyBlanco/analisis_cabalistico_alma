/**
 * NotarikonProcessor - P1.2 Refinamiento de Método Notarikón
 * 
 * Extracción de acrósticos con múltiples sistemas según la tradición cabalística.
 * Este módulo es OBSERVACIONAL - no interpreta, solo extrae patrones.
 * 
 * @module cabala-methods/notarikon
 */

export enum NotarikonMode {
  FIRST_LETTER = 'first_letter',      // Primera letra de cada palabra
  LAST_LETTER = 'last_letter',        // Última letra de cada palabra
  FIRST_LAST = 'first_last',          // Alternando primera y última
  MIDDLE_LETTER = 'middle_letter',    // Letra central de cada palabra
  VOWELS_ONLY = 'vowels_only',        // Solo vocales
  CONSONANTS_ONLY = 'consonants_only' // Solo consonantes
}

export interface NotarikonResult {
  mode: NotarikonMode;
  input_text: string;
  extracted_acronym: string;
  hebrew_letters: string[];
  numeric_value: number; // Gematría del acróstico
  related_words: string[]; // Palabras con mismo valor numérico
  interpretation_hint: string;
  word_count: number;
  letter_count: number;
}

/**
 * Hebrew letter Gematria values (standard/mispar gadol)
 */
const HEBREW_GEMATRIA: { [key: string]: number } = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
  'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100,
  'ר': 200, 'ש': 300, 'ת': 400
};

/**
 * Hebrew letters set for validation
 */
const HEBREW_LETTERS = 'אבגדהוזחטיכךלמםנןסעפףצץקרשת';

/**
 * Hebrew vowel letters (matres lectionis)
 */
const HEBREW_VOWELS = 'אהוי';

/**
 * Common Hebrew words by Gematria value (sample dictionary)
 * Expandable with more entries
 */
const GEMATRIA_DICTIONARY: { [value: number]: string[] } = {
  1: ['א'],
  13: ['אחד', 'אהבה'],
  26: ['יהוה'],
  45: ['אדם'],
  72: ['חסד'],
  86: ['אלהים'],
  91: ['אמן'],
  314: ['שדי'],
  358: ['משיח', 'נחש'],
};

/**
 * Interpretation hints per mode - educational, not prescriptive
 */
const MODE_HINTS: { [key in NotarikonMode]: string } = {
  [NotarikonMode.FIRST_LETTER]: 
    'El acróstico de inicios revela la intención manifiesta del mensaje.',
  [NotarikonMode.LAST_LETTER]: 
    'Las últimas letras muestran el resultado o conclusión oculta.',
  [NotarikonMode.FIRST_LAST]: 
    'La alternancia revela el diálogo entre inicio y fin, causa y efecto.',
  [NotarikonMode.MIDDLE_LETTER]: 
    'El centro oculto muestra el corazón verdadero del mensaje.',
  [NotarikonMode.VOWELS_ONLY]: 
    'Las vocales son el aliento divino, la vida dentro de las palabras.',
  [NotarikonMode.CONSONANTS_ONLY]: 
    'Las consonantes son la estructura, el esqueleto del significado.'
};

/**
 * NotarikonProcessor - Extracts acronyms using various Kabbalistic methods
 */
export class NotarikonProcessor {
  private hebrewLetters = HEBREW_LETTERS;
  private vowels = HEBREW_VOWELS;
  
  constructor() {}
  
  /**
   * Extracts acronym according to specified mode
   */
  extract(text: string, mode: NotarikonMode): NotarikonResult {
    const words = this.cleanAndSplit(text);
    let acronym = '';
    
    switch (mode) {
      case NotarikonMode.FIRST_LETTER:
        acronym = words.map(w => w[0] || '').join('');
        break;
        
      case NotarikonMode.LAST_LETTER:
        acronym = words.map(w => w[w.length - 1] || '').join('');
        break;
        
      case NotarikonMode.FIRST_LAST:
        acronym = words.map((w, i) => 
          i % 2 === 0 ? (w[0] || '') : (w[w.length - 1] || '')
        ).join('');
        break;
        
      case NotarikonMode.MIDDLE_LETTER:
        acronym = words.map(w => 
          w[Math.floor(w.length / 2)] || ''
        ).join('');
        break;
        
      case NotarikonMode.VOWELS_ONLY:
        acronym = this.extractHebrewOnly(text)
          .split('')
          .filter(c => this.vowels.includes(c))
          .join('');
        break;
        
      case NotarikonMode.CONSONANTS_ONLY:
        acronym = this.extractHebrewOnly(text)
          .split('')
          .filter(c => this.hebrewLetters.includes(c) && !this.vowels.includes(c))
          .join('');
        break;
    }
    
    const numericValue = this.calculateGematria(acronym);
    
    return {
      mode,
      input_text: text,
      extracted_acronym: acronym,
      hebrew_letters: acronym.split(''),
      numeric_value: numericValue,
      related_words: this.findRelatedWords(numericValue),
      interpretation_hint: MODE_HINTS[mode],
      word_count: words.length,
      letter_count: acronym.length
    };
  }
  
  /**
   * Cleans and splits text into words, keeping only Hebrew letters
   */
  private cleanAndSplit(text: string): string[] {
    return text
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0)
      .map(w => w.replace(/[^\u0590-\u05FF]/g, '')) // Only Hebrew letters
      .filter(w => w.length > 0);
  }
  
  /**
   * Extracts only Hebrew characters from text
   */
  private extractHebrewOnly(text: string): string {
    return text.replace(/[^\u0590-\u05FF]/g, '');
  }
  
  /**
   * Calculates Gematria value of text
   */
  private calculateGematria(text: string): number {
    return text.split('').reduce((sum, letter) => 
      sum + (HEBREW_GEMATRIA[letter] || 0), 0
    );
  }
  
  /**
   * Finds words with same numeric value
   */
  private findRelatedWords(value: number): string[] {
    return GEMATRIA_DICTIONARY[value] || [];
  }
  
  /**
   * Executes all modes and returns comparative analysis
   */
  extractAll(text: string): NotarikonResult[] {
    return Object.values(NotarikonMode).map(mode => 
      this.extract(text, mode as NotarikonMode)
    );
  }
  
  /**
   * Static method labels for UI
   */
  static getModeLabels(): { [key in NotarikonMode]: string } {
    return {
      [NotarikonMode.FIRST_LETTER]: 'Primera letra',
      [NotarikonMode.LAST_LETTER]: 'Última letra',
      [NotarikonMode.FIRST_LAST]: 'Alternando primera/última',
      [NotarikonMode.MIDDLE_LETTER]: 'Letra central',
      [NotarikonMode.VOWELS_ONLY]: 'Solo vocales',
      [NotarikonMode.CONSONANTS_ONLY]: 'Solo consonantes'
    };
  }
}

/**
 * Default singleton instance
 */
export const notarikonProcessor = new NotarikonProcessor();

export default NotarikonProcessor;
