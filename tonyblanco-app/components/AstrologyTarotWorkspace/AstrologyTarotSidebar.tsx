'use client';

import type { AstrologyTarotSectionId, TarotSystemId } from './types';
import {
  CalendarDaysIcon,
  Squares2X2Icon,
  HandRaisedIcon,
  LinkIcon,
  RectangleGroupIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/solid';
import { SwmV3Button } from '../SWMV3';

interface AstrologyTarotSidebarProps {
  activeSection: AstrologyTarotSectionId;
  onChange: (section: AstrologyTarotSectionId) => void;
  systemId?: TarotSystemId | null;
  patientId?: string;
  selectedCardId?: string | null;
}

const sections: Array<{
  id: AstrologyTarotSectionId;
  label: string;
  description: string;
  Icon: typeof CalendarDaysIcon;
}> = [
  {
    id: 'tarot-natal',
    label: 'Carta Natal',
    description: 'Configuración simbólica de origen.',
    Icon: CalendarDaysIcon,
  },
  {
    id: 'tarot-tree-spread',
    label: 'Tirada del Árbol',
    description: 'Posiciones inspiradas en el Árbol de la Vida.',
    Icon: Squares2X2Icon,
  },
  {
    id: 'tarot-free-spread',
    label: 'Tirada Libre',
    description: 'Exploración abierta sin estructura fija.',
    Icon: HandRaisedIcon,
  },
  {
    id: 'tarot-correspondences',
    label: 'Correspondencias',
    description: 'Vínculos simbólicos entre cartas.',
    Icon: LinkIcon,
  },
  {
    id: 'tarot-deck-view',
    label: 'Visualizar Mazo',
    description: 'Vista completa del mazo.',
    Icon: RectangleGroupIcon,
  },
  {
    id: 'tarot-ai-draft',
    label: 'Preparar Análisis IA',
    description: 'Borrador simbólico, sin ejecución.',
    Icon: ClipboardDocumentCheckIcon,
  },
];

export default function AstrologyTarotSidebar({
  activeSection,
  onChange,
  systemId,
  patientId,
  selectedCardId,
}: AstrologyTarotSidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Workspace simbólico
        </p>
        <h2 className="text-lg font-semibold text-gray-900">Tarot</h2>
      </div>
      <div className="flex-1 px-3 py-4 space-y-4">
        <div className="space-y-2">
          {sections.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onChange(section.id)}
                className={`w-full text-left rounded-md border px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'border-gray-300 bg-gray-100 text-gray-900'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <section.Icon className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium">{section.label}</p>
                </div>
                <p className="text-[11px] text-gray-500">{section.description}</p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-gray-100">
        <SwmV3Button
          consultantId={patientId}
          systemId={systemId ?? 'thoth'}
          selectedCardId={selectedCardId ?? null}
        />
      </div>
      <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-500">
        Observacional. Sin lectura automática.
      </div>
    </aside>
  );
}
