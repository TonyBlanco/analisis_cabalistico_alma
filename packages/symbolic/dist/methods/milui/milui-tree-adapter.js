/**
 * Milui → TreeStructuralState Adapter
 */
import { adaptGenericMethodToTree } from '../../tree/generic-method-adapter';
export function adaptMiluiToTree(miluiState) {
    const genericState = {
        methodId: 'milui',
        methodName: 'Milui',
        primaryNumbers: miluiState.primaryNumbers || [],
        inclusionMap: miluiState.inclusionMap || {},
    };
    return adaptGenericMethodToTree(genericState);
}
