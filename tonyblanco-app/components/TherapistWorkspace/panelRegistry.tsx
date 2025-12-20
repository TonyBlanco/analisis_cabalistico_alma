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
    label: 'Overview',
    description: 'Situational context at a glance.',
    summary: 'A calm snapshot of the case for quick orientation.',
    group: 'observation',
  },
  {
    id: 'notes',
    label: 'Integrative notes',
    description: 'Human notes and reflections.',
    summary: 'Notes remain manual and consultive, without automation.',
    group: 'observation',
  },
  {
    id: 'tests',
    label: 'Assigned tests',
    description: 'Read-only status for assigned tests.',
    summary: 'Use as a secondary reference without leaving the workspace.',
    group: 'evaluation',
  },
  {
    id: 'bioemotional',
    label: 'Bio-Emotional',
    description: 'Consultive symbolic observations.',
    summary: 'Reference layer for symbolic and relational context.',
    group: 'symbolic',
  },
  {
    id: 'tree-of-life',
    label: 'Tree of Life',
    description: 'Symbolic structure for reflection.',
    summary: 'Use symbolic structure to support observation without conclusions.',
    group: 'symbolic',
  },
  {
    id: 'hypotheses',
    label: 'Transgenerational',
    description: 'Human hypotheses and lineage notes.',
    summary: 'Human observations only, no automated interpretation.',
    group: 'symbolic',
  },
  {
    id: 'history',
    label: 'History',
    description: 'Longitudinal timeline.',
    summary: 'Maintain continuity without leaving the workspace.',
    group: 'history',
  },
  {
    id: 'kabbalah',
    label: 'Kabbalah',
    description: 'Symbolic tools for reflection.',
    summary: 'Contextual reference for symbolic analysis tools.',
    group: 'resources',
  },
  {
    id: 'resources',
    label: 'Resources',
    description: 'Reference materials.',
    summary: 'Keep references close without disrupting attention.',
    group: 'resources',
  },
];
