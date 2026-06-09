/**
 * Formative Reading — deterministic therapist-oriented synthesis from tree analysis.
 * READ-ONLY · no diagnosis · consultive language only.
 */
import type { TreeStructuralState } from './tree-structural-state.types';
import type { TreeStructuralAnalysis } from './tree-analysis.types';
import type { FormativeBrief, FormativeClinicalContext, FormativeMethodContext } from './formative-reading.types';
export type { FormativeBrief, FormativeClinicalContext, FormativeMethodContext, FormativeMethodNumber, FormativeSefirahFocus, FormativePathProcess, FormativeAxisReading, } from './formative-reading.types';
export declare function buildFormativeBrief(treeState: TreeStructuralState, analysis: TreeStructuralAnalysis, methodContext?: FormativeMethodContext, clinicalContext?: FormativeClinicalContext): FormativeBrief;
export declare function methodContextFromSymbolicState(state: {
    methodId: string;
    methodName?: string;
    primaryNumbers?: Array<{
        key?: string;
        label: string;
        value: number;
        weight: number;
        meaning?: {
            titulo?: string;
            cualidad?: string;
            descripcion?: string;
        };
    }>;
    inclusionMap?: Record<number, {
        frequency: number;
        isAbsent: boolean;
        isDominant: boolean;
    }>;
}): FormativeMethodContext;
//# sourceMappingURL=formative-reading.d.ts.map