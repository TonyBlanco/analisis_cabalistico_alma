/**
 * Atbash → TreeStructuralState Adapter
 */
import { adaptGenericMethodToTree } from '../../tree/generic-method-adapter';
export function adaptAtbashToTree(atbashState) {
    const genericState = {
        methodId: 'atbash',
        methodName: 'Atbash',
        primaryNumbers: atbashState.primaryNumbers || [],
        inclusionMap: atbashState.inclusionMap || {},
    };
    return adaptGenericMethodToTree(genericState);
}
