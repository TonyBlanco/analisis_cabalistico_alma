'use client';

import type { AstrologyTarotSectionId, TarotSystemId } from './types';
import {
  CalendarDaysIcon,
  Squares2X2Icon,
  HandRaisedIcon,
  LinkIcon,
  RectangleGroupIcon,
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  SparklesIcon,
  SquaresPlusIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';
import { SwmV3Button } from '../SWMV3';

interface AstrologyTarotSidebarProps {
  activeSection: AstrologyTarotSectionId;
  onChange: (section: AstrologyTarotSectionId) => void;
  selectedSystem?: TarotSystemId | null;
  onSelectSystem?: (system: TarotSystemId) => void;
  patientId?: string;
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

type SymbolicSystemImplementationStatus = 'implemented' | 'preparing';

const cabalisticSystems: Array<{
  id: TarotSystemId;
  label: string;
  description: string;
  Icon: typeof CalendarDaysIcon;
  implementationStatus: SymbolicSystemImplementationStatus;
}> = [
  {
    id: 'thoth',
    label: 'Thoth Tarot (Crowley)',
    description: 'Letras hebreas · Astrología · Árbol de la Vida',
    Icon: AcademicCapIcon,
    implementationStatus: 'implemented',
  },
  {
    id: 'golden-dawn',
    label: 'Golden Dawn Tarot',
    description: 'Sistema simbólico (en preparación)',
    Icon: CubeTransparentIcon,
    implementationStatus: 'preparing',
  },
  {
    id: 'rota',
    label: 'R.O.T.A. (tarot hermético)',
    description: 'Sistema simbólico (en preparación)',
    Icon: CubeTransparentIcon,
    implementationStatus: 'preparing',
  },
  {
    id: 'marsella',
    label: 'Tarot de Marsella (simbólico)',
    description: 'Sistema simbólico (en preparación)',
    Icon: DocumentTextIcon,
    implementationStatus: 'preparing',
  },
  {
    id: 'rider-waite',
    label: 'Rider–Waite (simbólico)',
    description: 'Sistema simbólico (en preparación)',
    Icon: DocumentTextIcon,
    implementationStatus: 'preparing',
  },
  {
    id: 'tarot-cabalistico',
    label: 'Tarot cabalístico (Árbol de la Vida)',
    description: 'Sistema simbólico (en preparación)',
    Icon: SquaresPlusIcon,
    implementationStatus: 'preparing',
  },
  {
    id: 'oracle-symbolic',
    label: 'Oráculo simbólico genérico',
    description: 'Sistema simbólico (en preparación)',
    Icon: SparklesIcon,
    implementationStatus: 'preparing',
  },
  {
    id: 'bota',
    label: 'B.O.T.A. Tarot',
    description: 'Sistema simbólico (en preparación)',
    Icon: DocumentTextIcon,
    implementationStatus: 'preparing',
  },
  {
    id: 'sephiroth',
    label: 'Tarot of the Sephiroth',
    description: 'Sistema simbólico (en preparación)',
    Icon: SquaresPlusIcon,
    implementationStatus: 'preparing',
  },
  {
    id: 'hermetic',
    label: 'Hermetic Tarot',
    description: 'Sistema simbólico (en preparación)',
    Icon: SparklesIcon,
    implementationStatus: 'preparing',
  },
];

export default function AstrologyTarotSidebar({
  activeSection,
  onChange,
  selectedSystem,
  onSelectSystem,
  patientId,
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
        <div className="pt-2">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">
            Sistemas simbólicos
          </p>
          <div className="mt-2 space-y-2">
            {cabalisticSystems.map((system) => {
              const isImplemented = system.implementationStatus === 'implemented';
              const isDisabled = !isImplemented;
              const isSelected = isImplemented && system.id === selectedSystem;

              const badgeLabel = isImplemented ? 'Implementado' : 'Próximamente';
              const stateLabel = isImplemented ? 'Activo' : 'Inactivo';
              const BadgeIcon = isImplemented ? CheckCircleIcon : ClockIcon;

              const selectedClasses =
                'border-emerald-200 bg-emerald-50 text-gray-900';
              const enabledIdleClasses =
                'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900';
              const disabledClasses =
                'border-gray-200 bg-gray-50 text-gray-500 opacity-80 cursor-not-allowed';

              return (
                <button
                  key={system.id}
                  type="button"
                  disabled={isDisabled}
                  aria-disabled={isDisabled}
                  title={
                    isDisabled ? 'Sistema en preparación (no ejecutable)' : undefined
                  }
                  onClick={() => {
                    if (isDisabled) {
                      return;
                    }
                    onSelectSystem?.(system.id);
                  }}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    isDisabled
                      ? disabledClasses
                      : isSelected
                        ? selectedClasses
                        : enabledIdleClasses
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <system.Icon className="h-4 w-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">
                        {system.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                          isImplemented
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        <BadgeIcon className="h-3.5 w-3.5" />
                        {badgeLabel}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-600">
                        {stateLabel}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400">{system.description}</p>
                  {isDisabled && (
                    <p className="mt-1 text-[11px] text-gray-500">
                      Este sistema está preparado pero aún no está activo. Sistema en
                      preparación.
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="px-3 py-2 border-t border-gray-100">
        <SwmV3Button consultantId={patientId} />
      </div>
      <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-500">
        Observacional. Sin lectura automática.
      </div>
    </aside>
  );
}

