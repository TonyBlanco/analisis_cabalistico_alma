/**
 * TreeStructuralState v0.2 — Contract Definition
 *
 * Evolution from v0.1: adds OPTIONAL fields (pillar, triad, olam, pathId).
 * All v0.1 objects remain valid — new fields are never required.
 * The invariant "the Tree does not interpret" is unchanged.
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
    version: '0.2',
    contract: 'TreeStructuralState',
    disclaimer: 'Representación simbólica estructural. No constituye interpretación automática ni diagnóstico.',
};
