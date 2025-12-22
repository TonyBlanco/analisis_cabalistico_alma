export type ZodiacId =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export interface ZodiacCatalogEntry {
  id: ZodiacId;
  name: string;
}

export const ZODIAC_SIGNS: ZodiacCatalogEntry[] = [
  { id: 'aries', name: 'Aries' },
  { id: 'taurus', name: 'Taurus' },
  { id: 'gemini', name: 'Gemini' },
  { id: 'cancer', name: 'Cancer' },
  { id: 'leo', name: 'Leo' },
  { id: 'virgo', name: 'Virgo' },
  { id: 'libra', name: 'Libra' },
  { id: 'scorpio', name: 'Scorpio' },
  { id: 'sagittarius', name: 'Sagittarius' },
  { id: 'capricorn', name: 'Capricorn' },
  { id: 'aquarius', name: 'Aquarius' },
  { id: 'pisces', name: 'Pisces' },
];
