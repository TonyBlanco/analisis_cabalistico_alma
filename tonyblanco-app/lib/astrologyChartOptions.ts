export type HouseOption = { code: string; name: string; desc?: string };
export type ZodiacOption = { code: string; name: string; desc?: string };

/** Opciones compartidas entre sidebar y modal de recálculo. */
export const HOUSE_OPTIONS: HouseOption[] = [
  { code: 'P', name: 'Placidus', desc: 'Predeterminado (actualmente activo).' },
  { code: 'K', name: 'Koch', desc: 'Mayor sensibilidad a latitud/tiempo en la cúspide.' },
  { code: 'E', name: 'Equal (Casas Iguales)', desc: 'Simplificación estructural (útil para lectura simbólica).' },
  { code: 'W', name: 'Whole Sign', desc: 'Cada casa = un signo completo.' },
  { code: 'R', name: 'Regiomontanus', desc: 'Tradicional/horaria.' },
];

export const ZODIAC_OPTIONS: ZodiacOption[] = [
  { code: 'tropical', name: 'Tropical', desc: 'Estándar occidental.' },
  { code: 'sidereal', name: 'Sideral', desc: 'Usa ayanamsha (backend).' },
  { code: 'draconic', name: 'Dracónico', desc: 'Rotación por Nodo Norte (lectura simbólica).' },
];

/** Normaliza código de sistema de casas (UI/API) a letra canónica P/K/E/W/R. */
export function normalizeHouseSystemCode(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  const upper = trimmed.toUpperCase();
  if (['P', 'K', 'E', 'W', 'R'].includes(upper)) return upper;
  const lower = trimmed.toLowerCase();
  if (lower.includes('placid')) return 'P';
  if (lower.includes('koch')) return 'K';
  if (lower.includes('equal')) return 'E';
  if (lower.includes('whole')) return 'W';
  if (lower.includes('regio')) return 'R';
  return upper;
}

export function formatHouseSystemLabel(value: string | undefined | null): string {
  const code = normalizeHouseSystemCode(value);
  const opt = HOUSE_OPTIONS.find((h) => h.code === code);
  if (opt) return opt.name.toLowerCase();
  if (!value) return 'placidus';
  return String(value).toLowerCase();
}

export function formatZodiacTypeLabel(value: string | undefined | null): string {
  if (!value) return 'tropical';
  const lower = String(value).toLowerCase();
  const opt = ZODIAC_OPTIONS.find((z) => z.code === lower);
  if (opt) return opt.name.toLowerCase();
  return lower;
}

export function formatChartParamsLabel(
  houseSystem: string | undefined | null,
  zodiacType: string | undefined | null,
): string {
  return `${formatHouseSystemLabel(houseSystem)} · ${formatZodiacTypeLabel(zodiacType)}`;
}