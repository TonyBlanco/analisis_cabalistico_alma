'use client';

import type { AstrologyViewMode } from './types';

interface AstrologySidebarProps {
  activeView: AstrologyViewMode;
  onViewChange: (view: AstrologyViewMode) => void;
  houseSystem: string;
  setHouseSystem: (s: string) => void;
}

const sections: Array<{ id: AstrologyViewMode; label: string; enabled: boolean }> = [
  { id: 'visual', label: 'Visual', enabled: true },
  { id: 'correspondences', label: 'Correspondencias', enabled: false },
  { id: 'synthesis', label: 'Sintesis', enabled: false },
];

const HOUSE_OPTIONS: Array<{ code: string; name: string; desc?: string }> = [
  { code: 'P', name: 'Placidus', desc: 'Predeterminado para Psicoterapia (actualmente activo).' },
  { code: 'K', name: 'Koch', desc: 'Precisión en eventos psicológicos locales.' },
  { code: 'E', name: 'Equal (Casas Iguales)', desc: 'Simplificación estructural para análisis de Sefirot.' },
  { code: 'W', name: 'Whole Sign', desc: 'Recomendado para Kabbalah: Alinea cada casa exactamente con un signo/letra hebrea.' },
  { code: 'R', name: 'Regiomontanus', desc: 'Astrología horaria y tradicional.' },
];

export default function AstrologySidebar({ activeView, onViewChange, houseSystem, setHouseSystem }: AstrologySidebarProps) {
  return (
    <aside className="w-72 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbolico</p>
        <h2 className="text-lg font-semibold text-gray-900">Astrologia</h2>
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
                  <p className="text-[11px] text-gray-500">{section.enabled ? (activeView === section.id ? 'Activo' : 'Disponible') : 'Deshabilitado'}</p>
                </div>
                <div className="text-xs text-gray-400">{section.id === 'visual' ? '✓' : ''}</div>
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
              <option key={opt.code} value={opt.code}>{`${opt.code} — ${opt.name}`}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">{HOUSE_OPTIONS.find((h) => h.code === houseSystem)?.desc}</p>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-500">
        Observacional. Con interpretación asistida, sin predicción clínica, sin automatización decisoria.
      </div>
    </aside>
  );
}
