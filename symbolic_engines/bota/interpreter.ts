import type { BotaArcana } from './ontology';
import { toSpanishElement, toSpanishPlanet, toSpanishSign } from './ontology';

export type BotaStructuralOutput = {
  system: 'bota';
  arcana: string;
  hebrew_letter: string | null;
  valor: number | null;
  sendero: number | null;
  sefirot: string[] | null;
  elemento: string | null;
  planeta: string | null;
  signo: string | null;
  observacion: string;
};

function joinSefirot(sefirot: string[] | null | undefined): string {
  const parts = (sefirot ?? []).map((s) => String(s).trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]}–${parts[1]}`;
  if (parts.length === 1) return parts[0];
  return 'N/A';
}

export function buildBotaObservation(arcana: BotaArcana): string {
  const k = arcana.kabbalistic ?? {};

  const hebrew = (k.hebrewLetter ?? '').trim() || null;
  const valor = typeof k.letterValue === 'number' ? k.letterValue : null;
  const sendero = typeof k.path === 'number' ? k.path : null;
  const sefirot = Array.isArray(k.sefirot) ? k.sefirot : null;
  const elemento = toSpanishElement(k.element);
  const planeta = toSpanishPlanet(k.planet);
  const signo = toSpanishSign(k.sign);

  const parts: string[] = [];
  if (hebrew && valor !== null) parts.push(`Letra: ${hebrew} (${valor}).`);
  else if (hebrew) parts.push(`Letra: ${hebrew}.`);
  else parts.push('Letra: N/A.');

  parts.push(`Sendero: ${sendero !== null ? sendero : 'N/A'}.`);
  parts.push(`Sefirot: ${joinSefirot(sefirot)}.`);
  parts.push(`Elemento: ${elemento ?? 'N/A'}.`);

  if (planeta) parts.push(`Planeta: ${planeta}.`);
  if (signo) parts.push(`Signo: ${signo}.`);

  return parts.join(' ').trim();
}

export function interpretBotaArcana(arcana: BotaArcana): BotaStructuralOutput {
  const k = arcana.kabbalistic ?? {};
  const arcanaLabel = (arcana.nameSpanish ?? arcana.name ?? arcana.id).toString();

  const output: BotaStructuralOutput = {
    system: 'bota',
    arcana: arcanaLabel,
    hebrew_letter: (k.hebrewLetter ?? null) as string | null,
    valor: typeof k.letterValue === 'number' ? k.letterValue : null,
    sendero: typeof k.path === 'number' ? k.path : null,
    sefirot: Array.isArray(k.sefirot) ? k.sefirot.map((s) => String(s)) : null,
    elemento: toSpanishElement(k.element),
    planeta: toSpanishPlanet(k.planet),
    signo: toSpanishSign(k.sign),
    observacion: buildBotaObservation(arcana),
  };

  return output;
}

