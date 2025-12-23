/**
 * Albam → TreeStructuralState Adapter
 */

import type { TreeStructuralState } from '../../tree/tree-structural-state.types';
import { adaptGenericMethodToTree, type GenericSymbolicState } from '../../tree/generic-method-adapter';

export function adaptAlbamToTree(albamState: any): TreeStructuralState {
  const genericState: GenericSymbolicState = {
    methodId: 'albam',
    methodName: 'Albam',
    primaryNumbers: albamState.primaryNumbers || [],
    inclusionMap: albamState.inclusionMap || {},
  };
  
  return adaptGenericMethodToTree(genericState);
}
