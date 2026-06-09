/**
 * Shared activation + flow helpers for method → TreeStructuralState adapters.
 */
import type { TreeFlow, TreeSefirah, SefiraId, SefiraRole, FlowPolarity, FlowDirection } from './tree-structural-state.types';
export declare const LATENT_BASELINE_ACTIVATION = 0.15;
export declare function weightToActivation(weight: number): number;
export declare function determineRole(activation: number): SefiraRole;
export declare function flowDirectionBetween(from: SefiraId, to: SefiraId): FlowDirection;
export declare function flowPolarityFromActivations(fromAct: number, toAct: number): FlowPolarity;
export declare function buildSefirotArray(sefirotMap: Partial<Record<SefiraId, number>>): TreeSefirah[];
/** Connect canonical tree paths where both endpoints exceed the activation threshold. */
export declare function buildTopologyFlows(sefirot: TreeSefirah[]): TreeFlow[];
export interface InclusionEntry {
    frequency: number;
    isAbsent: boolean;
    isDominant: boolean;
}
export declare function applyInclusionToActivations(sefirotMap: Partial<Record<SefiraId, number>>, inclusionMap: Record<number, InclusionEntry>, numberToSefirah: Record<number, SefiraId>): void;
export declare function applyMalchutManifestation(sefirotMap: Partial<Record<SefiraId, number>>, highWeightPrimaryCount: number): void;
//# sourceMappingURL=adapter-utils.d.ts.map