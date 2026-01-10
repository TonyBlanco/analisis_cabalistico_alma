/**
 * Mispar Siduri → TreeStructuralState Adapter
 */

import type { TreeStructuralState } from '../../tree/tree-structural-state.types';
import { adaptGenericMethodToTree, type GenericSymbolicState } from '../../tree/generic-method-adapter';

export function adaptMisparSiduriToTree(misparState: any): TreeStructuralState {
  const genericState: GenericSymbolicState = {
    methodId: 'mispar-siduri',
    methodName: 'Mispar Siduri',
    primaryNumbers: misparState.primaryNumbers || [],
    inclusionMap: misparState.inclusionMap || {},
  };
  
  return adaptGenericMethodToTree(genericState);
}
