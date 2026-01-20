/**
 * Generic Method → TreeStructuralState Adapter
 *
 * Adaptador genérico reutilizable para cualquier método simbólico
 * que siga la estructura PitagorasSymbolicState (primaryNumbers + inclusionMap).
 *
 * REGLAS:
 * - NO interpretación textual
 * - NO diagnóstico
 * - Solo mapeo estructural: números → sefirot + flujos
 * - Determinista: mismo input → mismo TreeStructuralState
 */
import type { TreeStructuralState } from './tree-structural-state.types';
/**
 * Interface genérica para métodos simbólicos compatibles
 * (cualquier método con primaryNumbers e inclusionMap)
 */
export interface GenericSymbolicState {
    methodId: string;
    methodName: string;
    primaryNumbers: Array<{
        key: string;
        label: string;
        value: number;
        weight: number;
    }>;
    inclusionMap: Record<number, {
        frequency: number;
        isAbsent: boolean;
        isDominant: boolean;
    }>;
}
/**
 * Adaptar estado simbólico genérico a TreeStructuralState
 *
 * @param symbolicState - Estado de cualquier método compatible
 * @returns TreeStructuralState v0.1
 */
export declare function adaptGenericMethodToTree(symbolicState: GenericSymbolicState): TreeStructuralState;
//# sourceMappingURL=generic-method-adapter.d.ts.map