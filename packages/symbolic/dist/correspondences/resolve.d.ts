import type { SefiraId } from '../tree/tree-structural-state.types';
import type { HebrewLetterId, ResolvedCorrespondence, TreePathId, SefirahCorrespondence, PathCorrespondence, TopologyPathId } from './types';
export declare function resolveByLetter(letterId: HebrewLetterId): ResolvedCorrespondence | null;
export declare function resolveByArcano(arcanoNumber: number): ResolvedCorrespondence | null;
export declare function resolveByPath(pathId: TreePathId): ResolvedCorrespondence | null;
export declare function resolveSefirahCorrespondences(id: SefiraId): SefirahCorrespondence | null;
export declare function resolvePathCorrespondences(pathId: TopologyPathId): PathCorrespondence | null;
//# sourceMappingURL=resolve.d.ts.map