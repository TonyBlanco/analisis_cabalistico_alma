/**
 * Hebrew Gematria Utilities
 *
 * Implementaciones reales de cálculos de Gematría hebrea según tradición cabalística.
 * Incluye múltiples sistemas: Standard, Katan, Gadol, Siduri, Milui, etc.
 *
 * @module symbolic/utils/hebrew-gematria
 */
// ============================================================================
// ALFABETO HEBREO Y VALORES
// ============================================================================
/** Hebrew alphabet in order (22 letters) */
export const HEBREW_ALPHABET = 'אבגדהוזחטיכלמנסעפצקרשת';
/** Hebrew letters array */
export const HEBREW_LETTERS = HEBREW_ALPHABET.split('');
/** Hebrew final letters (Sofit) */
export const HEBREW_FINALS = {
    'ך': 'כ', // Kaf sofit
    'ם': 'מ', // Mem sofit
    'ן': 'נ', // Nun sofit
    'ף': 'פ', // Peh sofit
    'ץ': 'צ', // Tsadi sofit
};
/** All Hebrew letters including finals */
export const ALL_HEBREW = HEBREW_ALPHABET + 'ךםןףץ';
// ============================================================================
// GEMATRÍA VALUES
// ============================================================================
/**
 * GEMATRÍA ESTÁNDAR (Mispar Hechrachi)
 * Valores tradicionales: א=1, ב=2, ... י=10, כ=20, ... ק=100, ר=200, ש=300, ת=400
 */
export const GEMATRIA_STANDARD = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
    'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100,
    'ר': 200, 'ש': 300, 'ת': 400
};
/**
 * GEMATRÍA KATAN (Pequeña)
 * Se reduce cada valor a un solo dígito (1-9)
 */
export const GEMATRIA_KATAN = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 1, 'כ': 2, 'ך': 2, 'ל': 3, 'מ': 4, 'ם': 4, 'נ': 5, 'ן': 5,
    'ס': 6, 'ע': 7, 'פ': 8, 'ף': 8, 'צ': 9, 'ץ': 9, 'ק': 1,
    'ר': 2, 'ש': 3, 'ת': 4
};
/**
 * MISPAR GADOL (Grande)
 * Las letras finales (sofit) tienen valores especiales: ך=500, ם=600, ן=700, ף=800, ץ=900
 */
export const MISPAR_GADOL = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ך': 500, 'ל': 30, 'מ': 40, 'ם': 600, 'נ': 50, 'ן': 700,
    'ס': 60, 'ע': 70, 'פ': 80, 'ף': 800, 'צ': 90, 'ץ': 900, 'ק': 100,
    'ר': 200, 'ש': 300, 'ת': 400
};
/**
 * MISPAR SIDURI (Ordinal)
 * Posición en el alfabeto: א=1, ב=2, ... ת=22
 */
export const MISPAR_SIDURI = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 11, 'ך': 11, 'ל': 12, 'מ': 13, 'ם': 13, 'נ': 14, 'ן': 14,
    'ס': 15, 'ע': 16, 'פ': 17, 'ף': 17, 'צ': 18, 'ץ': 18, 'ק': 19,
    'ר': 20, 'ש': 21, 'ת': 22
};
/**
 * MILUI - Expansión del nombre de cada letra
 * Cada letra se expande a su nombre completo
 */
export const MILUI_NAMES = {
    'א': 'אלף', 'ב': 'בית', 'ג': 'גימל', 'ד': 'דלת', 'ה': 'הא',
    'ו': 'ואו', 'ז': 'זין', 'ח': 'חית', 'ט': 'טית', 'י': 'יוד',
    'כ': 'כף', 'ך': 'כף', 'ל': 'למד', 'מ': 'מם', 'ם': 'מם',
    'נ': 'נון', 'ן': 'נון', 'ס': 'סמך', 'ע': 'עין', 'פ': 'פא', 'ף': 'פא',
    'צ': 'צדי', 'ץ': 'צדי', 'ק': 'קוף', 'ר': 'ריש', 'ש': 'שין', 'ת': 'תו'
};
// ============================================================================
// TRANSFORMACIONES (TEMURAH)
// ============================================================================
/**
 * ATBASH - Inversión del alfabeto
 * א↔ת, ב↔ש, ג↔ר, etc.
 */
