import type { BotaIdentity } from './botaIdentityResolver';

export type BotaSynthesisItem = {
  identity: BotaIdentity;
  positionLabel?: string | null;
};

export function buildBotaSynthesis(items: BotaSynthesisItem[]): string | null {
  const parts: string[] = [];

  for (const item of items) {
    const label = (item.positionLabel ?? '').toString().trim() || 'Posición';
    const arcana = item.identity.nameSpanish || item.identity.id;
    const c = item.identity.consciousness;

    const bit = c?.power && c?.aspect ? `${c.power} — ${c.aspect}` : (c?.power || c?.aspect || null);
    if (!bit) continue;
    parts.push(`${label}: ${arcana} → ${bit}.`);
  }

  if (!parts.length) return null;
  return `Síntesis simbólica (consciencia): ${parts.join(' ')}`.trim();
}

