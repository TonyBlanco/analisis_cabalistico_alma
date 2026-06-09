/**
 * Traditional Jewish Kabbalah — read-only resolver API.
 *
 * Single access point for traditional correspondences.
 * Deterministic, pure, no side effects.
 */
import type { SefiraId } from '../tree/tree-structural-state.types';
import type { SoulLevelData, TraditionalSefirahData } from './traditional-correspondences.types';
import { type SeferYetzirahLetter } from './sefer-yetzirah';
import { type PartzufId } from './lurianic';
export declare function resolveTraditionalSefirah(id: SefiraId): TraditionalSefirahData | null;
export declare function resolveTraditionalPath(pathId: string): SeferYetzirahLetter | null;
export declare function resolvePartzuf(id: SefiraId): PartzufId | null;
export declare function resolveSoulLevels(): readonly SoulLevelData[];
//# sourceMappingURL=resolve.d.ts.map