export function atbashTransform(letter) {
    const normalLetter = HEBREW_FINALS[letter] || letter;
    const index = HEBREW_ALPHABET.indexOf(normalLetter);
    if (index === -1)
        return letter;
    return HEBREW_ALPHABET[21 - index];
}
/**
 * ALBAM - Primera mitad ↔ Segunda mitad
 * א↔ל, ב↔מ, etc. (offset de 11)
 */
export function albamTransform(letter) {
    const normalLetter = HEBREW_FINALS[letter] || letter;
    const index = HEBREW_ALPHABET.indexOf(normalLetter);
    if (index === -1)
        return letter;
    if (index < 11) {
        return HEBREW_ALPHABET[index + 11];
    }
    else {
        return HEBREW_ALPHABET[index - 11];
    }
}
/**
 * AVGAD - Cada letra avanza una posición
 * א→ב, ב→ג, ת→א
 */
export function avgadTransform(letter) {
    const normalLetter = HEBREW_FINALS[letter] || letter;
    const index = HEBREW_ALPHABET.indexOf(normalLetter);
    if (index === -1)
        return letter;
    return HEBREW_ALPHABET[(index + 1) % 22];
}
/**
 * REVERSE AVGAD - Cada letra retrocede una posición
 */
export function reverseAvgadTransform(letter) {
    const normalLetter = HEBREW_FINALS[letter] || letter;
    const index = HEBREW_ALPHABET.indexOf(normalLetter);
    if (index === -1)
        return letter;
    return HEBREW_ALPHABET[(index - 1 + 22) % 22];
}
/**
 * AYAK BAKAR - Grupos de 9 letras según valor numérico
 */
export function ayakBakarTransform(letter) {
    const groups = [
        ['א', 'י', 'ק'], // 1, 10, 100
        ['ב', 'כ', 'ר'], // 2, 20, 200
        ['ג', 'ל', 'ש'], // 3, 30, 300
        ['ד', 'מ', 'ת'], // 4, 40, 400
        ['ה', 'נ'], // 5, 50
        ['ו', 'ס'], // 6, 60
        ['ז', 'ע'], // 7, 70
        ['ח', 'פ'], // 8, 80
        ['ט', 'צ'] // 9, 90
    ];
    const normalLetter = HEBREW_FINALS[letter] || letter;
    for (const group of groups) {
        const index = group.indexOf(normalLetter);
        if (index !== -1) {
            return group[(index + 1) % group.length];
        }
    }
    return letter;
}
// ============================================================================
// FUNCIONES DE CÁLCULO
// ============================================================================
/**
 * Calcula Gematría de un texto usando una tabla específica
 */
export function calculateGematria(text, table) {
    return text.split('').reduce((sum, char) => {
        return sum + (table[char] || 0);
    }, 0);
}
/**
 * Calcula Gematría Estándar
 */
export function calcGematriaStandard(text) {
    return calculateGematria(text, GEMATRIA_STANDARD);
}
/**
 * Calcula Gematría Katan
 */
export function calcGematriaKatan(text) {
    return calculateGematria(text, GEMATRIA_KATAN);
}
/**
 * Calcula Mispar Gadol
 */
export function calcMisparGadol(text) {
    return calculateGematria(text, MISPAR_GADOL);
}
/**
 * Calcula Mispar Siduri (Ordinal)
 */
export function calcMisparSiduri(text) {
    return calculateGematria(text, MISPAR_SIDURI);
}
/**
 * Calcula Milui - Suma la gematría de los nombres expandidos
 */
export function calcMilui(text) {
    const expanded = text.split('').map(char => MILUI_NAMES[char] || char).join('');
    const value = calcGematriaStandard(expanded);
    return { expanded, value };
}
/**
 * Reduce un número a un solo dígito (1-9) respetando números maestros
 */
export function reduceToSingleDigit(num, preserveMaster = true) {
    const masterNumbers = [11, 22, 33];
    let current = num;
    let isMaster = false;
    while (current > 9) {
        if (preserveMaster && masterNumbers.includes(current)) {
            isMaster = true;
            break;
        }
        current = current.toString().split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
    }
    return { original: num, reduced: current, isMaster };
}
/**
 * Aplica una transformación Temurah a todo un texto
 */
