/**
 * Pitagoras → TreeStructuralState Adapter
 *
 * ÚNICO PROPÓSITO: traducir resultado de Pitágoras a TreeStructuralState v0.1
 *
 * REGLAS:
 * - NO interpretación textual
 * - NO diagnóstico
 * - Solo mapeo estructural: números → sefirot activas + flujos
 * - Determinista: mismo input → mismo TreeStructuralState
 */
import type { PitagorasSymbolicState } from '../methods/pitagoras/pitagoras.types';
import type { TreeStructuralState } from './tree-structural-state.types';
/**
 * Adaptar estado pitagórico a TreeStructuralState
 *
 * MAPEO:
 * 1. Números principales → Sefirot activas (con activation y role)
 * 2. Números dominantes (alta frecuencia en inclusión) → Sefirot con mayor activation
 * 3. Tensiones entre números → Flujos con polaridad
 * 4. Si 3+ números dominantes → Malchut se activa (manifestación completa)
 *
 * @param pitagorasState - Estado simbólico de Pitágoras
 * @returns TreeStructuralState v0.1
 */
export declare function adaptPitagorasToTree(pitagorasState: PitagorasSymbolicState): TreeStructuralState;
//# sourceMappingURL=pitagoras-tree-adapter.d.ts.map