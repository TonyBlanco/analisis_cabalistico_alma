'use client';

import type { AstrologyViewMode, AstrologyWorkspaceMode } from './types';

interface AstrologySidebarProps {
  activeView: AstrologyViewMode;
  onViewChange: (view: AstrologyViewMode) => void;
  workspaceMode: AstrologyWorkspaceMode;
  setWorkspaceMode: (mode: AstrologyWorkspaceMode) => void;
  houseSystem: string;
  setHouseSystem: (s: string) => void;
  zodiacType: string;
  setZodiacType: (s: string) => void;
}

const HOUSE_OPTIONS: Array<{ code: string; name: string; desc?: string }> = [
  { code: 'P', name: 'Placidus', desc: 'Predeterminado (actualmente activo).' },
  { code: 'K', name: 'Koch', desc: 'Mayor sensibilidad a latitud/tiempo en la cúspide.' },
  { code: 'E', name: 'Equal (Casas Iguales)', desc: 'Simplificación estructural (útil para lectura simbólica).' },
  { code: 'W', name: 'Whole Sign', desc: 'Recomendado para Kabbalah: cada casa = un signo completo.' },
  { code: 'R', name: 'Regiomontanus', desc: 'Tradicional/horaria.' },
];

const ZODIAC_OPTIONS: Array<{ code: string; name: string; desc?: string }> = [
  { code: 'tropical', name: 'Tropical', desc: 'Estándar occidental.' },
  { code: 'sidereal', name: 'Sideral', desc: 'Usa ayanamsha (backend). Tradiciones védicas/estrellas fijas.' },
  { code: 'draconic', name: 'Dracónico', desc: 'Rotación por Nodo Norte (lectura simbólica).' },
];

export default function AstrologySidebar({
  activeView,
  onViewChange,
  workspaceMode,
  setWorkspaceMode,
  houseSystem,
  setHouseSystem,
  zodiacType,
  setZodiacType,
}: AstrologySidebarProps) {
  const sections: Array<{ id: AstrologyViewMode; label: string; enabled: boolean; helper?: string }> = [
    { id: 'visual', label: 'Visual', enabled: true },
    {
      id: 'training',
      label: 'Interpretación (Training)',
      enabled: workspaceMode === 'training',
      helper: 'Disponible en Training',
    },
  ];

  return (
    <aside className="w-72 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbólico</p>
        <h2 className="text-lg font-semibold text-gray-900">Astrología</h2>

        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Modo</label>
          <div className="inline-flex w-full rounded-md border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setWorkspaceMode('observational')}
              className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold transition-colors ${
                workspaceMode === 'observational'
                  ? 'bg-white border border-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-white/70'
              }`}
            >
              Observacional
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode('training')}
              className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold transition-colors ${
                workspaceMode === 'training'
                  ? 'bg-amber-50 border border-amber-200 text-amber-900'
                  : 'text-gray-600 hover:bg-white/70'
              }`}
            >
              Training / Interpretativa
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-500">
            En Training se habilitan métodos de interpretación simbólica (formativos). Sin evaluación médica. Sin decisiones automáticas.
          </p>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-4">
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              disabled={!section.enabled}
              onClick={() => section.enabled && onViewChange(section.id)}
              className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                section.enabled
                  ? activeView === section.id
                    ? 'bg-blue-50 border border-blue-200 text-blue-900'
                    : 'border border-transparent text-gray-700 hover:bg-gray-50'
                  : 'border border-transparent text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{section.label}</p>
                  <p className="text-[11px] text-gray-500">
                    {section.enabled ? (activeView === section.id ? 'Activo' : 'Disponible') : section.helper || 'Deshabilitado'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Sistema de Casas</label>
          <select
            value={houseSystem}
            onChange={(e) => setHouseSystem(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {HOUSE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>{`${opt.code} - ${opt.name}`}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">{HOUSE_OPTIONS.find((h) => h.code === houseSystem)?.desc}</p>
          <p className="text-[11px] text-gray-400 mt-1">La selección se aplica al recalcular la carta.</p>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Zodiaco</label>
          <select
            value={zodiacType}
            onChange={(e) => setZodiacType(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {ZODIAC_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">{ZODIAC_OPTIONS.find((z) => z.code === zodiacType)?.desc}</p>
          <p className="text-[11px] text-gray-400 mt-1">La selección se aplica al recalcular la carta.</p>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-500">
        {workspaceMode === 'training'
          ? 'Modo Training / Interpretativa. Uso educativo / no médico. Sin automatización decisoria.'
          : 'Modo Observacional. Solo visual. Sin interpretación estructurada.'}
      </div>
    </aside>
  );
}
