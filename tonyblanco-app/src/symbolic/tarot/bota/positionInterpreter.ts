import type { BotaIdentity } from './botaIdentityResolver';

type BuildBotaPositionMeaningInput = {
  identity: BotaIdentity;
  positionId?: string | null;
  positionLabel?: string | null;
};

function label(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function buildBotaPositionMeaning({
  identity,
  positionId,
  positionLabel,
}: BuildBotaPositionMeaningInput): string {
  const pos = label(positionLabel) ?? label(positionId) ?? 'Posición';
  const name = label(identity.nameSpanish) ?? label(identity.name) ?? identity.id;

  const extras: string[] = [];
  if (identity.hebrewLetter) extras.push(`Letra ${identity.hebrewLetter}`);
  if (typeof identity.path === 'number') extras.push(`Sendero ${identity.path}`);
  if (identity.sefirot?.length) {
    const s = identity.sefirot;
    extras.push(`Sefirot ${s.length >= 2 ? `${s[0]}–${s[1]}` : s[0]}`);
  }

  return extras.length ? `${pos}: ${name}. (${extras.join(' · ')})` : `${pos}: ${name}.`;
}

