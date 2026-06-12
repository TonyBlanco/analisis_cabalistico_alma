/**
 * Motor de Cálculo de Gematria (legacy UI / herramientas)
 * Soporta Gematria Ragil (estándar), Katan (reducido), Gadol (completo) y Atbash.
 *
 * Convención canónica de finales (Mispar Gadol): ך=500, ם=600, ן=700, ף=800, ץ=900.
 * Fuente de verdad: packages/symbolic/cabala/gematria-core.ts (MISPAR_HECHRACHI / MISPAR_GADOL).
 */

import { MISPAR_GADOL, MISPAR_HECHRACHI } from '@holistica/symbolic/cabala/gematria-core';

/** Mispar Hechrachi — finales valen igual que su letra base (ן=50, ף=80, …) */
const GEMATRIA_RAGIL: Record<string, number> = MISPAR_HECHRACHI;

/** Mispar Gadol — finales 500–900 (ן=700, ף=800, …) */
const GEMATRIA_GADOL: Record<string, number> = MISPAR_GADOL;

// Tabla Atbash (inversión: Aleph <-> Tav, Bet <-> Shin, etc.)
const ATBASH_MAP: Record<string, string> = {
  'א': 'ת', 'ב': 'ש', 'ג': 'ר', 'ד': 'ק', 'ה': 'צ', 'ו': 'פ', 'ז': 'ע', 'ח': 'ס', 'ט': 'נ',
  'י': 'מ', 'כ': 'ל', 'ל': 'כ', 'מ': 'י', 'נ': 'ט', 'ס': 'ח', 'ע': 'ז', 'פ': 'ו', 'צ': 'ה',
  'ק': 'ד', 'ר': 'ג', 'ש': 'ב', 'ת': 'א',
  // Letras finales
  'ך': 'ל', 'ם': 'י', 'ן': 'י', 'ף': 'ו', 'ץ': 'ה'
};

// Tabla de transliteración Español/Inglés -> Hebreo (simplificada)
const TRANSLITERATION_MAP: Record<string, string> = {
  'a': 'א', 'b': 'ב', 'g': 'ג', 'd': 'ד', 'h': 'ה', 'v': 'ו', 'z': 'ז', 'ch': 'ח', 't': 'ט',
  'y': 'י', 'k': 'כ', 'l': 'ל', 'm': 'מ', 'n': 'נ', 's': 'ס', 'o': 'ע', 'p': 'פ', 'tz': 'צ',
  'q': 'ק', 'r': 'ר', 'sh': 'ש', 'th': 'ת'
};

/**
 * Mapa de transliteración fonética Español/Inglés -> Hebreo
 * Permite escribir en español/inglés y ver la transliteración aproximada en hebreo
 */
export const SPANISH_TO_HEBREW_MAP: Record<string, string> = {
  'a': 'א', 'b': 'ב', 'c': 'ק', 'd': 'ד', 'e': 'ה', 'f': 'פ',
  'g': 'ג', 'h': 'ה', 'i': 'י', 'j': 'ח', 'k': 'ק', 'l': 'ל',
  'm': 'מ', 'n': 'נ', 'ñ': 'ני', 'o': 'ו', 'p': 'פ', 'q': 'ק',
  'r': 'ר', 's': 'ס', 't': 'ט', 'u': 'ו', 'v': 'ב', 'w': 'ו',
  'x': 'קס', 'y': 'י', 'z': 'ז'
};

/**
 * Casos especiales de transliteración (dígrafos y combinaciones)
 * Se procesan antes de las letras individuales
 */
const SPECIAL_CASES: Record<string, string> = {
  'ph': 'פ',
  'ch': 'ח',
  'sh': 'ש',
  'th': 'ת',
  'tz': 'צ',
  'ts': 'צ',
  'kh': 'ח',
  'gh': 'ג'
};

/**
 * Translitera texto en español/inglés a hebreo usando el mapa fonético
 * Maneja casos especiales y mantiene caracteres sin mapa (números, espacios, etc.)
 * 
 * @param text Texto en español/inglés
 * @returns Texto transliterado en hebreo
 */
export function transliterateToHebrew(text: string): string {
  if (!text) return '';
  
  // Convertir a minúsculas
  let lowerText = text.toLowerCase();
  
  // Normalizar acentos (á -> a, é -> e, etc.)
  lowerText = lowerText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  let result = '';
  let i = 0;
  
  while (i < lowerText.length) {
    let matched = false;
    
    // Primero intentar casos especiales (dígrafos)
    for (const [pattern, hebrew] of Object.entries(SPECIAL_CASES)) {
      if (lowerText.substring(i, i + pattern.length) === pattern) {
        result += hebrew;
        i += pattern.length;
        matched = true;
        break;
      }
    }
    
    // Si no hay caso especial, procesar carácter individual
    if (!matched) {
      const char = lowerText[i];
      
      if (SPANISH_TO_HEBREW_MAP[char]) {
        // Mapeo directo de letra a hebreo
        result += SPANISH_TO_HEBREW_MAP[char];
      } else if (char === ' ') {
        // Mantener espacios
        result += ' ';
      } else if (/[0-9]/.test(char)) {
        // Mantener números
        result += char;
      } else if (/[a-z]/.test(char)) {
        // Si es letra pero no está en el mapa, mantener el carácter original
        // (el usuario puede querer ver qué no se transliteró)
        result += char;
      } else {
        // Mantener otros caracteres (símbolos, puntuación, etc.)
        result += char;
      }
      
      i++;
    }
  }
  
  return result;
}

