import { PATHS_DB } from './astrologia_cabalistica';

export type HebrewSignLetterMatch = {
  normalizedSign: string;
  hebrewLetter: string;
  pathName: string;
  pathNumber: number;
};

const SIGN_ALIASES: Record<string, string> = {
  // Spanish (with/without accents)
  aries: 'Aries',
  tauro: 'Tauro',
  geminis: 'Géminis',
  géminis: 'Géminis',
  cancer: 'Cáncer',
  cáncer: 'Cáncer',
  leo: 'Leo',
  virgo: 'Virgo',
  libra: 'Libra',
  escorpio: 'Escorpio',
  sagitario: 'Sagitario',
  capricornio: 'Capricornio',
  acuario: 'Acuario',
  piscis: 'Piscis',

  // English
  taurus: 'Tauro',
  gemini: 'Géminis',
  cancer_: 'Cáncer',
  scorpio: 'Escorpio',
  sagittarius: 'Sagitario',
  capricorn: 'Capricornio',
  aquarius: 'Acuario',
  pisces: 'Piscis',
};

function normalizeKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\./g, '')
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n');
}

export function normalizeZodiacSignName(sign: unknown): string | null {
  if (typeof sign !== 'string') return null;
  const raw = sign.trim();
  if (!raw) return null;

  // Special-case: English Cancer collides with Spanish Cáncer when removing accents.
  const key = normalizeKey(raw);
  if (key === 'cancer') {
    // If the raw input is exactly English "Cancer", map to Spanish Cáncer.
    return 'Cáncer';
  }

  return SIGN_ALIASES[key] || null;
}

export function getHebrewLetterForSign(sign: unknown): HebrewSignLetterMatch | null {
  const normalizedSign = normalizeZodiacSignName(sign);
  if (!normalizedSign) return null;

  const match = PATHS_DB.find((p) => normalizeKey(p.regente) === normalizeKey(normalizedSign));
  if (!match) return null;

  return {
    normalizedSign,
    hebrewLetter: match.letraHebrea,
    pathName: match.sendero,
    pathNumber: match.valorNumerico,
  };
}
