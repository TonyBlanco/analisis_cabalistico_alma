'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ToolId } from './panelRegistry';

export type PanelSize = 'compact' | 'comfortable' | 'wide';

export interface PanelInstance {
  id: string;
  toolId: ToolId;
  collapsed: boolean;
}

interface PanelManagerState {
  panels: PanelInstance[];
  panelSize: PanelSize;
  openPanel: (toolId: ToolId) => void;
  closePanel: (id: string) => void;
  togglePanel: (toolId: ToolId) => void;
  toggleCollapse: (id: string) => void;
  setPanelSize: (size: PanelSize) => void;
}

const PanelManagerContext = createContext<PanelManagerState | null>(null);

const createPanelId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function PanelManagerProvider({ children }: { children: ReactNode }) {
  const [panels, setPanels] = useState<PanelInstance[]>([]);
  const [panelSize, setPanelSize] = useState<PanelSize>('comfortable');

  const openPanel = useCallback((toolId: ToolId) => {
    setPanels((prev) => {
      const existingIndex = prev.findIndex((panel) => panel.toolId === toolId);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const reordered = [...prev.slice(0, existingIndex), ...prev.slice(existingIndex + 1), existing];
        return reordered;
      }
      return [...prev, { id: createPanelId(), toolId, collapsed: false }];
    });
  }, []);

  const togglePanel = useCallback((toolId: ToolId) => {
    setPanels((prev) => {
      const existingIndex = prev.findIndex((panel) => panel.toolId === toolId);
      if (existingIndex >= 0) {
        return prev.filter((panel) => panel.toolId !== toolId);
      }
      return [...prev, { id: createPanelId(), toolId, collapsed: false }];
    });
  }, []);

  const closePanel = useCallback((id: string) => {
    setPanels((prev) => prev.filter((panel) => panel.id !== id));
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setPanels((prev) =>
      prev.map((panel) =>
        panel.id === id ? { ...panel, collapsed: !panel.collapsed } : panel,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      panels,
      panelSize,
      openPanel,
      closePanel,
      togglePanel,
      toggleCollapse,
      setPanelSize,
    }),
    [panels, panelSize, openPanel, closePanel, togglePanel, toggleCollapse],
  );

  return <PanelManagerContext.Provider value={value}>{children}</PanelManagerContext.Provider>;
}

export function usePanelManager() {
  const context = useContext(PanelManagerContext);
  if (!context) {
    throw new Error('usePanelManager must be used within PanelManagerProvider');
  }
  return context;
}
