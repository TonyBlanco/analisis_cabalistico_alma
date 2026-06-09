/**
 * Tree Analysis — Deterministic Structural Metrics
 *
 * Pure, side-effect-free computation over TreeStructuralState + topology.
 * No network, no Date.now(), no randomness.
 * Same input → identical output (golden-test safe).
 *
 * Graph algorithms (zero external deps):
 *   - Degree centrality: edge count per node over active paths
 *   - Connected components: Union-Find on active paths
 *   - Longest active path: DFS with cycle guard, bounded to 22 edges
 */
import type { TreeStructuralState } from './tree-structural-state.types';
import type { TreeStructuralAnalysis } from './tree-analysis.types';
export declare function analyzeTreeState(state: TreeStructuralState): TreeStructuralAnalysis;
//# sourceMappingURL=tree-analysis.d.ts.map