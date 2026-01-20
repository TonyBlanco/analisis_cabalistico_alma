import positions from './bota_positions.json';
import type { BotaIdentity } from './botaIdentityResolver';

type PositionEntry = {
  label: string;
  definition: string;
  scope: string;
};

type PositionsOntology = Record<string, PositionEntry>;

function normalizeKey(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-\s]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim();
}

export type BotaPositionMeaningInput = {
  identity: BotaIdentity;
  positionId?: string | null;
  positionLabel?: string | null;
};

function resolvePositionKey(input: BotaPositionMeaningInput): keyof PositionsOntology | null {
  const pid = normalizeKey(input.positionId ?? '');
  if (pid === 'origin') return 'origen';
  if (pid === 'present') return 'presente';
  if (pid === 'direction') return 'direccion';

  const label = normalizeKey(input.positionLabel ?? '');
  if (!label) return null;
  if (label.includes('origen')) return 'origen';
  if (label.includes('presente') || label.includes('estado_actual')) return 'presente';
  if (label.includes('direccion')) return 'direccion';
  return null;
}

export function buildBotaPositionMeaning(input: BotaPositionMeaningInput): string | null {
  const ontology = positions as PositionsOntology;
  const positionKey = resolvePositionKey(input);
  const position = positionKey ? ontology[positionKey] : null;

  const consciousness = input.identity.consciousness;
  if (!consciousness?.power && !consciousness?.aspect && !consciousness?.humanFaculty) return null;

  const parts: string[] = [];
  if (consciousness.power && consciousness.aspect) {
    parts.push(`Consciencia activa: ${consciousness.power} — ${consciousness.aspect}.`);
  } else if (consciousness.power) {
    parts.push(`Consciencia activa: ${consciousness.power}.`);
  } else if (consciousness.aspect) {
    parts.push(`Consciencia activa: ${consciousness.aspect}.`);
  }

  if (consciousness.humanFaculty) {
    parts.push(`Facultad humana: ${consciousness.humanFaculty}.`);
  }

  if (position) {
    parts.push(`Posición ${position.label}: ${position.definition}`);
    parts.push(`Alcance: ${position.scope}.`);
  }

  return parts.join(' ').trim() || null;
}

