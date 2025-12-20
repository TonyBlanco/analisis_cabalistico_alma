'use client';

import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BookOpen,
  ClipboardCheck,
  History,
  Layers,
  NotebookPen,
  Sparkles,
  Stethoscope,
  Telescope,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { usePanelManager } from '@/components/TherapistWorkspace/PanelManagerContext';
import { toolRegistry, type ToolGroupId, type ToolId } from '@/components/TherapistWorkspace/panelRegistry';

const groupLabels: Record<ToolGroupId, string> = {
  observation: 'Observation',
  evaluation: 'Evaluation',
  symbolic: 'Symbolic tools',
  history: 'History',
  resources: 'Resources',
};

const toolIcons: Record<ToolId, LucideIcon> = {
  overview: Telescope,
  notes: NotebookPen,
  tests: ClipboardCheck,
  bioemotional: Activity,
  'tree-of-life': Layers,
  hypotheses: Stethoscope,
  history: History,
  kabbalah: Sparkles,
  resources: BookOpen,
};

const groupOrder: ToolGroupId[] = [
  'observation',
  'evaluation',
  'symbolic',
  'history',
  'resources',
];

export default function TherapistSidebar() {
  const { panels, togglePanel } = usePanelManager();
  const [expanded, setExpanded] = useState(false);

  const activeToolIds = useMemo(
    () => new Set(panels.map((panel) => panel.toolId)),
    [panels],
  );

  const groupedTools = useMemo(() => {
    return groupOrder.map((group) => ({
      id: group,
      label: groupLabels[group],
      tools: toolRegistry.filter((tool) => tool.group === group),
    }));
  }, []);

  return (
    <aside
      className={`hidden sm:flex sm:flex-col ${
        expanded ? 'w-56 lg:w-64' : 'w-16'
      } bg-white border-r border-gray-200 min-h-screen transition-all`}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center">
            <Layers className="h-4 w-4 text-gray-600" />
          </div>
          {expanded && (
            <div>
              <p className="text-xs font-semibold text-gray-800">Workspace</p>
              <p className="text-[11px] text-gray-500">Control panel</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="p-1 text-gray-500 hover:text-gray-700"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-3">
        {groupedTools.map((group) => (
          <div key={group.id} className="space-y-2">
            {expanded && (
              <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.tools.map((tool) => {
                const Icon = toolIcons[tool.id];
                const isActive = activeToolIds.has(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => togglePanel(tool.id)}
                    title={!expanded ? tool.label : undefined}
                    className={`flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm transition-colors border ${
                      isActive
                        ? 'bg-gray-100 text-gray-900 border-gray-200'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                    {expanded && (
                      <div className="text-left">
                        <div className="text-sm font-medium">{tool.label}</div>
                        <div className="text-[11px] text-gray-400">{tool.description}</div>
                      </div>
                    )}
                    {!expanded && <span className="sr-only">{tool.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {expanded ? 'Workspace active' : 'Active'}
        </div>
      </div>
    </aside>
  );
}
