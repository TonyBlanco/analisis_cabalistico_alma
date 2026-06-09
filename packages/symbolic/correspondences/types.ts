import type { SefiraId } from '../tree/tree-structural-state.types';

/** @deprecated Use SefiraId from tree contract. Kept for cabala/paths.ts backward compat. */
export type SefirahId =
  | 'kether'
  | 'chokmah'
  | 'binah'
  | 'chesed'
  | 'gevurah'
  | 'tiferet'
  | 'netzach'
  | 'hod'
  | 'yesod'
  | 'malkuth';

// ─── Golden Dawn Correspondence Types ───────────────────────────────────────

export type GoldenDawnPlanet =
  | 'primum_mobile'
  | 'zodiac'
  | 'saturn'
  | 'jupiter'
  | 'mars'
  | 'sun'
  | 'venus'
  | 'mercury'
  | 'moon'
  | 'earth';

export type GoldenDawnElement = 'fire' | 'water' | 'air' | 'earth' | 'spirit';

/**
 * Correspondence data for a Sefira (Golden Dawn / Hermetic tradition).
 * DATA ONLY — no interpretive labels.
 */
export interface SefirahCorrespondence {
  id: SefiraId;
  planet: GoldenDawnPlanet;
  element: GoldenDawnElement | null;
  kingScaleColor: string;
  tarotArcanaNumbers: number[];
}

/** Canonical 22-path ids aligned with tree-topology.ts (keter/malchut spelling). */
export type TopologyPathId =
  | 'keter-chokmah'
  | 'keter-binah'
  | 'keter-tiferet'
  | 'chokmah-binah'
  | 'chokmah-tiferet'
  | 'chokmah-chesed'
  | 'binah-tiferet'
  | 'binah-gevurah'
  | 'chesed-gevurah'
  | 'chesed-tiferet'
  | 'chesed-netzach'
  | 'gevurah-tiferet'
  | 'gevurah-hod'
  | 'tiferet-netzach'
  | 'tiferet-yesod'
  | 'tiferet-hod'
  | 'netzach-hod'
  | 'netzach-yesod'
  | 'netzach-malchut'
  | 'hod-yesod'
  | 'hod-malchut'
  | 'yesod-malchut';

/**
 * Correspondence data for a Tree Path (Golden Dawn).
 * tarotArcanum: Major Arcana number (0–21); null if unassigned.
 */
export interface PathCorrespondence {
  id: TopologyPathId;
  letterId: HebrewLetterId;
  hebrewLetter: string;
  pathNumber: number;
  tarotArcanum: number;
  planet: GoldenDawnPlanet | null;
  element: GoldenDawnElement | null;
  zodiacSign: string | null;
}

export type HebrewLetterId =
  | 'aleph'
  | 'beth'
  | 'gimel'
  | 'daleth'
  | 'heh'
  | 'vav'
  | 'zayin'
  | 'cheth'
  | 'teth'
  | 'yod'
  | 'kaph'
  | 'lamed'
  | 'mem'
  | 'nun'
  | 'samekh'
  | 'ayin'
  | 'pe'
  | 'tzaddi'
  | 'qoph'
  | 'resh'
  | 'shin'
  | 'tav';

export type TreePathId =
  | 'kether-chokmah'
  | 'kether-binah'
  | 'kether-tiferet'
  | 'chokmah-binah'
  | 'chokmah-tiferet'
  | 'chokmah-chesed'
  | 'binah-tiferet'
  | 'binah-gevurah'
  | 'chesed-gevurah'
  | 'chesed-tiferet'
  | 'chesed-netzach'
  | 'gevurah-tiferet'
  | 'gevurah-hod'
  | 'tiferet-netzach'
  | 'tiferet-yesod'
  | 'tiferet-hod'
  | 'netzach-hod'
  | 'netzach-yesod'
  | 'netzach-malkuth'
  | 'hod-yesod'
  | 'hod-malkuth'
  | 'yesod-malkuth';

export interface HebrewLetter {
  id: HebrewLetterId;
  name: string;
  transliteration: string;
  gematria: number;
}

export interface TreePath {
  id: TreePathId;
  from: SefirahId;
  to: SefirahId;
  letterId: HebrewLetterId;
}

export interface ArcanoMajor {
  number: number;
  name: string;
  letterId: HebrewLetterId;
}

export interface ResolvedCorrespondence {
  letter: HebrewLetter;
  path: TreePath;
  sefirot: [SefirahId, SefirahId];
}
