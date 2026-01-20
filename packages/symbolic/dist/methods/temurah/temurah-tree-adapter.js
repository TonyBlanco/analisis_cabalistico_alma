/**
 * Temurah → TreeStructuralState Adapter
 */
import { adaptGenericMethodToTree } from '../../tree/generic-method-adapter';
export function adaptTemurahToTree(temurahState) {
    const genericState = {
        methodId: 'temurah',
        methodName: 'Temurah',
        primaryNumbers: temurahState.primaryNumbers || [],
        inclusionMap: temurahState.inclusionMap || {},
    };
    return adaptGenericMethodToTree(genericState);
}
