/**
 * Tree Structural State — Public Exports
 *
 * Contrato TreeStructuralState v0.1 y adaptadores
 */
export { TREE_STRUCTURAL_STATE_META } from './tree-structural-state.types';
// Adapters
export { adaptPitagorasToTree } from './pitagoras-tree-adapter';
export { adaptGenericMethodToTree } from './generic-method-adapter';
export { SYMBOLIC_INTERPRETER_META } from './symbolic-interpreter.types';
export { generateSymbolicInterpretation, validateTreeStateForInterpretation, createFallbackInterpretation, } from './symbolic-interpreter';
