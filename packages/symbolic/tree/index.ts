/**
 * Tree Structural State — Public Exports
 *
 * Contrato TreeStructuralState v0.2 + topología canónica + análisis + adaptadores
 */

// ─── Topology (PR-1) ─────────────────────────────────────────────────────────
export type {
  PillarId,
  TriadId,
  OlamId,
  TreePath,
  SefirotTopoEntry,
} from './tree-topology';
export { SEFIROT_TOPOLOGY, TREE_PATHS, VALID_SEFIRA_IDS } from './tree-topology';

// ─── State contract v0.2 (PR-2) ──────────────────────────────────────────────
export type {
  TreeStructuralState,
  TreeSefirah,
  TreeFlow,
  TreeNotes,
  SefiraId,
  SefiraRole,
  FlowPolarity,
  FlowDirection,
} from './tree-structural-state.types';
export { TREE_STRUCTURAL_STATE_META } from './tree-structural-state.types';

// ─── Analysis layer (PR-3) ───────────────────────────────────────────────────
export type {
  TreeStructuralAnalysis,
  GraphMetrics,
} from './tree-analysis.types';
export { analyzeTreeState } from './tree-analysis';

// ─── Formative reading (deterministic therapist synthesis) ───────────────────
export type {
  FormativeBrief,
  FormativeClinicalContext,
  FormativeMethodContext,
  FormativeMethodNumber,
  FormativeSefirahFocus,
  FormativePathProcess,
  FormativeAxisReading,
} from './formative-reading';
export { buildFormativeBrief, methodContextFromSymbolicState } from './formative-reading';

// ─── Adapters (PR-5) ─────────────────────────────────────────────────────────
export { adaptPitagorasToTree } from './pitagoras-tree-adapter';
export { adaptGenericMethodToTree } from './generic-method-adapter';
export type { GenericSymbolicState } from './generic-method-adapter';

// ─── Symbolic Interpreter (AI-assisted, read-only) (PR-6) ────────────────────
export type {
  SymbolicInterpretation,
  SymbolicInterpretationRequest,
  SymbolicObservation,
  SymbolicObservationType,
  SymbolicSafetyLevel,
  SymbolicInterpreterMeta,
} from './symbolic-interpreter.types';
export { SYMBOLIC_INTERPRETER_META } from './symbolic-interpreter.types';
export {
  generateSymbolicInterpretation,
  validateTreeStateForInterpretation,
  createFallbackInterpretation,
} from './symbolic-interpreter';
