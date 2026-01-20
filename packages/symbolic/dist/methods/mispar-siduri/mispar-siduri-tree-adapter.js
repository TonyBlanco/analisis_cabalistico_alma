/**
 * Mispar Siduri → TreeStructuralState Adapter
 */
import { adaptGenericMethodToTree } from '../../tree/generic-method-adapter';
export function adaptMisparSiduriToTree(misparState) {
    const genericState = {
        methodId: 'mispar-siduri',
        methodName: 'Mispar Siduri',
        primaryNumbers: misparState.primaryNumbers || [],
        inclusionMap: misparState.inclusionMap || {},
    };
    return adaptGenericMethodToTree(genericState);
}
