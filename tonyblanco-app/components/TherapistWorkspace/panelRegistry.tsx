export type ToolGroupId =
  | 'observation'
  | 'evaluation'
  | 'symbolic'
  | 'history'
  | 'resources';

export type ToolId =
  | 'bioemotional'
  | 'tree-of-life'
  | 'hypotheses'
  | 'history'
  | 'kabbalah'
  | 'resources';
  
// NOTE: 'notes' is intentionally omitted from the runtime registry
// because notes panel is provided by the central workspace context map.
// Including in the type union keeps call sites like `openPanel('notes')`
// type-safe without reintroducing a runtime tool entry here.
export type ExtendedToolId = ToolId | 'notes';

export interface ToolDefinition {
  id: ToolId;
  label: string;
  description: string;
  summary: string;
  group: ToolGroupId;
}

export const toolRegistry: ToolDefinition[] = [
  // REMOVED: 'overview', 'notes', 'tests' - ya están en el Context Map del workspace central

  {
    id: 'bioemotional',
    label: 'Bio-Emocional',
    description: 'Workspace de observación simbólica.',
    summary: 'Abre el workspace completo de Bio-Emoción.',
    group: 'symbolic',
  },
  {
    id: 'tree-of-life',
    label: 'Árbol de la Vida',
    description: 'Workspace de Cábala aplicada.',
    summary: 'Abre el workspace completo de Cábala.',
    group: 'symbolic',
  },
  {
    id: 'hypotheses',
    label: 'Transgeneracional',
    description: 'Workspace de hipótesis de linaje.',
    summary: 'Abre el workspace completo de Transgeneracional.',
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
    summary: 'Referencia contextual para análisis simbólico.',
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
