/**
 * Mispar Gadol → TreeStructuralState Adapter
 */
import { adaptGenericMethodToTree } from '../../tree/generic-method-adapter';
export function adaptMisparGadolToTree(misparState) {
    const genericState = {
        methodId: 'mispar-gadol',
        methodName: 'Mispar Gadol',
        primaryNumbers: misparState.primaryNumbers || [],
        inclusionMap: misparState.inclusionMap || {},
    };
    return adaptGenericMethodToTree(genericState);
}
