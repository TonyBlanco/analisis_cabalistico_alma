/**
 * Temurah → TreeStructuralState Adapter
 */

import type { TreeStructuralState } from '../../tree/tree-structural-state.types';
import { adaptGenericMethodToTree, type GenericSymbolicState } from '../../tree/generic-method-adapter';

export function adaptTemurahToTree(temurahState: any): TreeStructuralState {
  const genericState: GenericSymbolicState = {
    methodId: 'temurah',
    methodName: 'Temurah',
    primaryNumbers: temurahState.primaryNumbers || [],
    inclusionMap: temurahState.inclusionMap || {},
  };
  
  return adaptGenericMethodToTree(genericState);
}
