/**
 * Tree Analysis Types — Deterministic Structural Metrics
 *
 * All values are NUMBERS and NEUTRAL ENUMS.
 * No labels like "weak", "blocked", "healthy", "problem".
 * The analysis layer does not interpret — it measures.
 */

import type { SefiraId, SefiraRole, FlowPolarity } from './tree-structural-state.types';
import type { PillarId, TriadId, OlamId } from './tree-topology';

export interface GraphMetrics {
  activeNodes: SefiraId[];
  activePaths: string[];
  degreeCentrality: Record<SefiraId, number>;
  connectedComponents: number;
  longestActivePath: SefiraId[];
}

export interface TreeStructuralAnalysis {
  sourceVersion: string;
  pillarBalance: Record<PillarId, number>;
  triadActivation: Record<TriadId | 'receptacle', number>;
  olamActivation: Record<OlamId, number>;
  polarityDistribution: Record<FlowPolarity, number>;
  graph: GraphMetrics;
  ranking: Array<{ id: SefiraId; activation: number; role: SefiraRole }>;
}
