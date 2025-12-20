'use client';

import { X, Minus, Square, RectangleVertical } from 'lucide-react';
import { useMemo } from 'react';
import { usePanelManager } from './PanelManagerContext';
import { panelRegistry } from './panelRegistry';

const sizeClasses = {
  compact: 'w-64',
  comfortable: 'w-80',
  wide: 'w-96',
};

export default function PanelDock() {
  const {
    panels,
    panelSize,
    setPanelSize,
    closePanel,
    toggleCollapse,
    expandPanel,
    toggleHidden,
  } = usePanelManager();

  const panelsById = useMemo(
    () =>
      panelRegistry.reduce<Record<string, typeof panelRegistry[number]>>((acc, panel) => {
        acc[panel.id] = panel;
        return acc;
      }, {}),
    [],
  );

  const visiblePanels = panels.filter((panel) => !panel.hidden);
  const collapsedPanels = visiblePanels.filter((panel) => panel.collapsed);

  if (visiblePanels.length === 0) {
    return null;
  }

  return (
    <aside className={`hidden lg:flex flex-col ${sizeClasses[panelSize]} border-l border-gray-200 bg-white`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Paneles de herramientas
        </span>
        <div className="flex items-center gap-1 text-gray-500">
          <button
            type="button"
            onClick={() => setPanelSize('compact')}
            className="p-1 hover:text-gray-700"
            aria-label="Paneles compactos"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setPanelSize('comfortable')}
            className="p-1 hover:text-gray-700"
            aria-label="Paneles comodos"
          >
            <Square className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setPanelSize('wide')}
            className="p-1 hover:text-gray-700"
            aria-label="Paneles amplios"
          >
            <RectangleVertical className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {visiblePanels.map((panel) => {
          const tool = panelsById[panel.panelId];
          if (!tool) return null;
          const PanelContent = tool.component;
          return (
            <div key={panel.id} className="rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <div>
                  <p className="text-xs font-semibold text-gray-800">{tool.title}</p>
                  <p className="text-[11px] text-gray-500">{tool.description}</p>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(panel.panelId)}
                    className="p-1 hover:text-gray-700"
                    aria-label="Colapsar panel"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => closePanel(panel.panelId)}
                    className="p-1 hover:text-gray-700"
                    aria-label="Cerrar panel"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {!panel.collapsed && (
                <div className="p-3 space-y-2">
                  {tool.summary && <p className="text-xs text-gray-600">{tool.summary}</p>}
                  <PanelContent payload={panel.payload} />
                  <p className="text-[11px] text-gray-500">
                    Mantiene el espacio clinico visible mientras observas.
                  </p>
                </div>
              )}
              {panel.collapsed && (
                <div className="flex items-center justify-between px-3 py-2 text-[11px] text-gray-500">
                  <span>Panel colapsado</span>
                  <button
                    type="button"
                    onClick={() => expandPanel(panel.panelId)}
                    className="text-[11px] text-gray-600 hover:text-gray-800"
                  >
                    Expandir
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {collapsedPanels.length > 0 && (
        <div className="border-t border-gray-200 px-3 py-2 text-[11px] text-gray-500">
          Paneles ocultos: {collapsedPanels.length}
          <button
            type="button"
            onClick={() => collapsedPanels.forEach((panel) => toggleHidden(panel.panelId))}
            className="ml-2 text-[11px] text-gray-600 hover:text-gray-800"
          >
            Mostrar
          </button>
        </div>
      )}
    </aside>
  );
}
