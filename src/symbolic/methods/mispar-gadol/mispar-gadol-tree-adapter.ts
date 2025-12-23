/**
 * Mispar Gadol → TreeStructuralState Adapter
 */

import type { TreeStructuralState } from '../../tree/tree-structural-state.types';
import { adaptGenericMethodToTree, type GenericSymbolicState } from '../../tree/generic-method-adapter';

export function adaptMisparGadolToTree(misparState: any): TreeStructuralState {
  const genericState: GenericSymbolicState = {
    methodId: 'mispar-gadol',
    methodName: 'Mispar Gadol',
    primaryNumbers: misparState.primaryNumbers || [],
    inclusionMap: misparState.inclusionMap || {},
  };
  
  return adaptGenericMethodToTree(genericState);
}
