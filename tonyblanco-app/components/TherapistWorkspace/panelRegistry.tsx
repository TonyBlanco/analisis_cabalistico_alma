import type { PanelDefinition } from './types';

export const panelRegistry: PanelDefinition[] = [
  {
    id: 'overview',
    type: 'observation',
    title: 'Resumen',
    description: 'Contexto situacional en una mirada.',
    summary: 'Un resumen calmado para orientar la observacion.',
    closable: true,
    collapsible: true,
    component: PanelText,
  },
  {
    id: 'notes',
    type: 'observation',
    title: 'Notas integrativas',
    description: 'Notas humanas y reflexiones.',
    summary: 'Notas manuales y consultivas, sin automatizacion.',
    closable: true,
    collapsible: true,
    component: PanelText,
  },
  {
    id: 'assignedTests',
    type: 'analysis',
    title: 'Tests asignados',
    description: 'Estado en solo lectura.',
    summary: 'Referencia secundaria sin salir del espacio clinico.',
    closable: true,
    collapsible: true,
    component: PanelText,
  },
  {
    id: 'bioemotional',
    type: 'symbolic',
    title: 'Bio-Emocion',
    description: 'Observaciones simbolicas consultivas.',
    summary: 'Capa de referencia simbolica y relacional.',
    closable: true,
    collapsible: true,
    component: PanelText,
  },
  {
    id: 'treeOfLife',
    type: 'symbolic',
    title: 'Arbol de la Vida',
    description: 'Estructura simbolica para reflexion.',
    summary: 'Apoyo simbolico sin conclusiones.',
    closable: true,
    collapsible: true,
    component: PanelText,
  },
  {
    id: 'transgenerational',
    type: 'symbolic',
    title: 'Transgeneracional',
    description: 'Notas humanas y linaje.',
    summary: 'Observaciones humanas sin interpretacion automatica.',
    closable: true,
    collapsible: true,
    component: PanelText,
  },
  {
    id: 'history',
    type: 'history',
    title: 'Historial',
    description: 'Linea longitudinal.',
    summary: 'Continuidad sin salir del espacio clinico.',
    closable: true,
    collapsible: true,
    component: PanelText,
  },
  {
    id: 'kabbalah',
    type: 'resource',
    title: 'Cabala',
    description: 'Herramientas simbolicas de reflexion.',
    summary: 'Referencia contextual para herramientas simbolicas.',
    closable: true,
    collapsible: true,
    component: PanelText,
  },
  {
    id: 'resources',
    type: 'resource',
    title: 'Recursos',
    description: 'Material de referencia.',
    summary: 'Referencia cercana sin interrumpir la atencion.',
    closable: true,
    collapsible: true,
    component: PanelText,
  },
];

function PanelText() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600">
        Contenido consultivo. Sin automatizacion ni diagnostico.
      </p>
    </div>
  );
}
