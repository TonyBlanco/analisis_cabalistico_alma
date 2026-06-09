/**
 * Tree Topology — Canonical Structure of the Tree of Life
 *
 * Single source of truth for the FIXED structure of the Tree:
 * 10 Sefirot, 22 paths, pillars, triads, worlds (Golden Dawn system).
 *
 * DATA ONLY — no logic, no interpretation.
 * Invariants (enforced by tests):
 *   Object.keys(SEFIROT_TOPOLOGY).length === 10
 *   TREE_PATHS.length === 22
 */
import type { SefiraId } from './tree-structural-state.types';
export type PillarId = 'severity' | 'mercy' | 'equilibrium';
export type TriadId = 'supernal' | 'ethical' | 'astral';
export type OlamId = 'atziluth' | 'beriah' | 'yetzirah' | 'assiah';
export interface TreePath {
    id: string;
    from: SefiraId;
    to: SefiraId;
    hebrewLetter: string;
    pathNumber: number;
}
export interface SefirotTopoEntry {
    pillar: PillarId;
    triad: TriadId | 'receptacle';
    olam: OlamId;
    position: {
        x: number;
        y: number;
    };
}
/**
 * Canonical attributes of each Sefira (Golden Dawn).
 *
 * Pillars:
 *   mercy      = right column: Chokmah, Chesed, Netzach
 *   severity   = left column:  Binah, Gevurah, Hod
 *   equilibrium = middle column: Keter, Tiferet, Yesod, Malchut
 *
 * Worlds (Olamot):
 *   atziluth = Keter
 *   beriah   = Chokmah, Binah
 *   yetzirah = Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod
 *   assiah   = Malchut
 *
 * Position: canonical layout units (x: 0–600, y: 0–800).
 */
export declare const SEFIROT_TOPOLOGY: Record<SefiraId, SefirotTopoEntry>;
/**
 * The 22 canonical paths of the Tree of Life (Golden Dawn).
 * Numbered 11–32 following the Sepher Yetzirah / Golden Dawn tradition.
 * hebrewLetter: Unicode Hebrew character associated with each path.
 */
export declare const TREE_PATHS: readonly TreePath[];
export declare const VALID_SEFIRA_IDS: readonly SefiraId[];
//# sourceMappingURL=tree-topology.d.ts.map