export function applyTemurah(text, method) {
    const transforms = {
        'atbash': atbashTransform,
        'albam': albamTransform,
        'avgad': avgadTransform,
        'reverse-avgad': reverseAvgadTransform,
        'ayak-bakar': ayakBakarTransform,
    };
    const transform = transforms[method];
    if (!transform)
        return text;
    return text.split('').map(transform).join('');
}
/**
 * Convierte letras latinas a hebreo (aproximación fonética)
 */
export const LATIN_TO_HEBREW = {
    'a': 'א', 'b': 'ב', 'c': 'כ', 'd': 'ד', 'e': 'ה', 'f': 'פ', 'g': 'ג',
    'h': 'ח', 'i': 'י', 'j': 'י', 'k': 'כ', 'l': 'ל', 'm': 'מ', 'n': 'נ',
    'o': 'ע', 'p': 'פ', 'q': 'ק', 'r': 'ר', 's': 'ס', 't': 'ת', 'u': 'ו',
    'v': 'ו', 'w': 'ו', 'x': 'ק', 'y': 'י', 'z': 'ז',
    // Spanish specific
    'ñ': 'נ', 'á': 'א', 'é': 'ה', 'í': 'י', 'ó': 'ע', 'ú': 'ו'
};
export function latinToHebrew(text) {
    return text.toLowerCase().split('').map(c => LATIN_TO_HEBREW[c] || '').join('');
}
/**
 * Extrae solo letras hebreas de un texto
 */
export function extractHebrew(text) {
    return text.split('').filter(c => ALL_HEBREW.includes(c)).join('');
}
// ============================================================================
// DICCIONARIO DE PALABRAS CONOCIDAS POR VALOR
// ============================================================================
export const KNOWN_GEMATRIA_WORDS = {
    1: ['א'],
    13: ['אחד', 'אהבה'], // Uno, Amor
    18: ['חי'], // Vida
    26: ['יהוה'], // YHVH - Tetragrammaton
    45: ['אדם'], // Adán/Hombre
    72: ['חסד'], // Chesed
    86: ['אלהים'], // Elohim
    91: ['אמן', 'יהוה אדני'], // Amén
    111: ['אלף'], // Alef
    314: ['שדי'], // Shaddai
    358: ['משיח', 'נחש'], // Mesías, Serpiente
    541: ['ישראל'], // Israel
    611: ['תורה'], // Torah
};
/**
 * Busca palabras conocidas con el mismo valor de gematría
 */
export function findKnownWords(value) {
    return KNOWN_GEMATRIA_WORDS[value] || [];
}
// ============================================================================
// SEFIROT CORRESPONDENCES
// ============================================================================
export const NUMBER_TO_SEFIRA = {
    1: { name: 'Keter', hebrew: 'כתר', meaning: 'Corona' },
    2: { name: 'Chokmah', hebrew: 'חכמה', meaning: 'Sabiduría' },
    3: { name: 'Binah', hebrew: 'בינה', meaning: 'Entendimiento' },
    4: { name: 'Chesed', hebrew: 'חסד', meaning: 'Misericordia' },
    5: { name: 'Gevurah', hebrew: 'גבורה', meaning: 'Rigor' },
    6: { name: 'Tiferet', hebrew: 'תפארת', meaning: 'Belleza' },
    7: { name: 'Netzach', hebrew: 'נצח', meaning: 'Victoria' },
    8: { name: 'Hod', hebrew: 'הוד', meaning: 'Gloria' },
    9: { name: 'Yesod', hebrew: 'יסוד', meaning: 'Fundamento' },
    10: { name: 'Malkuth', hebrew: 'מלכות', meaning: 'Reino' },
};
/**
 * Mapea un número a su Sefirá correspondiente (1-10, cíclico)
 */
export function numberToSefira(num) {
    const idx = ((num - 1) % 10) + 1;
    return NUMBER_TO_SEFIRA[idx] || NUMBER_TO_SEFIRA[1];
}
