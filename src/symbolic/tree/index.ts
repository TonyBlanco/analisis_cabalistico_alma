/**
 * Tree Structural State — Public Exports
 * 
 * Contrato TreeStructuralState v0.1 y adaptadores
 */

// Types
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

// Adapters
export { adaptPitagorasToTree } from './pitagoras-tree-adapter';
