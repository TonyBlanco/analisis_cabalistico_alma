/**
 * tarot-tree-state.ts — Tirada del Árbol (Tarot) → TreeStructuralState
 *
 * Puente determinista entre una tirada de Tarot dispuesta sobre el Árbol de la
 * Vida (10 posiciones = 10 Sefirot) y el contrato estructural TreeStructuralState
 * que consume el SessionStepper y el BFF /api/symbolic/v1/interpret.
 *
 * Reutiliza el adaptador genérico ya validado (adaptGenericMethodToTree): cada
 * posición aporta una "activación estructural" (0..1) sobre su Sefirá. NO produce
 * texto interpretativo, conclusiones ni valoraciones — solo activación, relación
 * y dirección, conforme al invariante "el Árbol no interpreta".
 *
 * Malchut (manifestación) la deriva el propio adaptador a partir del número de
 * posiciones de alta activación; no se fuerza aquí.
 */

import {
  adaptGenericMethodToTree,
  type GenericSymbolicState,
  type SefiraId,
  type TreeStructuralState,
} from '@holistica/symbolic/tree';

/** Sefirá canónica → número arquetípico (keter=1 … yesod=9, malchut=10). */
const SEFIRA_TO_NUMBER: Record<SefiraId, number> = {
  keter: 1,
  chokmah: 2,
  binah: 3,
  chesed: 4,
  gevurah: 5,
  tiferet: 6,
  netzach: 7,
  hod: 8,
  yesod: 9,
  malchut: 10,
};

/** Una posición de la tirada del Árbol: una carta colocada sobre una Sefirá. */
export interface TarotTreePosition {
  /** Sefirá que ocupa esta posición de la tirada. */
  sefira: SefiraId;
  /** Identificador de la carta extraída (trazabilidad; nunca se interpreta aquí). */
  cardId: string;
  /** Etiqueta legible de la carta (solo metadata/label). */
  cardLabel?: string;
  /** Carta invertida. Reduce la activación estructural; no la valora. */
  reversed?: boolean;
  /**
   * Énfasis estructural opcional (0..1) que la tirada/terapeuta asigna a la
   * posición. Si se omite, se deriva de `reversed`.
   */
  emphasis?: number;
}

/** Una tirada de Tarot dispuesta sobre el Árbol de la Vida. */
export interface TarotTreeReading {
  /** Sistema de tarot usado (rider-waite, thoth, bota, …) — solo metadata. */
  system: string;
  /** Posiciones de la tirada sobre el Árbol. */
  positions: TarotTreePosition[];
}

const UPRIGHT_DEFAULT_EMPHASIS = 0.7;
const REVERSED_DEFAULT_EMPHASIS = 0.5;

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function resolveEmphasis(position: TarotTreePosition): number {
  if (typeof position.emphasis === 'number') return clamp01(position.emphasis);
  return position.reversed ? REVERSED_DEFAULT_EMPHASIS : UPRIGHT_DEFAULT_EMPHASIS;
}

/**
 * Construye un TreeStructuralState determinista a partir de una tirada del Árbol.
 *
 * Devuelve `null` cuando no hay ninguna posición utilizable (Sefirot 1..9),
 * porque sin activaciones el adaptador no puede producir un estado estructural
 * significativo; el SessionStepper ya gestiona el caso "aún no hay Árbol".
 */
export function buildTreeStateFromTarotReading(
  reading: TarotTreeReading,
): TreeStructuralState | null {
  const primaryNumbers: GenericSymbolicState['primaryNumbers'] = [];
  const inclusionMap: GenericSymbolicState['inclusionMap'] = {};

  for (const position of reading.positions) {
    const value = SEFIRA_TO_NUMBER[position.sefira];
    // Malchut (10) la deriva el adaptador vía manifestación; no se mapea directo.
    if (!value || value > 9) continue;

    const weight = resolveEmphasis(position);
    primaryNumbers.push({
      key: position.sefira,
      label: position.cardLabel ?? position.sefira,
      value,
      weight,
    });

    const current = inclusionMap[value];
    inclusionMap[value] = {
      frequency: (current?.frequency ?? 0) + 1,
      isAbsent: false,
      isDominant: (current?.isDominant ?? false) || weight >= 0.85,
    };
  }

  if (primaryNumbers.length === 0) return null;

  return adaptGenericMethodToTree({
    methodId: `tarot-tree:${reading.system}`,
    methodName: 'Tirada del Árbol (Tarot)',
    primaryNumbers,
    inclusionMap,
  });
}
