/**
 * Avgad → TreeStructuralState Adapter
 */
import { adaptGenericMethodToTree } from '../../tree/generic-method-adapter';
export function adaptAvgadToTree(avgadState) {
    const genericState = {
        methodId: 'avgad',
        methodName: 'Avgad',
        primaryNumbers: avgadState.primaryNumbers || [],
        inclusionMap: avgadState.inclusionMap || {},
    };
    return adaptGenericMethodToTree(genericState);
}
