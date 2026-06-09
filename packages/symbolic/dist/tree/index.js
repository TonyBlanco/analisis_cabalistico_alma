/**
 * Tree Structural State — Public Exports
 *
 * Contrato TreeStructuralState v0.2 + topología canónica + análisis + adaptadores
 */
export { SEFIROT_TOPOLOGY, TREE_PATHS, VALID_SEFIRA_IDS } from './tree-topology';
export { TREE_STRUCTURAL_STATE_META } from './tree-structural-state.types';
export { analyzeTreeState } from './tree-analysis';
// ─── Adapters (PR-5) ─────────────────────────────────────────────────────────
export { adaptPitagorasToTree } from './pitagoras-tree-adapter';
export { adaptGenericMethodToTree } from './generic-method-adapter';
export { SYMBOLIC_INTERPRETER_META } from './symbolic-interpreter.types';
export { generateSymbolicInterpretation, validateTreeStateForInterpretation, createFallbackInterpretation, } from './symbolic-interpreter';
