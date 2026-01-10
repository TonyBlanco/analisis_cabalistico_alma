/**
 * Gematria Katan → TreeStructuralState Adapter
 */

import type { TreeStructuralState } from '../../tree/tree-structural-state.types';
import { adaptGenericMethodToTree, type GenericSymbolicState } from '../../tree/generic-method-adapter';

export function adaptGematriaKatanToTree(gematriaState: any): TreeStructuralState {
  const genericState: GenericSymbolicState = {
    methodId: 'gematria-katan',
    methodName: 'Gematría Katan',
    primaryNumbers: gematriaState.primaryNumbers || [],
    inclusionMap: gematriaState.inclusionMap || {},
  };
  
  return adaptGenericMethodToTree(genericState);
}
