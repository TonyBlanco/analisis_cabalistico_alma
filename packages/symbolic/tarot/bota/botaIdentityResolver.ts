import tableau from './bota_tableau_complete.json';

export type BotaConsciousness = {
  power: string | null;
  aspect: string | null;
  humanFaculty: string | null;
};

export type BotaIdentity = {
  id: string;
  nameSpanish: string | null;
  hebrewLetter: string | null;
  letterValue: number | null;
  path: number | null;
  sefirot: string[] | null;
  cabalisticIntelligence: string | null;
  consciousness: BotaConsciousness | null;
  element: string | null;
  astrology: unknown | null;
};

type TableauCard = any;

function normalizeBotaKey(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.png$/i, '')
    .replace(/[_\-\s]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^(\d{1,2}_)+/, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim();
}

function safeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v ? v : null;
}

function safeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function safeStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const items = value.map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);
  return items.length ? items : null;
}

const _index: Map<string, TableauCard> = (() => {
  const majorArcana: TableauCard[] = Array.isArray((tableau as any)?.majorArcana) ? (tableau as any).majorArcana : [];
  const index = new Map<string, TableauCard>();

  for (const entry of majorArcana) {
    if (!entry || typeof entry !== 'object') continue;

    const candidates: unknown[] = [
      entry.id,
      entry.code,
      entry.nameSpanish,
      entry.name,
      typeof entry.keyNumber === 'number' ? String(entry.keyNumber) : null,
    ];

    for (const candidate of candidates) {
      const key = normalizeBotaKey(typeof candidate === 'string' ? candidate : '');
      if (key && !index.has(key)) index.set(key, entry);
    }

    const nameEs = safeString(entry.nameSpanish);
    const keyNumber = safeNumber(entry.keyNumber);
    if (nameEs && keyNumber !== null) {
      const base = normalizeBotaKey(nameEs);
      if (base) {
        const prefixed = `${String(keyNumber).padStart(2, '0')}_${base}`;
        if (!index.has(prefixed)) index.set(prefixed, entry);
      }
    }
  }

  return index;
})();

export type BotaCardLike = {
  id?: string | null;
  slug?: string | null;
  code?: string | null;
  name?: string | null;
  nameSpanish?: string | null;
  imageUrl?: string | null;
  asset_path?: string | null;
  symbols?: any;
};

function extractFilename(value: string | null | undefined): string | null {
  if (!value) return null;
  const parts = value.split('/').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

export function resolveBotaIdentity(card: BotaCardLike): BotaIdentity | null {
  const symbols = card.symbols && typeof card.symbols === 'object' ? card.symbols : null;
  const symbolsNameSpanish = safeString(symbols?.nameSpanish);

  const primaryCandidates: Array<string | null | undefined> = [
    card.id,
    card.slug,
    card.code,
    symbolsNameSpanish,
  ];

  const fallbackCandidates: Array<string | null | undefined> = [
    card.nameSpanish,
    card.name,
    extractFilename(card.imageUrl),
    extractFilename(card.asset_path),
  ];

  const allCandidates = [...primaryCandidates, ...fallbackCandidates].filter(Boolean) as string[];

  let entry: TableauCard | undefined;
  for (const candidate of allCandidates) {
    const key = normalizeBotaKey(candidate);
    if (!key) continue;
    const found = _index.get(key);
    if (found) {
      entry = found;
      break;
    }
  }

  if (!entry) return null;

  const k = entry.kabbalistic && typeof entry.kabbalistic === 'object' ? entry.kabbalistic : {};
  const c = entry.consciousness && typeof entry.consciousness === 'object' ? entry.consciousness : null;
  const corr = entry.correspondences && typeof entry.correspondences === 'object' ? entry.correspondences : {};

  return {
    id: String(entry.id),
    nameSpanish: safeString(entry.nameSpanish),
    hebrewLetter: safeString(k.hebrewLetter),
    letterValue: safeNumber(k.letterValue),
    path: safeNumber(k.path),
    sefirot: safeStringArray(k.sefirot),
    cabalisticIntelligence: safeString(k.intelligence),
    consciousness: c
      ? {
          power: safeString(c.power),
          aspect: safeString(c.aspect),
          humanFaculty: safeString(c.humanFaculty),
        }
      : null,
    element: safeString(corr.element),
    astrology: corr.astrology ?? null,
  };
}

