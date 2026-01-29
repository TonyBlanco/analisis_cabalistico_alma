'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { panelRegistry } from './panelRegistry';
import type { PanelDefinition, PanelId, PanelState } from './types';

export type PanelSize = 'compact' | 'comfortable' | 'wide';

export interface PanelInstance {
  id: string;
  panelId: PanelId;
  collapsed: boolean;
  hidden: boolean;
  payload?: unknown;
}

interface PanelManagerState {
  panels: PanelInstance[];
  panelSize: PanelSize;
  focusedPanelId: PanelId | null;
  registry: Record<string, PanelDefinition>;
  registerPanel: (definition: PanelDefinition) => void;
  unregisterPanel: (panelId: PanelId) => void;
  openPanel: (panelId: PanelId, payload?: unknown) => void;
  closePanel: (panelId: PanelId) => void;
  collapsePanel: (panelId: PanelId) => void;
  expandPanel: (panelId: PanelId) => void;
  hidePanel: (panelId: PanelId) => void;
  focusPanel: (panelId: PanelId) => void;
  getPanelState: (panelId: PanelId) => PanelState;
  listOpenPanels: () => PanelId[];
  togglePanel: (panelId: PanelId) => void;
  toggleCollapse: (panelId: PanelId) => void;
  toggleHidden: (panelId: PanelId) => void;
  setPanelSize: (size: PanelSize) => void;
}

const PanelManagerContext = createContext<PanelManagerState | null>(null);

