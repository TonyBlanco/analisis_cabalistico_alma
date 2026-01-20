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
 * ID canónicos de Sefirot (10 emanaciones del Árbol)
 */
export type SefiraId = 'keter' | 'chokmah' | 'binah' | 'chesed' | 'gevurah' | 'tiferet' | 'netzach' | 'hod' | 'yesod' | 'malchut';
/**
 * Rol de una Sefirá en el análisis actual
 */
export type SefiraRole = 'dominant' | 'present' | 'latent';
/**
 * Polaridad de un flujo entre Sefirot
 * - harmonic: flujo expansivo / armónico (verde)
 * - integrative: proceso de integración / aprendizaje (naranja)
 * - tensional: restricción / desafío / límite (rojo)
 */
export type FlowPolarity = 'harmonic' | 'integrative' | 'tensional';
/**
 * Dirección de un flujo
 */
export type FlowDirection = 'down' | 'up' | 'lateral';
/**
 * Estado de una Sefirá
 */
export interface TreeSefirah {
    /** ID canónico de la Sefirá */
    id: SefiraId;
    /** Nivel de activación relativo (0..1) */
    activation: number;
    /** Rol en el análisis actual */
    role: SefiraRole;
}
/**
 * Flujo entre dos Sefirot
 */
export interface TreeFlow {
    /** Sefirá de origen */
    from: SefiraId;
    /** Sefirá de destino */
    to: SefiraId;
    /** Polaridad del flujo (determina color) */
    polarity: FlowPolarity;
    /** Intensidad del flujo (0..1) — determina grosor y opacidad */
    intensity: number;
    /** Dirección del flujo */
    direction: FlowDirection;
}
/**
 * Notas estructurales opcionales
 */
export interface TreeNotes {
    /** Ámbito fijo: siempre "symbolic-structural" */
    scope: 'symbolic-structural';
    /** Disclaimer fijo (no editable por IA) */
    disclaimer: string;
}
/**
 * TreeStructuralState v0.1
 *
 * Estado estructural completo que el Árbol puede renderizar.
 * Este contrato es NO NEGOCIABLE.
 *
 * ❌ No texto interpretativo
 * ❌ No conclusiones
 * ❌ No "bueno / malo"
 * ❌ No decisiones clínicas
 * ✔ Solo: activación, relación, dirección, polaridad
 */
export interface TreeStructuralState {
    /** Metadata de origen */
    source: {
        /** Método que generó este estado (ej: "pitagoras", "gematria_standard") */
        method: string;
        /** Modo de ejecución (siempre "manual" en esta fase) */
        mode: 'manual';
        /** Timestamp ISO de generación */
        timestamp: string;
    };
    /** Array de Sefirot con sus estados de activación */
    sefirot: TreeSefirah[];
    /** Array de flujos entre Sefirot */
    flows: TreeFlow[];
    /** Notas estructurales opcionales */
    notes?: TreeNotes;
}
/**
 * Metadata fija del contrato
 */
export declare const TREE_STRUCTURAL_STATE_META: {
    readonly version: "0.1";
    readonly contract: "TreeStructuralState";
    readonly disclaimer: "Representación simbólica estructural. No constituye interpretación automática ni diagnóstico.";
};
//# sourceMappingURL=tree-structural-state.types.d.ts.map