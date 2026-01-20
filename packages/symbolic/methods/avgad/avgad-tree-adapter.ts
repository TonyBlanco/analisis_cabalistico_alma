/**
 * Avgad → TreeStructuralState Adapter
 */

import type { TreeStructuralState } from '../../tree/tree-structural-state.types';
import { adaptGenericMethodToTree, type GenericSymbolicState } from '../../tree/generic-method-adapter';

export function adaptAvgadToTree(avgadState: any): TreeStructuralState {
  const genericState: GenericSymbolicState = {
    methodId: 'avgad',
    methodName: 'Avgad',
    primaryNumbers: avgadState.primaryNumbers || [],
    inclusionMap: avgadState.inclusionMap || {},
  };
  
  return adaptGenericMethodToTree(genericState);
}
