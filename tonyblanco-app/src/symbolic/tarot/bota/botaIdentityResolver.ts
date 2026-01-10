export type BotaConsciousness = {
  power?: string | null;
  aspect?: string | null;
  humanFaculty?: string | null;
};

export type BotaIdentity = {
  id: string;
  name?: string | null;
  nameSpanish?: string | null;
  hebrewLetter?: string | null;
  path?: number | null;
  sefirot?: string[];
  cabalisticIntelligence?: string | null;
  consciousness?: BotaConsciousness | null;
};

type ResolveBotaIdentityInput = {
  id?: unknown;
  name?: unknown;
  nameSpanish?: unknown;
  symbols?: unknown;
  imageUrl?: unknown;
};

function toCleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/-?\d+/);
  if (!match) return null;
  const parsed = Number.parseInt(match[0], 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v) => typeof v === 'string' && v.trim())
      .map((v) => v.trim());
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[\s,;/·–-]+/g)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

function safeDict(value: unknown): Record<string, any> | null {
  return value && typeof value === 'object' ? (value as Record<string, any>) : null;
}

export function resolveBotaIdentity(input: ResolveBotaIdentityInput): BotaIdentity | null {
  const candidateId = toCleanString(input.id) ?? toCleanString(input.nameSpanish) ?? toCleanString(input.name);
  if (!candidateId) return null;

  const symbols = safeDict(input.symbols);
  const kabbalistic = safeDict(symbols?.kabbalistic);
  const consciousnessRaw = safeDict(symbols?.consciousness) ?? safeDict(kabbalistic?.consciousness);

  const consciousness: BotaConsciousness | null = consciousnessRaw
    ? {
        power: toCleanString(consciousnessRaw.power) ?? toCleanString(consciousnessRaw.poder),
        aspect: toCleanString(consciousnessRaw.aspect) ?? toCleanString(consciousnessRaw.aspecto),
        humanFaculty:
          toCleanString(consciousnessRaw.humanFaculty) ??
          toCleanString(consciousnessRaw.faculty) ??
          toCleanString(consciousnessRaw.facultadHumana) ??
          toCleanString(consciousnessRaw.facultad),
      }
    : null;

  const sefirot =
    toStringArray(kabbalistic?.sefirot).length > 0
      ? toStringArray(kabbalistic?.sefirot)
      : toStringArray(symbols?.sefirot);

  return {
    id: candidateId,
    name: toCleanString(input.name),
    nameSpanish: toCleanString(input.nameSpanish),
    hebrewLetter: toCleanString(kabbalistic?.hebrewLetter) ?? toCleanString(kabbalistic?.letraHebrea),
    path: toNumber(kabbalistic?.path),
    sefirot: sefirot.length ? sefirot : undefined,
    cabalisticIntelligence:
      toCleanString(kabbalistic?.cabalisticIntelligence) ??
      toCleanString(kabbalistic?.intelligence) ??
      toCleanString(kabbalistic?.inteligencia),
    consciousness,
  };
}

