'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BookOpen,
  ClipboardCheck,
  Compass,
  History,
  Layers,
  LayoutGrid,
  LayoutDashboard,
  NotebookPen,
  Sparkles,
  Stethoscope,
  Telescope,
  ChevronRight,
  ChevronLeft,
  Users,
  Stars,
  Flower2,
  Microscope,
  BarChart3,
  Settings,
} from 'lucide-react';
import { usePanelManager } from '@/components/TherapistWorkspace/PanelManagerContext';
import { toolRegistry } from '@/components/TherapistWorkspace/panelRegistry';
import type { ToolGroupId, ToolId } from '@/components/TherapistWorkspace/panelRegistry';

const groupLabels: Record<ToolGroupId, string> = {
  observation: 'OBSERVACION',
  evaluation: 'EVALUACION',
  symbolic: 'HERRAMIENTAS SIMBOLICAS',
  history: 'HISTORIAL',
  resources: 'RECURSOS',
};

const toolIcons: Record<ToolId, LucideIcon> = {
  bioemotional: Activity,
  'tree-of-life': Layers,
  hypotheses: Stethoscope,
  history: History,
  kabbalah: Sparkles,
  resources: BookOpen,
};

const groupOrder: ToolGroupId[] = [
  // 'observation' y 'evaluation' removidos - las herramientas ahora están en el Context Map del workspace
  'symbolic',
  'history',
  'resources',
];

// Main navigation links for therapist dashboard
const mainNavLinks = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard/therapist',
    icon: LayoutDashboard,
  },
  {
    id: 'patients',
    label: 'Pacientes',
    href: '/dashboard/therapist/patients',
    icon: Users,
  },
  {
    id: 'astrology',
    label: 'Astrología',
    href: '/dashboard/therapist/astrologia',
    icon: Stars,
  },
  {
    id: 'cabala',
    label: 'Cábala Fénix',
    href: '/dashboard/therapist/holistica-aplicada',
    icon: Flower2,
  },
  {
    id: 'tests',
    label: 'Tests Modulares',
    href: '/dashboard/therapist/tests',
    icon: Microscope,
  },
  {
    id: 'reports',
    label: 'Reportes',
    href: '/dashboard/therapist/reports',
    icon: BarChart3,
  },
  {
    id: 'settings',
    label: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
];

const swmToolRoutes: Partial<Record<ToolId, string>> = {
  bioemotional: '/dashboard/therapist/bioemotional-experiencial-profunda',
  'tree-of-life': '/dashboard/therapist/cabala-aplicada',
  hypotheses: '/dashboard/therapist/transgeneracional-profundo',
  kabbalah: '/dashboard/therapist/cabala-aplicada',
};

const swmLaunchers = [
  {
    id: 'bioemotional-experiencial',
    title: 'Bio-Emocion Experiencial',
    description: 'Workspace profundo de observacion.',
    href: '/dashboard/therapist/bioemotional-experiencial-profunda',
    icon: LayoutGrid,
    enabled: true,
  },
  {
    id: 'cabala-aplicada',
    title: 'Cabala Aplicada',
    description: 'Workspace simbolico observacional.',
    href: '/dashboard/therapist/cabala-aplicada',
    icon: Sparkles,
    enabled: true,
  },
  {
    id: 'transgeneracional-profundo',
    title: 'Transgeneracional Profundo',
    description: 'Workspace relacional sin inferencia.',
    href: '/dashboard/therapist/transgeneracional-profundo',
    icon: Stethoscope,
    enabled: true,
  },
  {
    id: 'tarot',
    title: 'Tarot Terapéutico',
    description: 'Workspace de Tarot terapéutico (separado de Astrología).',
    href: '/dashboard/therapist/tarot',
    icon: Compass,
    enabled: true,
  },
  {
    id: 'astrologia-tarot',
    title: 'Astrologia | Tarot',
    description: 'Workspace combinado — Proximamente. Usa Astrología o Tarot por separado.',
    href: '/dashboard/therapist/astrologia-tarot',
    icon: Compass,
    enabled: false, // Proximamente: mantener combinado deshabilitado, usar workspaces separados
  },
  {
    id: 'astrologia',
    title: 'Astrologia',
    description: 'Workspace astrologico observacional (punto de referencia para módulos astrológicos).',
    href: '/dashboard/therapist/astrologia',
    icon: Telescope,
    enabled: true,
  },
  {
    id: 'resonancia-ancestral',
    title: 'Resonancia Ancestral',
    description: 'Cartografía simbólica — no clínica.',
    href: '/dashboard/therapist/resonancia-ancestral',
    icon: Activity,
    enabled: true,
  },
  {
    id: 'mcmi4-mystic',
    title: 'MCMI-4 Místico',
    description: 'Workspace cabalístico para cuestionario Millon.',
    href: '/dashboard/therapist/swm/mcmi4',
    icon: Sparkles,
    enabled: true,
  },
];

