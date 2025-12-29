'use client';

import ASTRO_METHODS from '@/lib/astrologyMethods';

interface AstrologySidebarProps {
  houseSystem: string;
  setHouseSystem: (s: string) => void;
  zodiacType: string;
  setZodiacType: (s: string) => void;
  showAsteroids?: boolean;
  setShowAsteroids?: (v: boolean) => void;
  synastryEnabled?: boolean;
  setSynastryEnabled?: (v: boolean) => void;
  hasIdentity?: boolean;
  activeLayers?: Set<string>;
  onToggleLayer?: (layer: string) => void;
  symbolicDoubleWheel?: boolean;
  setSymbolicDoubleWheel?: (v: boolean) => void;
  symbolicSolarReturnYear?: number;
  setSymbolicSolarReturnYear?: (v: number) => void;
  symbolicLunarReturnDate?: string;
  setSymbolicLunarReturnDate?: (v: string) => void;
}

const HOUSE_OPTIONS: Array<{ code: string; name: string; desc?: string }> = [
  { code: 'P', name: 'Placidus', desc: 'Predeterminado (actualmente activo).' },
  { code: 'K', name: 'Koch', desc: 'Mayor sensibilidad a latitud/tiempo en la cúspide.' },
  { code: 'E', name: 'Equal (Casas Iguales)', desc: 'Simplificación estructural (útil para lectura simbólica).' },
  { code: 'W', name: 'Whole Sign', desc: 'Cada casa = un signo completo.' },
  { code: 'R', name: 'Regiomontanus', desc: 'Tradicional/horaria.' },
];

const ZODIAC_OPTIONS: Array<{ code: string; name: string; desc?: string }> = [
  { code: 'tropical', name: 'Tropical', desc: 'Estándar occidental.' },
  { code: 'sidereal', name: 'Sideral', desc: 'Usa ayanamsha (backend).' },
  { code: 'draconic', name: 'Dracónico', desc: 'Rotación por Nodo Norte (lectura simbólica).' },
];

