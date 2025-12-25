'use client';

import { X, Minus, Square, RectangleVertical } from 'lucide-react';
import { useMemo } from 'react';
import { usePanelManager } from './PanelManagerContext';
import { toolRegistry } from './panelRegistry';
import HistoryPanelContent from './HistoryPanelContent';

const sizeClasses = {
  compact: 'w-64',
  comfortable: 'w-80',
  wide: 'w-96',
};

export default function PanelDock() {
  const { panels, panelSize, setPanelSize, closePanel, toggleCollapse } = usePanelManager();

  const toolsById = useMemo(
    () =>
      toolRegistry.reduce<Record<string, typeof toolRegistry[number]>>((acc, tool) => {
        acc[tool.id] = tool;
        return acc;
      }, {}),
    [],
  );

  if (panels.length === 0) {
    return null;
  }

  return (
    <aside className={`hidden lg:flex flex-col ${sizeClasses[panelSize]} border-l border-gray-200 bg-white`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Tool panels
        </span>
        <div className="flex items-center gap-1 text-gray-500">
          <button
            type="button"
            onClick={() => setPanelSize('compact')}
            className="p-1 hover:text-gray-700"
            aria-label="Compact panels"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setPanelSize('comfortable')}
            className="p-1 hover:text-gray-700"
            aria-label="Comfortable panels"
          >
            <Square className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setPanelSize('wide')}
            className="p-1 hover:text-gray-700"
            aria-label="Wide panels"
          >
            <RectangleVertical className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {panels.map((panel) => {
          const tool = toolsById[panel.toolId];
          if (!tool) return null;
          return (
            <div key={panel.id} className="rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <div>
                  <p className="text-xs font-semibold text-gray-800">{tool.label}</p>
                  <p className="text-[11px] text-gray-500">{tool.description}</p>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(panel.id)}
                    className="p-1 hover:text-gray-700"
                    aria-label="Collapse panel"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => closePanel(panel.id)}
                    className="p-1 hover:text-gray-700"
                    aria-label="Close panel"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {!panel.collapsed && (
                <div className="p-3 space-y-2">
                  {panel.toolId === 'history' ? (
                    <HistoryPanelContent />
                  ) : (
                    <>
                      <p className="text-xs text-gray-600">{tool.summary}</p>
                      <p className="text-[11px] text-gray-500">
                        Keep the workspace visible while reviewing this panel.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="border-t border-gray-200 px-3 py-2 text-[11px] text-gray-500">
        Panels stay open while you observe the workspace.
      </div>
    </aside>
  );
}
