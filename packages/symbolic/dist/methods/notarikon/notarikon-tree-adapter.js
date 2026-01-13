/**
 * Notarikon → TreeStructuralState Adapter
 */
import { adaptGenericMethodToTree } from '../../tree/generic-method-adapter';
export function adaptNotarikonToTree(notarikonState) {
    const genericState = {
        methodId: 'notarikon',
        methodName: 'Notarikon',
        primaryNumbers: notarikonState.primaryNumbers || [],
        inclusionMap: notarikonState.inclusionMap || {},
    };
    return adaptGenericMethodToTree(genericState);
}
