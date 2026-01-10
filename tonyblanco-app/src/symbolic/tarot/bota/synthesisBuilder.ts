import type { BotaIdentity } from './botaIdentityResolver';

type BotaSynthesisItem = {
  identity: BotaIdentity;
  positionLabel: string;
};

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function buildBotaSynthesis(items: BotaSynthesisItem[]): string {
  if (!Array.isArray(items) || items.length === 0) return '';

  const parts = items.slice(0, 5).map((item) => {
    const pos = clean(item.positionLabel) || 'Posición';
    const name = clean(item.identity.nameSpanish) || clean(item.identity.name) || item.identity.id;
    return `${pos}: ${name}`;
  });

  return `Síntesis por posiciones: ${parts.join(' / ')}.`;
}