export default function AstrologySidebar({
  houseSystem,
  setHouseSystem,
  zodiacType,
  setZodiacType,
  showAsteroids = false,
  setShowAsteroids,
  synastryEnabled = false,
  setSynastryEnabled,
  hasIdentity = false,
  activeLayers,
  onToggleLayer,
  symbolicDoubleWheel = false,
  setSymbolicDoubleWheel,
  symbolicSolarReturnYear,
  setSymbolicSolarReturnYear,
  symbolicLunarReturnDate,
  setSymbolicLunarReturnDate,
}: AstrologySidebarProps) {
  const canUseForecast = Boolean(hasIdentity);
  const isLayerActive = (layer: string) => Boolean(activeLayers && activeLayers.has(layer));
  const hasAnySymbolicTemporalLayer = Boolean(
    activeLayers && (activeLayers.has('transits') || activeLayers.has('progressions') || activeLayers.has('solarArc'))
  );
  const canUseSymbolicDoubleWheel = canUseForecast && hasAnySymbolicTemporalLayer;
  const canUseReturns = canUseForecast;
  const isSolarReturnActive = isLayerActive('solarReturnSymbolic');
  const isLunarReturnActive = isLayerActive('lunarReturnSymbolic');

  const ForecastItem = ({
    layer,
    label,
    tooltip,
  }: {
    layer: 'transits' | 'progressions' | 'solarArc';
    label: string;
    tooltip: string;
  }) => (
    <div className={`flex items-center justify-between px-2 py-1 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
      <div className="text-[13px]" title={tooltip}>
        {label} · <span className="text-gray-500">lectura simbólica</span>
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isLayerActive(layer)}
          onChange={() => onToggleLayer && onToggleLayer(layer)}
          disabled={!canUseForecast}
          title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : tooltip}
        />
      </label>
    </div>
  );
  return (
    <aside className="w-72 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbólico</p>
        <h2 className="text-lg font-semibold text-gray-900">Astrología Profesional</h2>
        <p className="text-xs text-gray-500 mt-1">Motor Swiss Ephemeris — Solo lectura</p>
      </div>

      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* Tipo de Carta */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Tipo de Carta</label>
          <div className="space-y-1 text-xs">
            {ASTRO_METHODS.filter(m => m.category === 'natal').map((m) => (
              <div key={m.id} className={`flex items-center justify-between px-2 py-1 border rounded ${m.status === 'active' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-80'}`}>
                <div className="text-sm">{m.name}</div>
                <div className="text-xs text-gray-500">
                  {m.status === 'active' ? 'activo' : m.status === 'locked' ? '🔒 bloqueado' : 'próximamente'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sinastría y Parejas */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Sinastría</label>
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between px-2 py-1 border rounded bg-white">
              <div className="text-[13px]">Doble Rueda</div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Boolean(synastryEnabled)} onChange={(e) => setSynastryEnabled && setSynastryEnabled(e.target.checked)} />
              </label>
            </div>
            <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded opacity-60 text-[11px]">Compuesta (próximo)</div>
            <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded opacity-60 text-[11px]">Davison (próximo)</div>
          </div>
        </div>

        {/* Pronóstico */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Pronóstico</label>
          <div className="space-y-1 text-[11px]">
            <div className={`flex items-center justify-between px-2 py-1 border rounded ${canUseSymbolicDoubleWheel ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div
                className="text-[13px]"
                title="Doble rueda simbólica. La rueda externa representa capas temporales sin cálculo astronómico real."
              >
                Doble rueda · <span className="text-gray-500">simbólica</span>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(symbolicDoubleWheel)}
                  onChange={(e) => setSymbolicDoubleWheel && setSymbolicDoubleWheel(e.target.checked)}
                  disabled={!canUseSymbolicDoubleWheel}
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : (!hasAnySymbolicTemporalLayer ? 'Activa al menos una capa temporal simbólica' : 'Doble rueda simbólica (solo visual)')}
                />
              </label>
            </div>
            <ForecastItem
              layer="transits"
              label="Tránsitos"
              tooltip="Capa temporal simbólica que muestra activaciones externas en relación a la carta base. No predice eventos."
            />
            <ForecastItem
              layer="progressions"
              label="Progresiones"
              tooltip="Representación simbólica del desarrollo interno a lo largo del tiempo. No predice eventos."
            />
            <ForecastItem
              layer="solarArc"
              label="Arco Solar"
              tooltip="Desplazamiento simbólico uniforme usado como referencia estructural. No predice eventos."
            />
          </div>
        </div>

        {/* Retornos */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Retornos</label>
          <div className="space-y-1 text-[11px]">
            <div className={`px-2 py-2 border rounded ${canUseReturns ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div
                  className="text-[13px]"
                  title="Retorno Solar · capa anual simbólica. No corresponde a un cálculo astronómico real."
                >
                  Solar · <span className="text-gray-500">capa anual simbólica</span>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(isSolarReturnActive)}
                    onChange={() => onToggleLayer && onToggleLayer('solarReturnSymbolic')}
                    disabled={!canUseReturns}
                    title={!canUseReturns ? 'Requiere identidad válida (fecha de nacimiento)' : 'Activar capa anual simbólica (solo visual)'}
                  />
                </label>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="text-[11px] text-gray-500">Año</div>
                <input
                  type="number"
                  className="w-24 rounded border border-gray-200 px-2 py-1 text-[12px]"
                  value={symbolicSolarReturnYear ?? new Date().getFullYear()}
                  onChange={(e) => setSymbolicSolarReturnYear && setSymbolicSolarReturnYear(Number(e.target.value))}
                  disabled={!canUseReturns}
                  min={1900}
                  max={2100}
                />
              </div>
            </div>

            <div className={`px-2 py-2 border rounded ${canUseReturns ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div
                  className="text-[13px]"
                  title="Retorno Lunar · capa mensual simbólica. No corresponde a un cálculo astronómico real."
                >
                  Lunar · <span className="text-gray-500">capa mensual simbólica</span>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(isLunarReturnActive)}
                    onChange={() => onToggleLayer && onToggleLayer('lunarReturnSymbolic')}
                    disabled={!canUseReturns}
                    title={!canUseReturns ? 'Requiere identidad válida (fecha de nacimiento)' : 'Activar capa mensual simbólica (solo visual)'}
                  />
                </label>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="text-[11px] text-gray-500">Fecha</div>
                <input
                  type="date"
                  className="rounded border border-gray-200 px-2 py-1 text-[12px]"
                  value={symbolicLunarReturnDate ?? new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setSymbolicLunarReturnDate && setSymbolicLunarReturnDate(e.target.value)}
                  disabled={!canUseReturns}
                />
              </div>
            </div>

            <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded opacity-50">🔒 Planetarios</div>
          </div>
        </div>

        {/* Especiales */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Técnicas Especiales</label>
          <div className="space-y-1 text-[11px]">
            <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded opacity-50">🔒 Armónicos</div>
            <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded opacity-50">🔒 Persona Charts</div>
            <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded opacity-50">🔒 Relocación</div>
          </div>
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

        {/* Objetos */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Objetos</label>
          <div className="space-y-1 text-xs">
            <div className="px-2 py-1 bg-green-50 border border-green-200 rounded">
              <span className="font-medium">✅ Planetas</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 border rounded">
              <div className="text-[13px]">🔒 Puntos matemáticos</div>
              <div className="text-xs text-gray-400">(coming)</div>
            </div>
            <div className="flex items-center justify-between px-2 py-1 border rounded">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Boolean(showAsteroids)} onChange={(e) => setShowAsteroids && setShowAsteroids(e.target.checked)} />
                <span className="text-[13px]">Asteroides</span>
              </label>
            </div>
            <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded opacity-50 text-[11px]">🔒 Estrellas fijas</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-500">
        Visualización profesional del consultante con datos reales. Próximas fases activarán cálculos avanzados.
      </div>
      {/* Recalcular control (UI only triggers modal in parent) */}
      <div className="px-4 py-3 border-t border-gray-200">
        <button
          type="button"
          onClick={() => { if (typeof window !== 'undefined') { (window as any).dispatchEvent(new CustomEvent('open-recalc-modal')); } }}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md text-sm"
        >
          🔁 Recalcular carta
        </button>
        <p className="text-xs text-gray-400 mt-2">Recalcular solo con confirmación explícita. La carta base se conservará.</p>
      </div>
    </aside>
  );
}
