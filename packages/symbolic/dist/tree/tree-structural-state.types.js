/**
 * TreeStructuralState v0.1 — Contract Definition
 *
 * Este contrato define el estado estructural exacto que el Árbol puede renderizar.
 * El Árbol NO INTERPRETA. SOLO RENDERIZA este estado.
 *
 * USO:
 * - Métodos simbólicos → generan TreeStructuralState
 * - Árbol de la Vida → recibe y renderiza TreeStructuralState
 * - NO backend, NO persistencia, NO interpretación automática
 */
/**
 * Metadata fija del contrato
 */
export const TREE_STRUCTURAL_STATE_META = {
    version: '0.1',
    contract: 'TreeStructuralState',
    disclaimer: 'Representación simbólica estructural. No constituye interpretación automática ni diagnóstico.',
};