export default function TherapistSidebar() {
  const { panels, openPanel } = usePanelManager();
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
      className={`hidden sm:flex sm:flex-col ${expanded ? 'w-56 lg:w-64' : 'w-16'
        } bg-white border-r border-gray-200 min-h-screen transition-all`}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center">
            <Layers className="h-4 w-4 text-gray-600" />
          </div>
          {expanded && (
            <div>
              <p className="text-xs font-semibold text-gray-800">Espacio clinico</p>
              <p className="text-[11px] text-gray-500">Panel de control</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="p-1 text-gray-500 hover:text-gray-700"
          aria-label={expanded ? 'Colapsar panel' : 'Expandir panel'}
        >
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Main Navigation */}
        <div className="space-y-2">
          {expanded && (
            <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Navegación
            </div>
          )}
          <div className="space-y-1">
            {mainNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.id} href={link.href} className="block">
                  <div className="flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm transition-colors border border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                    <Icon className="h-5 w-5 text-gray-500" />
                    {expanded && (
                      <div className="text-sm font-medium">{link.label}</div>
                    )}
                    {!expanded && <span className="sr-only">{link.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tool Groups */}
        {groupedTools.map((group) => (
          <div key={group.id} className="space-y-2">
            {expanded && (
              <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.tools.map((tool) => {
                const Icon = toolIcons[tool.id] || Layers;
                const isActive = activeToolIds.has(tool.id);
                const swmHref = swmToolRoutes[tool.id];
                const content = (
                  <div
                    className={`flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm transition-colors border ${isActive
                      ? 'bg-gray-100 text-gray-900 border-gray-200'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                    {expanded && (
                      <div className="text-left">
                        <div className="text-sm font-medium">{tool.label}</div>
                        {tool.description && (
                          <div className="text-[11px] text-gray-400">{tool.description}</div>
                        )}
                      </div>
                    )}
                    {!expanded && <span className="sr-only">{tool.label}</span>}
                  </div>
                );

                if (swmHref) {
                  return (
                    <Link key={tool.id} href={swmHref} className="block">
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => openPanel(tool.id)}
                    title={!expanded ? tool.label : undefined}
                    className="w-full text-left"
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="space-y-2 pt-2">
          {expanded && (
            <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Workspaces
            </div>
          )}
          <div className="space-y-1">
            {swmLaunchers.map((launcher) => {
              const Icon = launcher.icon;
              const content = (
                <div
                  className={`flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm transition-colors border ${launcher.enabled
                    ? 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    : 'border-transparent text-gray-400 bg-gray-50 cursor-not-allowed'
                    }`}
                >
                  <Icon className={`h-5 w-5 ${launcher.enabled ? 'text-gray-500' : 'text-gray-400'}`} />
                  {expanded && (
                    <div className="text-left">
                      <div className="text-sm font-medium">{launcher.title}</div>
                      <div className="text-[11px] text-gray-400">{launcher.description}</div>
                    </div>
                  )}
                  {!expanded && <span className="sr-only">{launcher.title}</span>}
                  {expanded && (
                    <span
                      className={`ml-auto text-[10px] ${launcher.enabled ? 'text-emerald-600' : 'text-gray-400'
                        }`}
                    >
                      {launcher.enabled ? 'Disponible' : 'Proximamente'}
                    </span>
                  )}
                </div>
              );

              if (!launcher.enabled) {
                return (
                  <div key={launcher.id} aria-disabled="true">
                    {content}
                  </div>
                );
              }

              return (
                <Link key={launcher.id} href={launcher.href} className="block">
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {expanded ? 'Espacio clinico activo' : 'Activo'}
        </div>
      </div>
    </aside>
  );
}
