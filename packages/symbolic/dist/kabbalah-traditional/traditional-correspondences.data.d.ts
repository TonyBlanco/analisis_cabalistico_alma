/**
 * Traditional Jewish Kabbalah — correspondence tables.
 *
 * Static data: divine names, archangels, angelic choirs, soul levels.
 * DATA ONLY — no logic, no interpretation.
 * Keys use canonical SefiraId from tree-topology.ts.
 */
import type { SefiraId } from '../tree/tree-structural-state.types';
import type { SoulLevelData, TraditionalSefirahData } from './traditional-correspondences.types';
export declare const TRADITIONAL_SEFIRAH_CORRESPONDENCES: Record<SefiraId, TraditionalSefirahData>;
/** Soul levels mapped by world (reference data, not per-Sefirah). */
export declare const SOUL_LEVELS: readonly SoulLevelData[];
//# sourceMappingURL=traditional-correspondences.data.d.ts.map