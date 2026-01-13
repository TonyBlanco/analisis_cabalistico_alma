/**
 * Albam → TreeStructuralState Adapter
 */
import { adaptGenericMethodToTree } from '../../tree/generic-method-adapter';
export function adaptAlbamToTree(albamState) {
    const genericState = {
        methodId: 'albam',
        methodName: 'Albam',
        primaryNumbers: albamState.primaryNumbers || [],
        inclusionMap: albamState.inclusionMap || {},
    };
    return adaptGenericMethodToTree(genericState);
}
