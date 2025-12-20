import type { ComponentType } from 'react';

export type PanelId = string;

export type PanelType = 'analysis' | 'symbolic' | 'observation' | 'history' | 'resource';

export type PanelState = 'open' | 'collapsed' | 'hidden' | 'focused';

export interface PanelDefinition {
  id: PanelId;
  type: PanelType;
  title: string;
  description?: string;
  summary?: string;
  closable: boolean;
  collapsible: boolean;
  component: ComponentType<{ payload?: unknown }>;
  defaultState?: PanelState;
}
