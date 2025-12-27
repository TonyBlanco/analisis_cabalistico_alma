'use client';

export type HelpContentId = 'compare' | 'overlays' | 'export' | 'research' | 'sandbox';

type HelpEntry = {
  title: string;
  body: string[];
};

const REGISTRY: Record<HelpContentId, HelpEntry> = {
  compare: {
    title: 'Cómo comparar sin recalcular',
    body: [
      'Usa el comparador con cartas ya calculadas o JSON pegado. No recalcula el motor.',
      'Resalta diferencias visuales: signos, casas y aspectos presentes o ausentes.',
      'No hay interpretación automática; el foco es observación estructural.',
    ],
  },
  overlays: {
    title: 'Cómo usar overlays (Visual Pro)',
    body: [
      'Activa/desactiva capas (natal, tránsitos, retorno) solo para visibilidad.',
      'El control de orbe filtra aspectos visibles; no modifica cálculos.',
      'Filtros de planetas/aspectos afectan únicamente al render actual.',
    ],
  },
  export: {
    title: 'Cómo exportar/Imprimir',
    body: [
      'Exporta CSV/TXT desde frontend: configuración, tablas y scores (si aplica).',
      'Usa la opción Imprimir para generar PDF desde el navegador con layout académico.',
      'No se crean endpoints ni se persisten resultados al exportar.',
    ],
  },
  research: {
    title: 'Cómo investigar patrones (Research)',
    body: [
      'Trabaja solo con dataset marcado como research/simulado.',
      'Filtra por planeta en casa y tipo de aspecto. Cuenta coincidencias sin inferencia.',
      'Las vistas agregadas son descriptivas; no hay conclusiones médicas.',
    ],
  },
  sandbox: {
    title: 'Qué es Sandbox Predictivo (Simulado)',
    body: [
      'Laboratorio educativo con escenarios sintéticos o research, nunca consultantes reales.',
      'Permite scores didácticos explicables y avance temporal ficticio (si aplica).',
      'Siempre muestra banner de simulación y no persiste resultados.',
    ],
  },
};

export function getHelpContent(id: HelpContentId): HelpEntry | undefined {
  return REGISTRY[id];
}
