import { ELEMENTO_ES, PLANETA_ES, SIGNO_ES } from './vocabulary.es';

export type BotaKabbalistic = {
  hebrewLetter?: string | null;
  letterValue?: number | null;
  path?: number | null;
  sefirot?: Array<string> | null;
  element?: string | null;
  planet?: string | null;
  sign?: string | null;
};

export type BotaArcana = {
  id: string;
  name: string;
  nameSpanish?: string | null;
  kabbalistic: BotaKabbalistic;
};

function normalizeKey(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

export function toSpanishElement(value: string | null | undefined): string | null {
  const key = normalizeKey(value);
  if (!key) return null;
  return ELEMENTO_ES[key] ?? value ?? null;
}

export function toSpanishPlanet(value: string | null | undefined): string | null {
  const key = normalizeKey(value);
  if (!key) return null;
  return PLANETA_ES[key] ?? value ?? null;
}

export function toSpanishSign(value: string | null | undefined): string | null {
  const key = normalizeKey(value);
  if (!key) return null;
  return SIGNO_ES[key] ?? value ?? null;
}

