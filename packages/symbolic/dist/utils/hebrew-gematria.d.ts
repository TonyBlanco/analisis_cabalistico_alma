/**
 * Hebrew Gematria Utilities
 *
 * Implementaciones reales de cálculos de Gematría hebrea según tradición cabalística.
 * Incluye múltiples sistemas: Standard, Katan, Gadol, Siduri, Milui, etc.
 *
 * @module symbolic/utils/hebrew-gematria
 */
/** Hebrew alphabet in order (22 letters) */
export declare const HEBREW_ALPHABET = "\u05D0\u05D1\u05D2\u05D3\u05D4\u05D5\u05D6\u05D7\u05D8\u05D9\u05DB\u05DC\u05DE\u05E0\u05E1\u05E2\u05E4\u05E6\u05E7\u05E8\u05E9\u05EA";
/** Hebrew letters array */
export declare const HEBREW_LETTERS: string[];
/** Hebrew final letters (Sofit) */
export declare const HEBREW_FINALS: Record<string, string>;
/** All Hebrew letters including finals */
export declare const ALL_HEBREW: string;
/**
 * GEMATRÍA ESTÁNDAR (Mispar Hechrachi)
 * Valores tradicionales: א=1, ב=2, ... י=10, כ=20, ... ק=100, ר=200, ש=300, ת=400
 */
export declare const GEMATRIA_STANDARD: Record<string, number>;
/**
 * GEMATRÍA KATAN (Pequeña)
 * Se reduce cada valor a un solo dígito (1-9)
 */
export declare const GEMATRIA_KATAN: Record<string, number>;
/**
 * MISPAR GADOL (Grande)
 * Las letras finales (sofit) tienen valores especiales: ך=500, ם=600, ן=700, ף=800, ץ=900
 */
export declare const MISPAR_GADOL: Record<string, number>;
/**
 * MISPAR SIDURI (Ordinal)
 * Posición en el alfabeto: א=1, ב=2, ... ת=22
 */
export declare const MISPAR_SIDURI: Record<string, number>;
/**
 * MILUI - Expansión del nombre de cada letra
 * Cada letra se expande a su nombre completo
 */
export declare const MILUI_NAMES: Record<string, string>;
/**
 * ATBASH - Inversión del alfabeto
 * א↔ת, ב↔ש, ג↔ר, etc.
 */
export declare function atbashTransform(letter: string): string;
/**
 * ALBAM - Primera mitad ↔ Segunda mitad
 * א↔ל, ב↔מ, etc. (offset de 11)
 */
export declare function albamTransform(letter: string): string;
/**
 * AVGAD - Cada letra avanza una posición
 * א→ב, ב→ג, ת→א
 */
export declare function avgadTransform(letter: string): string;
/**
 * REVERSE AVGAD - Cada letra retrocede una posición
 */
export declare function reverseAvgadTransform(letter: string): string;
/**
 * AYAK BAKAR - Grupos de 9 letras según valor numérico
 */
export declare function ayakBakarTransform(letter: string): string;
/**
 * Calcula Gematría de un texto usando una tabla específica
 */
export declare function calculateGematria(text: string, table: Record<string, number>): number;
/**
 * Calcula Gematría Estándar
 */
export declare function calcGematriaStandard(text: string): number;
/**
 * Calcula Gematría Katan
 */
export declare function calcGematriaKatan(text: string): number;
/**
 * Calcula Mispar Gadol
 */
export declare function calcMisparGadol(text: string): number;
/**
 * Calcula Mispar Siduri (Ordinal)
 */
export declare function calcMisparSiduri(text: string): number;
/**
 * Calcula Milui - Suma la gematría de los nombres expandidos
 */
export declare function calcMilui(text: string): {
    expanded: string;
    value: number;
};
/**
 * Reduce un número a un solo dígito (1-9) respetando números maestros
 */
export declare function reduceToSingleDigit(num: number, preserveMaster?: boolean): {
    original: number;
    reduced: number;
    isMaster: boolean;
};
/**
 * Aplica una transformación Temurah a todo un texto
 */
export declare function applyTemurah(text: string, method: 'atbash' | 'albam' | 'avgad' | 'reverse-avgad' | 'ayak-bakar'): string;
/**
 * Convierte letras latinas a hebreo (aproximación fonética)
 */
export declare const LATIN_TO_HEBREW: Record<string, string>;
export declare function latinToHebrew(text: string): string;
/**
 * Extrae solo letras hebreas de un texto
 */
export declare function extractHebrew(text: string): string;
export declare const KNOWN_GEMATRIA_WORDS: Record<number, string[]>;
/**
 * Busca palabras conocidas con el mismo valor de gematría
 */
export declare function findKnownWords(value: number): string[];
export declare const NUMBER_TO_SEFIRA: Record<number, {
    name: string;
    hebrew: string;
    meaning: string;
}>;
/**
 * Mapea un número a su Sefirá correspondiente (1-10, cíclico)
 */
export declare function numberToSefira(num: number): typeof NUMBER_TO_SEFIRA[1];
//# sourceMappingURL=hebrew-gematria.d.ts.map