const createPanelId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function PanelManagerProvider({ children }: { children: ReactNode }) {
  const [panels, setPanels] = useState<PanelInstance[]>([]);
  const [panelSize, setPanelSize] = useState<PanelSize>('comfortable');
  const [focusedPanelId, setFocusedPanelId] = useState<PanelId | null>(null);
  const [registry, setRegistry] = useState<Record<string, PanelDefinition>>(() =>
    panelRegistry.reduce<Record<string, PanelDefinition>>((acc, panel) => {
      acc[panel.id] = panel;
      return acc;
    }, {}),
  );

  const registerPanel = useCallback((definition: PanelDefinition) => {
    setRegistry((prev) => ({ ...prev, [definition.id]: definition }));
  }, []);

  const unregisterPanel = useCallback((panelId: PanelId) => {
    setRegistry((prev) => {
      const next = { ...prev };
      delete next[panelId];
      return next;
    });
    setPanels((prev) => prev.filter((panel) => panel.panelId !== panelId));
    setFocusedPanelId((prev) => (prev === panelId ? null : prev));
  }, []);

  const openPanel = useCallback((panelId: PanelId, payload?: unknown) => {
    if (!registry[panelId]) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[PanelManager] Panel desconocido: ${panelId}`);
      }
      return;
    }
    setPanels((prev) => {
      const existingIndex = prev.findIndex((panel) => panel.panelId === panelId);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updated = { ...existing, hidden: false, collapsed: false, payload };
        return [
          ...prev.slice(0, existingIndex),
          ...prev.slice(existingIndex + 1),
          updated,
        ];
      }
      const id = createPanelId();
      return [...prev, { id, panelId, collapsed: false, hidden: false, payload }];
    });
    setFocusedPanelId(panelId);
  }, [registry]);

  const togglePanel = useCallback((panelId: PanelId) => {
    if (!registry[panelId]) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[PanelManager] Panel desconocido: ${panelId}`);
      }
      return;
    }
    setPanels((prev) => {
      const existingIndex = prev.findIndex((panel) => panel.panelId === panelId);
      if (existingIndex >= 0) {
        const definition = registry[panelId];
        if (definition && !definition.closable) {
          return prev;
        }
        return prev.filter((panel) => panel.panelId !== panelId);
      }
      const id = createPanelId();
      return [...prev, { id, panelId, collapsed: false, hidden: false }];
    });
    setFocusedPanelId(panelId);
  }, [registry]);

  const closePanel = useCallback(
    (panelId: PanelId) => {
      const definition = registry[panelId];
      if (!definition) return;
      if (!definition.closable) return;
      setPanels((prev) => {
        const next = prev.filter((panel) => panel.panelId !== panelId);
        if (focusedPanelId === panelId) {
          const lastVisible = [...next].reverse().find((panel) => !panel.hidden);
          setFocusedPanelId(lastVisible ? lastVisible.panelId : null);
        }
        return next;
      });
    },
    [focusedPanelId, registry],
  );

  const collapsePanel = useCallback(
    (panelId: PanelId) => {
      const definition = registry[panelId];
      if (!definition || !definition.collapsible) return;
      setPanels((prev) =>
        prev.map((panel) =>
          panel.panelId === panelId ? { ...panel, collapsed: true } : panel,
        ),
      );
    },
    [registry],
  );

  const expandPanel = useCallback(
    (panelId: PanelId) => {
      const definition = registry[panelId];
      if (!definition || !definition.collapsible) return;
      setPanels((prev) =>
        prev.map((panel) =>
          panel.panelId === panelId ? { ...panel, collapsed: false } : panel,
        ),
      );
    },
    [registry],
  );

  const hidePanel = useCallback(
    (panelId: PanelId) => {
      if (!registry[panelId]) return;
      setPanels((prev) =>
        prev.map((panel) =>
          panel.panelId === panelId ? { ...panel, hidden: true } : panel,
        ),
      );
      setFocusedPanelId((prev) => (prev === panelId ? null : prev));
    },
    [registry],
  );

  const focusPanel = useCallback(
    (panelId: PanelId) => {
      if (!registry[panelId]) return;
      setFocusedPanelId(panelId);
    },
    [registry],
  );

  const getPanelState = useCallback(
    (panelId: PanelId): PanelState => {
      const panel = panels.find((item) => item.panelId === panelId);
      if (!panel) return 'hidden';
      if (panel.hidden) return 'hidden';
      if (focusedPanelId === panelId) return 'focused';
      if (panel.collapsed) return 'collapsed';
      return 'open';
    },
    [panels, focusedPanelId],
  );

  const listOpenPanels = useCallback(
    () => panels.filter((panel) => !panel.hidden).map((panel) => panel.panelId),
    [panels],
  );

  const toggleCollapse = useCallback(
    (panelId: PanelId) => {
      const definition = registry[panelId];
      if (!definition || !definition.collapsible) return;
      setPanels((prev) =>
        prev.map((panel) =>
          panel.panelId === panelId ? { ...panel, collapsed: !panel.collapsed } : panel,
        ),
      );
    },
    [registry],
  );

  const toggleHidden = useCallback(
    (panelId: PanelId) => {
      if (!registry[panelId]) return;
      setPanels((prev) =>
        prev.map((panel) =>
          panel.panelId === panelId ? { ...panel, hidden: !panel.hidden } : panel,
        ),
      );
      setFocusedPanelId((prev) => (prev === panelId ? null : prev));
    },
    [registry],
  );

  const value = useMemo(
    () => ({
      panels,
      panelSize,
      focusedPanelId,
      registry,
      registerPanel,
      unregisterPanel,
      openPanel,
      closePanel,
      collapsePanel,
      expandPanel,
      hidePanel,
      focusPanel,
      getPanelState,
      listOpenPanels,
      togglePanel,
      toggleCollapse,
      toggleHidden,
      setPanelSize,
    }),
    [
      panels,
      panelSize,
      focusedPanelId,
      registry,
      registerPanel,
      unregisterPanel,
      openPanel,
      closePanel,
      collapsePanel,
      expandPanel,
      hidePanel,
      focusPanel,
      getPanelState,
      listOpenPanels,
      togglePanel,
      toggleCollapse,
      toggleHidden,
      setPanelSize,
    ],
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
