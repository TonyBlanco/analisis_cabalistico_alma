/**
 * Lurianic Kabbalah — structural reference data.
 *
 * Partzufim, cosmological concepts, optional Da'at overlay.
 * DATA ONLY — never applied to personal readings.
 * Da'at is NOT part of SEFIROT_TOPOLOGY (10-Sefirah invariant).
 */
import type { SefiraId } from '../tree/tree-structural-state.types';
export type PartzufId = 'arich_anpin' | 'abba' | 'imma' | 'zeir_anpin' | 'nukva';
/** Partzuf → Sefirot that compose it (canonical reference). */
export declare const PARTZUFIM: Record<PartzufId, readonly SefiraId[]>;
/** Cosmological concepts as neutral reference (not interpretive). */
export declare const LURIANIC_CONCEPTS: ReadonlyArray<{
    id: string;
    hebrew: string;
    note: string;
}>;
/** Da'at as optional overlay — outside SEFIROT_TOPOLOGY and tree-analysis. */
export declare const DAAT_OVERLAY: {
    id: "daat";
    hidden: true;
    position: {
        x: number;
        y: number;
    };
    between: readonly ["chokmah", "binah", "tiferet"];
};
export declare function lookupPartzufForSefira(id: SefiraId): PartzufId;
//# sourceMappingURL=lurianic.d.ts.map