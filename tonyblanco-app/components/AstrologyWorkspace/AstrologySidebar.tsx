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
  symbolicSolarReturnYear?: number | null;
  setSymbolicSolarReturnYear?: (v: number | null) => void;
  symbolicLunarReturnDate?: string | null;
  setSymbolicLunarReturnDate?: (v: string | null) => void;
  showCrossAspects?: boolean;
  setShowCrossAspects?: (v: boolean) => void;
  harmonicMode?: 'off' | 'h5' | 'h7' | 'h9' | 'h11' | 'h13' | 'h16';
  setHarmonicMode?: (v: 'off' | 'h5' | 'h7' | 'h9' | 'h11' | 'h13' | 'h16') => void;
  personaMode?: 'off' | 'social' | 'professional' | 'intimate';
  setPersonaMode?: (v: 'off' | 'social' | 'professional' | 'intimate') => void;
  relocationMode?: 'off' | 'home' | 'work' | 'travel' | 'abroad';
  setRelocationMode?: (v: 'off' | 'home' | 'work' | 'travel' | 'abroad') => void;
  advancedObjects?: { nodes: boolean; fortune: boolean; symbolicPoints: boolean };
  setAdvancedObjects?: (v: { nodes: boolean; fortune: boolean; symbolicPoints: boolean }) => void;
  fixedStars?: { primary: boolean; secondary: boolean };
  setFixedStars?: (v: { primary: boolean; secondary: boolean }) => void;
  relationshipMode?: 'off' | 'couple' | 'family' | 'work' | 'social';
  setRelationshipMode?: (v: 'off' | 'couple' | 'family' | 'work' | 'social') => void;
  relationshipRole?: 'active' | 'reactive';
  setRelationshipRole?: (v: 'active' | 'reactive') => void;
  visualStyle?: 'classic' | 'huber';
  setVisualStyle?: (v: 'classic' | 'huber') => void;
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
  showCrossAspects = false,
  setShowCrossAspects,
  harmonicMode = 'off',
  setHarmonicMode,
  personaMode = 'off',
  setPersonaMode,
  relocationMode = 'off',
  setRelocationMode,
  advancedObjects = { nodes: false, fortune: false, symbolicPoints: false },
  setAdvancedObjects,
  fixedStars = { primary: false, secondary: false },
  setFixedStars,
  relationshipMode = 'off',
  setRelationshipMode,
  relationshipRole = 'active',
  setRelationshipRole,
  visualStyle = 'classic',
  setVisualStyle,
}: AstrologySidebarProps) {
  const canUseForecast = Boolean(hasIdentity);
  const isLayerActive = (layer: string) => Boolean(activeLayers && activeLayers.has(layer));
  const hasAnySymbolicTemporalLayer = Boolean(
    activeLayers && (activeLayers.has('transits') || activeLayers.has('progressions') || activeLayers.has('solarArc'))
  );
  const canUseSymbolicDoubleWheel = canUseForecast && hasAnySymbolicTemporalLayer;
  const canUseReturns = canUseForecast;
  const isSolarReturnActive = isLayerActive('return_solar');
  const isLunarReturnActive = isLayerActive('return_lunar');
  const isPlanetaryLayerActive = isLayerActive('planetary');
  const isHarmonicsActive = harmonicMode !== 'off' && isLayerActive('harmonics');
  const isPersonaActive = personaMode !== 'off' && isLayerActive('persona');
  const isRelocationActive = relocationMode !== 'off' && isLayerActive('relocation');
  const isRelationshipsActive = relationshipMode !== 'off' && isLayerActive('relationships');
  const isAdvancedObjectsActive = Boolean(advancedObjects.nodes || advancedObjects.fortune || advancedObjects.symbolicPoints);
  const hasSecondaryLayer = Boolean(activeLayers && (
    activeLayers.has('transits') ||
    activeLayers.has('progressions') ||
    activeLayers.has('solarArc') ||
    activeLayers.has('return_solar') ||
    activeLayers.has('return_lunar')
  ));

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
              m.id === 'huber' ? (
                <div key={m.id} className={`flex items-center justify-between px-2 py-1 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                  <div className="text-sm" title="Disponible en modo simbólico. Cambia la representación visual sin recalcular ni modificar datos.">
                    {m.name} · <span className="text-gray-500">disponible en modo simbólico</span>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={visualStyle === 'huber'}
                      onChange={(e) => setVisualStyle && setVisualStyle(e.target.checked ? 'huber' : 'classic')}
                      disabled={!canUseForecast}
                      title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Estilo HUBER: lectura psicológica simbólica (no astronómica). No recalcula ni modifica datos.'}
                    />
                  </label>
                </div>
              ) : (
                <div key={m.id} className={`flex items-center justify-between px-2 py-1 border rounded ${m.status === 'active' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-80'}`}>
                  <div className="text-sm">{m.name}</div>
                  <div className="text-xs text-gray-500">
                    {m.status === 'active' ? 'activo' : m.status === 'locked' ? '🔒 bloqueado' : 'próximamente'}
                  </div>
                </div>
              )
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
            <div className={`flex items-center justify-between px-2 py-1 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div
                className="text-[13px]"
                title="Aspectos cruzados simbólicos entre carta natal y la capa activa. No predice eventos."
              >
                Aspectos cruzados · <span className="text-gray-500">simbólicos</span>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(showCrossAspects)}
                  onChange={(e) => setShowCrossAspects && setShowCrossAspects(e.target.checked)}
                  disabled={!canUseForecast}
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : (!hasSecondaryLayer ? 'Activa una capa secundaria para ver aspectos cruzados' : 'Mostrar aspectos cruzados (solo visual)')}
                />
              </label>
            </div>
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
                    onChange={(e) => {
                      const next = e.target.checked;
                      if (onToggleLayer) onToggleLayer('return_solar');
                      if (setSymbolicSolarReturnYear) setSymbolicSolarReturnYear(next ? (symbolicSolarReturnYear ?? new Date().getFullYear()) : null);
                    }}
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
                  onChange={(e) => {
                    if (!setSymbolicSolarReturnYear) return;
                    const value = Number(e.target.value);
                    setSymbolicSolarReturnYear(Number.isFinite(value) ? value : null);
                  }}
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
                    onChange={(e) => {
                      const next = e.target.checked;
                      if (onToggleLayer) onToggleLayer('return_lunar');
                      if (setSymbolicLunarReturnDate) setSymbolicLunarReturnDate(next ? (symbolicLunarReturnDate ?? new Date().toISOString().slice(0, 10)) : null);
                    }}
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
                  onChange={(e) => setSymbolicLunarReturnDate && setSymbolicLunarReturnDate(e.target.value || null)}
                  disabled={!canUseReturns}
                />
              </div>
            </div>

            <div className={`flex items-center justify-between px-2 py-1 border rounded ${canUseReturns ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="text-[13px]" title="Capa planetaria simbólica. No predictiva. Usa los planetas ya visibles, sin efemérides ni fechas.">
                Planetarios · <span className="text-gray-500">capa simbólica</span>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(isPlanetaryLayerActive)}
                  onChange={() => onToggleLayer && onToggleLayer('planetary')}
                  disabled={!canUseReturns}
                  title={!canUseReturns ? 'Requiere identidad válida (fecha de nacimiento)' : 'Capa planetaria simbólica. No predictiva.'}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Especiales */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Técnicas Especiales</label>
          <div className="space-y-1 text-[11px]">
            <div className={`px-2 py-2 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div
                  className="text-[13px]"
                  title="Armónicos (modo simbólico): representan patrones de resonancia psicológica. No son cálculos astronómicos."
                >
                  Armónicos · <span className="text-gray-500">disponible (simbólico)</span>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="text-[11px] text-gray-500">Modo</div>
                <select
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-[12px]"
                  value={harmonicMode}
                  onChange={(e) => {
                    const v = e.target.value as 'off' | 'h5' | 'h7' | 'h9' | 'h11' | 'h13' | 'h16';
                    setHarmonicMode && setHarmonicMode(v);
                  }}
                  disabled={!canUseForecast}
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Armónicos (modo simbólico): patrones de resonancia psicológica. No matemático ni predictivo.'}
                >
                  <option value="off">Off</option>
                  <option value="h5">h5 · creatividad / voluntad / diseño</option>
                  <option value="h7">h7 · búsqueda / refinamiento / misterio interior</option>
                  <option value="h9">h9 · integración / visión / propósito</option>
                  <option value="h11">h11 · innovación / ruptura de patrón</option>
                  <option value="h13">h13 · transformación / reconfiguración</option>
                  <option value="h16">h16 · estructura / reconstrucción</option>
                </select>
              </div>
            </div>

            <div className={`flex items-center justify-between px-2 py-1 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="text-[13px]" title="Persona Chart — lectura simbólica. No crea una carta nueva; solo cambia el énfasis visual.">
                Persona Chart · <span className="text-gray-500">lectura simbólica</span>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(isPersonaActive)}
                  onChange={() => setPersonaMode && setPersonaMode(isPersonaActive ? 'off' : 'social')}
                  disabled={!canUseForecast}
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Persona Chart (simbólico): representa la identidad que el individuo muestra o utiliza en un contexto específico. No es una carta astronómica.'}
                />
              </label>
            </div>
            <div className={`mt-1 flex items-center justify-between gap-2 px-2 py-2 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="text-[11px] text-gray-500">Modo Persona</div>
              <select
                className="rounded border border-gray-200 bg-white px-2 py-1 text-[12px]"
                value={personaMode}
                onChange={(e) => {
                  const v = e.target.value as 'off' | 'social' | 'professional' | 'intimate';
                  setPersonaMode && setPersonaMode(v);
                }}
                disabled={!canUseForecast}
                title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Persona Chart (simbólico): representa la identidad visible/adaptativa según contexto. No es una carta astronómica.'}
              >
                <option value="off">Off</option>
                <option value="social">Social · “Cómo me ven”</option>
                <option value="professional">Profesional · “Cómo actúo”</option>
                <option value="intimate">Íntimo · “Cómo me muestro cuando confío”</option>
              </select>
            </div>

            <div className={`px-2 py-2 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="text-[13px]" title="Relocación simbólica (no astronómica). No cambia coordenadas reales ni recalcula.">
                  Relocación · <span className="text-gray-500">simbólica</span>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(isRelocationActive)}
                    onChange={() => setRelocationMode && setRelocationMode(isRelocationActive ? 'off' : 'home')}
                    disabled={!canUseForecast}
                    title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Relocación simbólica: describe cómo el entorno influye en la experiencia vital. No es una carta astronómica relocada.'}
                  />
                </label>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="text-[11px] text-gray-500">Entorno</div>
                <select
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-[12px]"
                  value={relocationMode}
                  onChange={(e) => {
                    const v = e.target.value as 'off' | 'home' | 'work' | 'travel' | 'abroad';
                    setRelocationMode && setRelocationMode(v);
                  }}
                  disabled={!canUseForecast}
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Relocación simbólica: describe cómo el entorno influye en la experiencia vital. No es una carta astronómica relocada.'}
                >
                  <option value="off">Off</option>
                  <option value="home">Hogar · “Dónde me siento contenido”</option>
                  <option value="work">Trabajo · “Dónde me organizo y produzco”</option>
                  <option value="travel">Viaje · “Dónde exploro y aprendo”</option>
                  <option value="abroad">Extranjero · “Dónde me transformo”</option>
                </select>
              </div>
              <div className="mt-1 text-[11px] text-gray-500">Relocación simbólica (no astronómica)</div>
            </div>
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
            <div className={`px-2 py-2 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="text-[13px]" title="Objetos avanzados (modo simbólico): marcadores de proceso psicológico. No son cálculos astronómicos.">
                  Objetos avanzados · <span className="text-gray-500">disponible (simbólico)</span>
                </div>
                <span className="text-[11px] text-gray-500">{isAdvancedObjectsActive ? 'activo' : 'off'}</span>
              </div>
              <div className="mt-2 space-y-2">
                <label className="flex items-center justify-between text-[13px]">
                  <span title="Dirección simbólica de desarrollo y aprendizaje.">☑ Nodo Norte / Sur</span>
                  <input
                    type="checkbox"
                    checked={Boolean(advancedObjects.nodes)}
                    onChange={(e) => setAdvancedObjects && setAdvancedObjects({ ...advancedObjects, nodes: e.target.checked })}
                    disabled={!canUseForecast}
                    title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Dirección simbólica de desarrollo y aprendizaje.'}
                  />
                </label>
                <label className="flex items-center justify-between text-[13px]">
                  <span title="Área de fluidez y facilidad experiencial.">☑ Parte de la Fortuna</span>
                  <input
                    type="checkbox"
                    checked={Boolean(advancedObjects.fortune)}
                    onChange={(e) => setAdvancedObjects && setAdvancedObjects({ ...advancedObjects, fortune: e.target.checked })}
                    disabled={!canUseForecast}
                    title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Área de fluidez y facilidad experiencial.'}
                  />
                </label>
                <label className="flex items-center justify-between text-[13px]">
                  <span title="Marcadores de enfoque psicológico (no astronómicos).">☑ Puntos simbólicos</span>
                  <input
                    type="checkbox"
                    checked={Boolean(advancedObjects.symbolicPoints)}
                    onChange={(e) => setAdvancedObjects && setAdvancedObjects({ ...advancedObjects, symbolicPoints: e.target.checked })}
                    disabled={!canUseForecast}
                    title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Marcadores de enfoque psicológico (no astronómicos).'}
                  />
                </label>
              </div>
              <div className="mt-2 text-[11px] text-gray-500">Marcadores simbólicos (sin grados ni cálculo astronómico real).</div>
            </div>
            <div className="flex items-center justify-between px-2 py-1 border rounded">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Boolean(showAsteroids)} onChange={(e) => setShowAsteroids && setShowAsteroids(e.target.checked)} />
                <span className="text-[13px]">Asteroides</span>
              </label>
            </div>
            <div className={`px-2 py-2 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="text-[13px]" title="Estrellas fijas (modo simbólico): arquetipos culturales utilizados como referencias psicológicas. No son predicciones.">
                  Estrellas fijas · <span className="text-gray-500">modo simbólico (arquetipos)</span>
                </div>
                <span className="text-[11px] text-gray-500">{fixedStars.primary ? 'activo' : 'off'}</span>
              </div>
              <div className="mt-2 space-y-2">
                <label className="flex items-center justify-between text-[13px]">
                  <span title="Estrellas principales (modo simbólico).">★ Estrellas principales</span>
                  <input
                    type="checkbox"
                    checked={Boolean(fixedStars.primary)}
                    onChange={(e) => setFixedStars && setFixedStars({ ...fixedStars, primary: e.target.checked })}
                    disabled={!canUseForecast}
                    title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Estrellas fijas (modo simbólico): arquetipos culturales. No predictivo.'}
                  />
                </label>
                <label className="flex items-center justify-between text-[13px] opacity-60">
                  <span title="Placeholder: no implementar aún.">★ Estrellas secundarias (placeholder)</span>
                  <input
                    type="checkbox"
                    checked={Boolean(fixedStars.secondary)}
                    onChange={() => {}}
                    disabled={true}
                    title="Placeholder: no implementar aún."
                  />
                </label>
              </div>
              <div className="mt-2 text-[11px] text-gray-500">Arquetipos (educativo y no fatalista).</div>
            </div>

            <div className={`px-2 py-2 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div
                  className="text-[13px]"
                  title="Relaciones (modo simbólico): muestra dinámicas psicológicas del vínculo. No evalúa compatibilidad ni predice resultados."
                >
                  Relaciones · <span className="text-gray-500">modo simbólico</span>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(isRelationshipsActive)}
                    onChange={() => setRelationshipMode && setRelationshipMode(isRelationshipsActive ? 'off' : 'couple')}
                    disabled={!canUseForecast}
                    title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Relaciones (modo simbólico): dinámicas psicológicas del vínculo. No compatibilidad ni predicción.'}
                  />
                </label>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-[11px] text-gray-500">Enfoque</div>
                <select
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-[12px]"
                  value={relationshipMode}
                  onChange={(e) => setRelationshipMode && setRelationshipMode(e.target.value as any)}
                  disabled={!canUseForecast || relationshipMode === 'off'}
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Selecciona el enfoque vincular (simbólico). No predice resultados.'}
                >
                  <option value="off">Off</option>
                  <option value="couple">Pareja · espejo y aprendizaje</option>
                  <option value="family">Familia · roles y pertenencia</option>
                  <option value="work">Trabajo · cooperación y función</option>
                  <option value="social">Social · intercambio y adaptación</option>
                </select>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-[11px] text-gray-500">Rol</div>
                <select
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-[12px]"
                  value={relationshipRole}
                  onChange={(e) => setRelationshipRole && setRelationshipRole(e.target.value as any)}
                  disabled={!canUseForecast || relationshipMode === 'off'}
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Rol simbólico del consultante: activo o reactivo.'}
                >
                  <option value="active">Activo</option>
                  <option value="reactive">Reactivo</option>
                </select>
              </div>
              <div className="mt-2 text-[11px] text-gray-500">Dinámicas (proyección/sombra/complemento) — educativo, no determinista.</div>
            </div>
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
