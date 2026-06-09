/**
 * Golden Dawn Correspondence Tables
 *
 * Static data for the Hermetic/Golden Dawn system.
 * DATA ONLY — no logic, no interpretation.
 * Source: Regardie "The Golden Dawn", Liber 777, Sepher Yetzirah (GD recension).
 *
 * Keys use canonical SefiraId / TopologyPathId (keter/malchut spelling).
 */
import type { SefiraId } from '../tree/tree-structural-state.types';
import type { SefirahCorrespondence, PathCorrespondence, TopologyPathId } from './types';
export declare const SEFIRAH_CORRESPONDENCES: Record<SefiraId, SefirahCorrespondence>;
export declare const PATH_CORRESPONDENCES: Record<TopologyPathId, PathCorrespondence>;
//# sourceMappingURL=golden-dawn-data.d.ts.map