/**
 * Gematria Standard → TreeStructuralState Adapter
 */
import { adaptGenericMethodToTree } from '../../tree/generic-method-adapter';
export function adaptGematriaStandardToTree(gematriaState) {
    // Convertir a formato genérico
    const genericState = {
        methodId: 'gematria-standard',
        methodName: 'Gematría Estándar',
        primaryNumbers: gematriaState.primaryNumbers || [],
        inclusionMap: gematriaState.inclusionMap || {},
    };
    return adaptGenericMethodToTree(genericState);
}
