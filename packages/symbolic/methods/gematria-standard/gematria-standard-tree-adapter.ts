/**
 * Gematria Standard → TreeStructuralState Adapter
 */

import type { TreeStructuralState } from '../../tree/tree-structural-state.types';
import { adaptGenericMethodToTree, type GenericSymbolicState } from '../../tree/generic-method-adapter';

export function adaptGematriaStandardToTree(gematriaState: any): TreeStructuralState {
  // Convertir a formato genérico
  const genericState: GenericSymbolicState = {
    methodId: 'gematria-standard',
    methodName: 'Gematría Estándar',
    primaryNumbers: gematriaState.primaryNumbers || [],
    inclusionMap: gematriaState.inclusionMap || {},
  };
  
  return adaptGenericMethodToTree(genericState);
}
