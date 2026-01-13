/**
 * Gematria Katan → TreeStructuralState Adapter
 */
import { adaptGenericMethodToTree } from '../../tree/generic-method-adapter';
export function adaptGematriaKatanToTree(gematriaState) {
    const genericState = {
        methodId: 'gematria-katan',
        methodName: 'Gematría Katan',
        primaryNumbers: gematriaState.primaryNumbers || [],
        inclusionMap: gematriaState.inclusionMap || {},
    };
    return adaptGenericMethodToTree(genericState);
}
