'use client';

import type { AstrologyTarotSectionId } from './types';
import {
  CalendarDaysIcon,
  Squares2X2Icon,
  HandRaisedIcon,
  LinkIcon,
  RectangleGroupIcon,
  AcademicCapIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  SparklesIcon,
  SquaresPlusIcon,
} from '@heroicons/react/24/solid';

interface AstrologyTarotSidebarProps {
  activeSection: AstrologyTarotSectionId;
  onChange: (section: AstrologyTarotSectionId) => void;
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
    description: 'Configuracion simbolica de origen.',
    Icon: CalendarDaysIcon,
  },
  {
    id: 'tarot-tree-spread',
    label: 'Tirada del Arbol',
    description: 'Posiciones inspiradas en el Arbol de la Vida.',
    Icon: Squares2X2Icon,
  },
  {
    id: 'tarot-free-spread',
    label: 'Tirada Libre',
    description: 'Exploracion abierta sin estructura fija.',
    Icon: HandRaisedIcon,
  },
  {
    id: 'tarot-correspondences',
    label: 'Correspondencias',
    description: 'Vinculos simbolicos entre cartas.',
    Icon: LinkIcon,
  },
  {
    id: 'tarot-deck-view',
    label: 'Visualizar Mazo',
    description: 'Vista completa del mazo.',
    Icon: RectangleGroupIcon,
  },
];

const cabalisticSystems: Array<{
  label: string;
  description: string;
  Icon: typeof CalendarDaysIcon;
}> = [
  {
    label: 'Thoth Tarot (Crowley)',
    description: 'Letras hebreas · Astrologia · Arbol de la Vida',
    Icon: AcademicCapIcon,
  },
  {
    label: 'Golden Dawn Tarot',
    description: 'Sistema cabalistico hermetico completo',
    Icon: CubeTransparentIcon,
  },
  {
    label: 'B.O.T.A. Tarot',
    description: 'Estudio cabalistico estructurado',
    Icon: DocumentTextIcon,
  },
  {
    label: 'Tarot of the Sephiroth',
    description: 'Enfoque en el Arbol de la Vida',
    Icon: SquaresPlusIcon,
  },
  {
    label: 'Hermetic Tarot',
    description: 'Simbolismo esoterico profundo',
    Icon: SparklesIcon,
  },
];

export default function AstrologyTarotSidebar({
  activeSection,
  onChange,
}: AstrologyTarotSidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbolico</p>
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
        <div className="pt-2">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">
            Sistemas Cabalisticos
          </p>
          <div className="mt-2 space-y-2">
            {cabalisticSystems.map((system) => (
              <div
                key={system.label}
                className="w-full rounded-md border border-dashed border-gray-200 px-3 py-2 text-left text-sm text-gray-500"
                aria-disabled="true"
              >
                <div className="flex items-center gap-2">
                  <system.Icon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">
                    {system.label}
                  </p>
                </div>
                <p className="text-[11px] text-gray-400">{system.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-500">
        Observacional. Sin lectura automatica.
      </div>
    </aside>
  );
}
