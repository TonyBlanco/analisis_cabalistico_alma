/**
 * Correspondence system selector — Hermetic vs Traditional Jewish.
 *
 * Aditive facade over existing resolvers. No behavior change to Golden Dawn APIs.
 */
import type { SefiraId } from '../tree/tree-structural-state.types';
import type { TraditionalSefirahData } from '../kabbalah-traditional/traditional-correspondences.types';
import type { SeferYetzirahLetter } from '../kabbalah-traditional/sefer-yetzirah';
import type { PathCorrespondence, SefirahCorrespondence } from './types';
export type SystemId = 'hermetic-golden-dawn' | 'jewish-traditional';
export interface CorrespondenceSystem<TSefirah, TPath> {
    readonly id: SystemId;
    sefirah(id: SefiraId): TSefirah | null;
    path(pathId: string): TPath | null;
}
export declare const HERMETIC_GOLDEN_DAWN_SYSTEM: CorrespondenceSystem<SefirahCorrespondence, PathCorrespondence>;
export declare const JEWISH_TRADITIONAL_SYSTEM: CorrespondenceSystem<TraditionalSefirahData, SeferYetzirahLetter>;
export declare function getCorrespondenceSystem(id: 'hermetic-golden-dawn'): CorrespondenceSystem<SefirahCorrespondence, PathCorrespondence>;
export declare function getCorrespondenceSystem(id: 'jewish-traditional'): CorrespondenceSystem<TraditionalSefirahData, SeferYetzirahLetter>;
export declare const CORRESPONDENCE_SYSTEM_IDS: readonly SystemId[];
//# sourceMappingURL=system.d.ts.map