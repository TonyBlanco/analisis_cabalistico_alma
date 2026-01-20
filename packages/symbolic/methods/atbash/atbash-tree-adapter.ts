/**
 * Atbash → TreeStructuralState Adapter
 */

import type { TreeStructuralState } from '../../tree/tree-structural-state.types';
import { adaptGenericMethodToTree, type GenericSymbolicState } from '../../tree/generic-method-adapter';

export function adaptAtbashToTree(atbashState: any): TreeStructuralState {
  const genericState: GenericSymbolicState = {
    methodId: 'atbash',
    methodName: 'Atbash',
    primaryNumbers: atbashState.primaryNumbers || [],
    inclusionMap: atbashState.inclusionMap || {},
  };
  
  return adaptGenericMethodToTree(genericState);
}
