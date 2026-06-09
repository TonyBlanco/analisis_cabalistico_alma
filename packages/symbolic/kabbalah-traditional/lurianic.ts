/**
 * Lurianic Kabbalah — structural reference data.
 *
 * Partzufim, cosmological concepts, optional Da'at overlay.
 * DATA ONLY — never applied to personal readings.
 * Da'at is NOT part of SEFIROT_TOPOLOGY (10-Sefirah invariant).
 */

import type { SefiraId } from '../tree/tree-structural-state.types';
import { SEFIROT_TOPOLOGY } from '../tree/tree-topology';

export type PartzufId =
  | 'arich_anpin'
  | 'abba'
  | 'imma'
  | 'zeir_anpin'
  | 'nukva';

/** Partzuf → Sefirot that compose it (canonical reference). */
export const PARTZUFIM: Record<PartzufId, readonly SefiraId[]> = {
  arich_anpin: ['keter'],
  abba: ['chokmah'],
  imma: ['binah'],
  zeir_anpin: ['chesed', 'gevurah', 'tiferet', 'netzach', 'hod', 'yesod'],
  nukva: ['malchut'],
} as const;

/** Cosmological concepts as neutral reference (not interpretive). */
export const LURIANIC_CONCEPTS: ReadonlyArray<{
  id: string;
  hebrew: string;
  note: string;
}> = [
  {
    id: 'tzimtzum',
    hebrew: 'צמצום',
    note: 'Divine contraction; cosmological reference in Lurianic tradition.',
  },
  {
    id: 'shevirat_hakelim',
    hebrew: 'שבירת הכלים',
    note: 'Breaking of the vessels; cosmological reference in Lurianic tradition.',
  },
  {
    id: 'tikkun',
    hebrew: 'תיקון',
    note: 'Rectification; cosmological reference in Lurianic tradition.',
  },
  {
    id: 'ein_sof',
    hebrew: 'אין סוף',
    note: 'The Infinite; pre-cosmological reference in Lurianic tradition.',
  },
] as const;

/** Da'at as optional overlay — outside SEFIROT_TOPOLOGY and tree-analysis. */
export const DAAT_OVERLAY = {
  id: 'daat' as const,
  hidden: true as const,
  position: {
    x: Math.round(
      (SEFIROT_TOPOLOGY.chokmah.position.x +
        SEFIROT_TOPOLOGY.binah.position.x +
        SEFIROT_TOPOLOGY.tiferet.position.x) /
        3,
    ),
    y: Math.round(
      (SEFIROT_TOPOLOGY.chokmah.position.y +
        SEFIROT_TOPOLOGY.binah.position.y +
        SEFIROT_TOPOLOGY.tiferet.position.y) /
        3,
    ),
  },
  between: ['chokmah', 'binah', 'tiferet'] as const satisfies readonly [
    SefiraId,
    SefiraId,
    SefiraId,
  ],
};

const SEFIRA_TO_PARTZUF: Record<SefiraId, PartzufId> = {
  keter: 'arich_anpin',
  chokmah: 'abba',
  binah: 'imma',
  chesed: 'zeir_anpin',
  gevurah: 'zeir_anpin',
  tiferet: 'zeir_anpin',
  netzach: 'zeir_anpin',
  hod: 'zeir_anpin',
  yesod: 'zeir_anpin',
  malchut: 'nukva',
};

export function lookupPartzufForSefira(id: SefiraId): PartzufId {
  return SEFIRA_TO_PARTZUF[id];
}