export type ToolGroupId =
  | 'observation'
  | 'evaluation'
  | 'symbolic'
  | 'history'
  | 'resources';

export type ToolId =
  | 'overview'
  | 'bioemotional'
  | 'tree-of-life'
  | 'hypotheses'
  | 'tests'
  | 'history'
  | 'notes'
  | 'kabbalah'
  | 'resources';

export interface ToolDefinition {
  id: ToolId;
  label: string;
  description: string;
  summary: string;
  group: ToolGroupId;
}

export const toolRegistry: ToolDefinition[] = [
  {
    id: 'overview',
    label: 'Resumen',
    description: 'Contexto situacional de un vistazo.',
    summary: 'Un snapshot del caso para orientar la observación.',
    group: 'observation',
  },
  {
    id: 'notes',
    label: 'Notas integrativas',
    description: 'Notas humanas y reflexiones.',
    summary: 'Notas manuales y consultivas, sin automatización.',
    group: 'observation',
  },
  {
    id: 'tests',
    label: 'Tests asignados',
    description: 'Estado de tests asignados (solo lectura).',
    summary: 'Referencia secundaria sin salir del espacio clínico.',
    group: 'evaluation',
  },
  {
    id: 'bioemotional',
    label: 'Bio-Emocional',
    description: 'Observaciones simbólicas consultivas.',
    summary: 'Capa de referencia para contexto simbólico y relacional.',
    group: 'symbolic',
  },
  {
    id: 'tree-of-life',
    label: 'Árbol de la Vida',
    description: 'Estructura simbólica para reflexión.',
    summary: 'Soporta la observación sin conclusiones automatizadas.',
    group: 'symbolic',
  },
  {
    id: 'hypotheses',
    label: 'Transgeneracional',
    description: 'Hipótesis humanas y notas de linaje.',
    summary: 'Observación humana, sin interpretación automática.',
    group: 'symbolic',
  },
  {
    id: 'history',
    label: 'Historial',
    description: 'Línea temporal longitudinal.',
    summary: 'Mantén continuidad sin salir del espacio clínico.',
    group: 'history',
  },
  {
    id: 'kabbalah',
    label: 'Cábala',
    description: 'Herramientas simbólicas para reflexión.',
    summary: 'Referencia contextual para herramientas de análisis simbólico.',
    group: 'resources',
  },
  {
    id: 'resources',
    label: 'Recursos',
    description: 'Materiales de referencia.',
    summary: 'Mantén referencias cerca sin romper la atención.',
    group: 'resources',
  },
];
