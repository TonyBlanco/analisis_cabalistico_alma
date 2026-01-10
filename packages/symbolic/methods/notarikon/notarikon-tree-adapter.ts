/**
 * Notarikon → TreeStructuralState Adapter
 */

import type { TreeStructuralState } from '../../tree/tree-structural-state.types';
import { adaptGenericMethodToTree, type GenericSymbolicState } from '../../tree/generic-method-adapter';

export function adaptNotarikonToTree(notarikonState: any): TreeStructuralState {
  const genericState: GenericSymbolicState = {
    methodId: 'notarikon',
    methodName: 'Notarikon',
    primaryNumbers: notarikonState.primaryNumbers || [],
    inclusionMap: notarikonState.inclusionMap || {},
  };
  
  return adaptGenericMethodToTree(genericState);
}
