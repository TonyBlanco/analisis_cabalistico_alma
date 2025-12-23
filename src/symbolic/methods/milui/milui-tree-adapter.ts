/**
 * Milui → TreeStructuralState Adapter
 */

import type { TreeStructuralState } from '../../tree/tree-structural-state.types';
import { adaptGenericMethodToTree, type GenericSymbolicState } from '../../tree/generic-method-adapter';

export function adaptMiluiToTree(miluiState: any): TreeStructuralState {
  const genericState: GenericSymbolicState = {
    methodId: 'milui',
    methodName: 'Milui',
    primaryNumbers: miluiState.primaryNumbers || [],
    inclusionMap: miluiState.inclusionMap || {},
  };
  
  return adaptGenericMethodToTree(genericState);
}