/**
 * @deprecated Usa transliterateToHebrew en su lugar
 * Translitera texto en español a hebreo usando el mapa fonético
 */
export function transliterateSpanishToHebrew(text: string): string {
  return transliterateToHebrew(text);
}

/**
 * Detecta si el texto contiene caracteres hebreos
 */
export function isHebrew(text: string): boolean {
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
}

/**
 * Reduce un número a un solo dígito (1-9), manteniendo 11 y 22
 */
function reduceNumber(num: number): number {
  if (num === 11 || num === 22) return num;
  if (num < 10) return num;
  const sum = String(num).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  return reduceNumber(sum);
}

/**
 * Calcula Gematria Ragil (estándar)
 * Cada letra tiene su valor estándar (Aleph=1, Bet=2, etc.)
 * Si el texto no es hebreo, lo translitera automáticamente
 */
export function getGematriaRagil(text: string): number {
  if (!text) return 0;
  
  // Si no es hebreo, transliterar automáticamente
  let hebrewText = text;
  if (!isHebrew(text)) {
    hebrewText = transliterateToHebrew(text);
    if (!hebrewText || !isHebrew(hebrewText)) {
      // Si después de transliterar aún no es hebreo, retornar 0
      return 0;
    }
  }
  
  let sum = 0;
  for (const char of hebrewText) {
    if (GEMATRIA_RAGIL[char]) {
      sum += GEMATRIA_RAGIL[char];
    }
  }
  
  return sum;
}

/**
 * Calcula Gematria Katan (reducido)
 * Reduce el valor total a un solo dígito (1-9), excepto 11 y 22
 */
export function getGematriaKatan(text: string): number {
  const ragil = getGematriaRagil(text);
  return reduceNumber(ragil);
}

/**
 * Calcula Gematria Gadol (completo)
 * Usa valores de letras finales (Sofit) cuando corresponda
 * Si el texto no es hebreo, lo translitera automáticamente
 */
export function getGematriaGadol(text: string): number {
  if (!text) return 0;
  
  // Si no es hebreo, transliterar automáticamente
  let hebrewText = text;
  if (!isHebrew(text)) {
    hebrewText = transliterateToHebrew(text);
    if (!hebrewText || !isHebrew(hebrewText)) {
      // Si después de transliterar aún no es hebreo, retornar 0
      return 0;
    }
  }
  
  let sum = 0;
  for (const char of hebrewText) {
    if (GEMATRIA_GADOL[char]) {
      sum += GEMATRIA_GADOL[char];
    } else if (GEMATRIA_RAGIL[char]) {
      // Si no está en Gadol pero sí en Ragil, usar Ragil
      sum += GEMATRIA_RAGIL[char];
    }
  }
  
  return sum;
}

/**
 * Aplica la transformación Atbash (inversión del alfabeto)
 * Aleph <-> Tav, Bet <-> Shin, etc.
 * Si el texto no es hebreo, lo translitera automáticamente
 */
export function getAtbashString(text: string): string {
  if (!text) return '';
  
  // Si no es hebreo, transliterar automáticamente
  let hebrewText = text;
  if (!isHebrew(text)) {
    hebrewText = transliterateToHebrew(text);
    if (!hebrewText || !isHebrew(hebrewText)) {
      // Si después de transliterar aún no es hebreo, retornar vacío
      return '';
    }
  }
  
  let result = '';
  for (const char of hebrewText) {
    if (ATBASH_MAP[char]) {
      result += ATBASH_MAP[char];
    } else {
      result += char; // Mantener caracteres no hebreos (espacios, números, etc.)
    }
  }
  
  return result;
}

/**
 * Calcula el valor Atbash de un texto
 */
export function getAtbashValue(text: string): number {
  const atbashText = getAtbashString(text);
  return getGematriaRagil(atbashText);
}

/**
 * Busca palabras clave en el diccionario que tengan el mismo valor de Gematria
 */
export function findResonances(value: number, dictionary: Array<{ word: string; transliteration?: string; meaning?: string; value: number; category?: string }>): Array<{ word: string; transliteration: string; meaning: string; value: number; category?: string }> {
  return dictionary.filter(item => item.value === value) as Array<{ word: string; transliteration: string; meaning: string; value: number; category?: string }>;
}

/**
 * Descompone un número en sus componentes de Gematria
 * Ejemplo: 613 = 400 (ת) + 200 (ר) + 13 (אהבה)
 */
export function decomposeGematria(value: number): Array<{ letter: string; value: number }> {
  const components: Array<{ letter: string; value: number }> = [];
  let remaining = value;
  
  // Ordenar valores de mayor a menor
  const sortedValues = Object.entries(GEMATRIA_RAGIL)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [letter, letterValue] of sortedValues) {
    if (remaining >= letterValue) {
      const count = Math.floor(remaining / letterValue);
      for (let i = 0; i < count; i++) {
        components.push({ letter, value: letterValue });
      }
      remaining = remaining % letterValue;
    }
  }
  
  return components;
}

