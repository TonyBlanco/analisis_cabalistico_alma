'use client';

import { useState, useCallback } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, X, Orbit, Sparkles, Sun, Music, Star, Moon, Loader2 } from 'lucide-react';
import ASTRO_METHODS from '@/lib/astrologyMethods';
import { getAuthToken } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/api-base';

// Help panel content organized by sections
const HELP_SECTIONS = [
  {
    title: 'Tipo de Carta',
    items: [
      { term: 'Carta Natal', desc: 'Posiciones de Sol, Luna y planetas al momento del nacimiento.' },
      { term: 'Natal + Asteroides', desc: 'Incluye Quirón, Juno, Ceres y otros cuerpos menores.' },
      { term: 'Estilo Huber', desc: 'Lectura psicológica simbólica, no astronómica.' },
    ],
  },
  {
    title: 'Sinastría',
    items: [
      { term: 'Doble Rueda', desc: 'Superpone dos cartas para ver aspectos cruzados entre dos personas.' },
      { term: 'Compuesta', desc: 'Carta de puntos medios que representa la energía de la relación.' },
      { term: 'Davison', desc: 'Carta del momento/lugar medio entre dos nacimientos.' },
    ],
  },
  {
    title: 'Pronóstico',
    items: [
      { term: 'Tránsitos', desc: 'Planetas actuales sobre la carta natal. Muestran activaciones externas.' },
      { term: 'Progresiones', desc: 'Evolución interna (día-por-año). Desarrollo psicológico.' },
      { term: 'Arco Solar', desc: 'Desplazamiento uniforme. Activaciones de potencial natal.' },
      { term: 'Aspectos Cruzados', desc: 'Conexiones entre carta natal y capas activas.' },
    ],
  },
  {
    title: 'Retornos',
    items: [
      { term: 'Retorno Solar', desc: 'Carta anual cuando el Sol vuelve a su posición natal. Temas del año.' },
      { term: 'Retorno Lunar', desc: 'Carta mensual (~28 días). Indica el clima emocional del ciclo.' },
      { term: 'Planetarios', desc: 'Capa simbólica basada en planetas visibles, sin efemérides.' },
    ],
  },
  {
    title: 'Técnicas Especiales',
    items: [
      { term: 'Armónicos', desc: 'Patrones de resonancia psicológica (h5, h7, h9...). No astronómicos.' },
      { term: 'Persona Chart', desc: 'Identidad visible/adaptativa según contexto (social, profesional, íntimo).' },
      { term: 'Relocación', desc: 'Cómo el entorno influye en la experiencia vital (hogar, trabajo, viaje).' },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { term: 'Sistema de Casas', desc: 'Placidus (estándar), Koch, Equal, Whole Sign, Regiomontanus.' },
      { term: 'Zodiaco', desc: 'Tropical (occidental), Sideral (védico), Dracónico (simbólico).' },
    ],
  },
  {
    title: 'Objetos Celestes',
    items: [
      { term: 'Planetas', desc: 'Sol, Luna y planetas tradicionales + modernos (Urano, Neptuno, Plutón).' },
      { term: 'Nodo Norte/Sur', desc: 'Eje kármico: dirección evolutiva y patrones pasados.' },
      { term: 'Parte de la Fortuna', desc: 'Punto árabe de bienestar y flujo vital.' },
      { term: 'Puntos Simbólicos', desc: 'Marcadores sin cálculo astronómico real.' },
      { term: 'Asteroides', desc: 'Quirón, Ceres, Palas, Juno, Vesta y otros cuerpos menores.' },
    ],
  },
  {
    title: 'Estrellas Fijas',
    items: [
      { term: 'Estrellas Principales', desc: 'Regulus, Spica, Algol, Fomalhaut... arquetipos mayores.' },
      { term: 'Estrellas Secundarias', desc: 'Constelaciones menores con significado simbólico.' },
      { term: 'Uso', desc: 'Educativo y arquetípico, no fatalista ni predictivo.' },
    ],
  },
  {
    title: 'Relaciones',
    items: [
      { term: 'Modo Relacional', desc: 'Pareja, familia, trabajo, social - contexto de la lectura.' },
      { term: 'Rol', desc: 'Activo (iniciador) o Reactivo (responde) en la dinámica.' },
    ],
  },
  {
    title: 'Desarrollo',
    items: [
      { term: 'Etapas Vitales', desc: 'Primera infancia, niñez, adolescencia, joven adulto.' },
      { term: 'Uso', desc: 'Lectura simbólica del desarrollo psicológico por edades.' },
    ],
  },
];

interface AstrologySidebarProps {
  houseSystem: string;
  setHouseSystem: (s: string) => void;
  zodiacType: string;
  setZodiacType: (s: string) => void;
  showAsteroids?: boolean;
  setShowAsteroids?: (v: boolean) => void;
  synastryEnabled?: boolean;
  setSynastryEnabled?: (v: boolean) => void;
  compositeEnabled?: boolean;
  setCompositeEnabled?: (v: boolean) => void;
  davisonEnabled?: boolean;
  setDavisonEnabled?: (v: boolean) => void;
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
  developmentStage?: 'off' | 'early_childhood' | 'childhood_early' | 'childhood_middle' | 'adolescence' | 'young_adult';
  setDevelopmentStage?: (v: 'off' | 'early_childhood' | 'childhood_early' | 'childhood_middle' | 'adolescence' | 'young_adult') => void;
  visualStyle?: 'classic' | 'huber';
  setVisualStyle?: (v: 'classic' | 'huber') => void;
  mode?: 'symbolic' | 'real';
  layerAvailability?: {
    transits?: boolean;
    progressions?: boolean;
    solarReturn?: boolean;
    solarArc?: boolean;
    lunarReturn?: boolean;
    compositeChart?: boolean;
    davisonChart?: boolean;
  };
  lunarReturnMonth?: string;
  setLunarReturnMonth?: (m: string) => void;
  patientId?: string | number;
  hasNatalChart?: boolean;
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
  compositeEnabled = false,
  setCompositeEnabled,
  davisonEnabled = false,
  setDavisonEnabled,
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
  developmentStage = 'off',
  setDevelopmentStage,
  visualStyle = 'classic',
  setVisualStyle,
  mode = 'symbolic',
  layerAvailability,
  lunarReturnMonth,
  setLunarReturnMonth,
  patientId,
  hasNatalChart = false,
}: AstrologySidebarProps) {
  const isRealMode = mode === 'real';
  const canUseForecast = Boolean(hasIdentity);
  const available = layerAvailability ?? {};
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
  const isDevelopmentActive = developmentStage !== 'off' && isLayerActive('development');
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
  }) => {
    const isSupportedInReal = layer === 'transits' || layer === 'progressions' || layer === 'solarArc';
    const layerAvailable = isRealMode ? (isSupportedInReal && Boolean((available as any)[layer])) : true;
    const disabled =
      !canUseForecast ||
      !onToggleLayer ||
      (isRealMode && !layerAvailable);

    const stateLabel = isRealMode ? 'cálculo real' : 'lectura simbólica';
    const title = !canUseForecast
      ? 'Requiere identidad válida (fecha de nacimiento)'
      : isRealMode && !layerAvailable
          ? 'Disponible tras recalcular la carta natal (si el backend devuelve esta capa).'
          : tooltip;

    return (
      <div className={`flex items-center justify-between px-2 py-1 border rounded ${disabled ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-gray-200'}`}>
        <div className="text-[13px]" title={title}>
          {label} · <span className="text-gray-500">{stateLabel}</span>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isLayerActive(layer)}
            onChange={() => onToggleLayer?.(layer)}
            disabled={disabled}
            title={title}
          />
        </label>
      </div>
    );
  };

  // Help panel state
  const [showHelp, setShowHelp] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <aside className="w-72 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbólico</p>
            <h2 className="text-lg font-semibold text-gray-900">Astrología Profesional</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2 rounded-full transition-colors ${showHelp ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
            aria-label="Mostrar ayuda"
            title="Guía de conceptos astrológicos"
          >
            {showHelp ? <X className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Motor Swiss Ephemeris — Solo lectura</p>
      </div>

      {/* Collapsible Help Panel */}
      {showHelp && (
        <div className="border-b border-gray-200 bg-gradient-to-b from-purple-50 to-white max-h-80 overflow-y-auto">
          <div className="px-3 py-3">
            <div className="text-xs font-semibold text-purple-800 mb-2 flex items-center gap-1">
              📚 Guía Rápida de Conceptos
            </div>
            <div className="space-y-1">
              {HELP_SECTIONS.map((section) => (
                <div key={section.title} className="border border-purple-100 rounded bg-white">
                  <button
                    type="button"
                    onClick={() => setExpandedSection(expandedSection === section.title ? null : section.title)}
                    className="w-full px-2 py-1.5 flex items-center justify-between text-left hover:bg-purple-50 transition-colors rounded"
                  >
                    <span className="text-xs font-medium text-gray-800">{section.title}</span>
                    {expandedSection === section.title ? (
                      <ChevronUp className="w-3 h-3 text-purple-600" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                  {expandedSection === section.title && (
                    <div className="px-2 pb-2 space-y-1">
                      {section.items.map((item) => (
                        <div key={item.term} className="text-[11px] leading-relaxed">
                          <span className="font-semibold text-purple-700">{item.term}:</span>{' '}
                          <span className="text-gray-600">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-purple-100">
              <p className="text-[10px] text-purple-600 italic">
                💡 Este workspace es de solo lectura. Los cálculos no predicen eventos.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* Tipo de Carta */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Tipo de Carta</label>
          <div className="space-y-1 text-xs">
            {ASTRO_METHODS.filter(m => m.category === 'natal').map((m) => (
              m.id === 'huber' ? (
                <div key={m.id} className={`flex items-center justify-between px-2 py-1 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                  <div className="text-sm" title="Estilo HUBER: lectura psicológica simbólica. Cambia la representación visual sin recalcular datos.">
                    {m.name} · <span className="text-gray-500">disponible</span>
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
            <div className={`flex items-center justify-between px-2 py-1 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="text-[13px]" title="Carta Compuesta: puntos medios entre dos cartas natales">
                Compuesta
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={Boolean(compositeEnabled)} 
                  onChange={(e) => setCompositeEnabled && setCompositeEnabled(e.target.checked)}
                  disabled={!canUseForecast}
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Carta Compuesta: calcular puntos medios entre dos cartas natales'}
                />
              </label>
            </div>
            <div className={`flex items-center justify-between px-2 py-1 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="text-[13px]" title="Carta Davison: momento/lugar medio entre dos cartas natales">
                Davison
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(davisonEnabled)}
                  onChange={(e) => setDavisonEnabled && setDavisonEnabled(e.target.checked)}
                  disabled={!canUseForecast}
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Carta Davison: momento/lugar medio entre dos cartas natales'}
                />
              </label>
            </div>
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
                  title={isRealMode ? 'Retorno Solar (cálculo real): calculado por el motor Swiss Ephemeris al recalcular la carta base.' : 'Retorno Solar · capa anual simbólica. No corresponde a un cálculo astronómico real.'}
                >
                  Solar · <span className="text-gray-500">{isRealMode ? 'cálculo real' : 'capa anual simbólica'}</span>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(isSolarReturnActive)}
                    onChange={(e) => {
                      const next = e.target.checked;
                      if (onToggleLayer) onToggleLayer('return_solar');
                      if (!isRealMode && setSymbolicSolarReturnYear) setSymbolicSolarReturnYear(next ? (symbolicSolarReturnYear ?? new Date().getFullYear()) : null);
                    }}
                    disabled={!canUseReturns || (isRealMode && !available.solarReturn) || !onToggleLayer}
                    title={isRealMode
                      ? (!available.solarReturn ? 'Disponible tras recalcular la carta natal (si el backend devuelve solarReturn).' : 'Activar/desactivar capa anual (cálculo real).')
                      : (!canUseReturns ? 'Requiere identidad válida (fecha de nacimiento)' : 'Activar capa anual simbólica (solo visual)')}
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
                  disabled={!canUseReturns || isRealMode}
                  min={1900}
                  max={2100}
                />
              </div>
            </div>

            <div className={`px-2 py-2 border rounded ${canUseReturns ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div
                  className="text-[13px]"
                  title={isRealMode ? "Retorno Lunar (Swiss Ephemeris) · momento exacto cuando la Luna regresa a su posición natal." : "Retorno Lunar · capa mensual simbólica."}
                >
                  Lunar · <span className="text-gray-500">{isRealMode ? 'cálculo real' : 'capa mensual simbólica'}</span>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(isLunarReturnActive)}
                    onChange={(e) => {
                      const next = e.target.checked;
                      if (onToggleLayer) onToggleLayer('return_lunar');
                      if (!isRealMode && setSymbolicLunarReturnDate) setSymbolicLunarReturnDate(next ? (symbolicLunarReturnDate ?? new Date().toISOString().slice(0, 10)) : null);
                    }}
                    disabled={!canUseReturns || !onToggleLayer}
                    title={!canUseReturns ? 'Requiere identidad válida (fecha de nacimiento)' : (isRealMode ? 'Activar Retorno Lunar (cálculo Swiss Ephemeris)' : 'Activar capa mensual simbólica')}
                  />
                </label>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="text-[11px] text-gray-500">{isRealMode ? 'Mes' : 'Fecha'}</div>
                {isRealMode ? (
                  <input
                    type="month"
                    className="rounded border border-gray-200 px-2 py-1 text-[12px]"
                    value={lunarReturnMonth ?? new Date().toISOString().slice(0, 7)}
                    onChange={(e) => setLunarReturnMonth && setLunarReturnMonth(e.target.value)}
                    disabled={!canUseReturns}
                  />
                ) : (
                  <input
                    type="date"
                    className="rounded border border-gray-200 px-2 py-1 text-[12px]"
                    value={symbolicLunarReturnDate ?? new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setSymbolicLunarReturnDate && setSymbolicLunarReturnDate(e.target.value || null)}
                    disabled={!canUseReturns}
                  />
                )}
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
                  disabled={!canUseReturns || !onToggleLayer}
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
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Armónicos (modo simbólico): patrones de resonancia psicológica.'}
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
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Persona Chart (simbólico): representa la identidad que el individuo muestra o utiliza en un contexto específico.'}
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
                title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Persona Chart (simbólico): representa la identidad visible/adaptativa según contexto.'}
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
                    title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Relocación simbólica: describe cómo el entorno influye en la experiencia vital.'}
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
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Relocación simbólica: describe cómo el entorno influye en la experiencia vital.'}
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
                <div className="text-[13px]" title="Estrellas fijas (modo simbólico): arquetipos culturales utilizados como referencias psicológicas.">
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
                    title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Estrellas fijas (modo simbólico): arquetipos culturales.'}
                  />
                </label>
                <label className="flex items-center justify-between text-[13px]">
                  <span title="Estrellas de magnitud 0-2 (complementarias): Achernar, Hamal, Polaris, Deneb, Betelgeuse, Rigel, Procyon, Capella, Vega, Arcturus.">
                    ☆ Estrellas secundarias
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(fixedStars.secondary)}
                    onChange={(e) => setFixedStars && setFixedStars({
                      ...fixedStars,
                      secondary: e.target.checked
                    })}
                    disabled={!canUseForecast}
                    title={!canUseForecast 
                      ? 'Requiere identidad válida' 
                      : 'Estrellas secundarias (magnitud 0-2): complementan las principales con arquetipos adicionales.'}
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

            <div className={`px-2 py-2 border rounded ${canUseForecast ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div
                  className="text-[13px]"
                  title="Desarrollo (modo simbólico): acompaña ritmos de crecimiento y aprendizaje. No diagnostica ni predice."
                >
                  Infancia &amp; Desarrollo · <span className="text-gray-500">modo simbólico</span>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(isDevelopmentActive)}
                    onChange={() => setDevelopmentStage && setDevelopmentStage(isDevelopmentActive ? 'off' : 'early_childhood')}
                    disabled={!canUseForecast}
                    title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Desarrollo (modo simbólico): acompaña ritmos de crecimiento. No clínico, no determinista.'}
                  />
                </label>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-[11px] text-gray-500">Etapa</div>
                <select
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-[12px]"
                  value={developmentStage}
                  onChange={(e) => setDevelopmentStage && setDevelopmentStage(e.target.value as any)}
                  disabled={!canUseForecast || developmentStage === 'off'}
                  title={!canUseForecast ? 'Requiere identidad válida (fecha de nacimiento)' : 'Selecciona una etapa evolutiva (lectura educativa y acompañante). No diagnostica ni predice.'}
                >
                  <option value="off">Off</option>
                  <option value="early_childhood">Primera infancia (0–3)</option>
                  <option value="childhood_early">Infancia temprana (4–7)</option>
                  <option value="childhood_middle">Infancia media (8–11)</option>
                  <option value="adolescence">Adolescencia (12–18)</option>
                  <option value="young_adult">Juventud temprana (18–25)</option>
                </select>
              </div>
              <div className="mt-2 text-[11px] text-gray-500">Enfoque en necesidades evolutivas y acompañamiento (educativo, no clínico).</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-500">
        Visualización profesional del consultante con datos reales. Próximas fases activarán cálculos avanzados.
      </div>

      {/* Técnicas Avanzadas (API Calls) */}
      {patientId && (
        <AdvancedTechniquesSidebarSection
          patientId={patientId}
          hasNatalChart={hasNatalChart}
        />
      )}

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

// =====================================
// Advanced Techniques Section Component
// =====================================

interface TechniqueState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

const ADVANCED_TECHNIQUES = [
  { key: 'transits', name: 'Tránsitos', icon: Orbit, endpoint: '/transits/', color: 'blue' },
  { key: 'progressions', name: 'Progresiones', icon: Sparkles, endpoint: '/progressions/', color: 'purple' },
  { key: 'solarReturn', name: 'Retorno Solar', icon: Sun, endpoint: '/solar-return/', color: 'amber' },
  { key: 'harmonics', name: 'Armónicos', icon: Music, endpoint: '/harmonics/?all=true', color: 'indigo' },
  { key: 'fixedStars', name: 'Estrellas Fijas', icon: Star, endpoint: '/fixed-stars/', color: 'yellow' },
  { key: 'arabicParts', name: 'Partes Árabes', icon: Moon, endpoint: '/arabic-parts/', color: 'emerald' },
] as const;

type TechniqueKey = typeof ADVANCED_TECHNIQUES[number]['key'];

function AdvancedTechniquesSidebarSection({ 
  patientId, 
  hasNatalChart 
}: { 
  patientId: string | number; 
  hasNatalChart: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [results, setResults] = useState<Record<TechniqueKey, TechniqueState>>({
    transits: { loading: false, error: null, data: null },
    progressions: { loading: false, error: null, data: null },
    solarReturn: { loading: false, error: null, data: null },
    harmonics: { loading: false, error: null, data: null },
    fixedStars: { loading: false, error: null, data: null },
    arabicParts: { loading: false, error: null, data: null },
  });
  const [activeResult, setActiveResult] = useState<TechniqueKey | null>(null);

  const apiURL = getApiBaseUrl();

  const fetchTechnique = useCallback(async (key: TechniqueKey, endpoint: string) => {
    if (!hasNatalChart) {
      setResults(prev => ({
        ...prev,
        [key]: { loading: false, error: 'Primero calcule la carta natal', data: null }
      }));
      return;
    }

    setResults(prev => ({
      ...prev,
      [key]: { loading: true, error: null, data: null }
    }));

    try {
      const token = getAuthToken();
      if (!token) throw new Error('No hay sesión activa');

      // URL pattern: /api/therapist/patients/{id}/{technique}/
      const url = `${apiURL}/therapist/patients/${patientId}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Error ${response.status}` }));
        throw new Error(errorData.error || errorData.detail || `Error ${response.status}`);
      }

      const data = await response.json();
      setResults(prev => ({
        ...prev,
        [key]: { loading: false, error: null, data }
      }));
      setActiveResult(key);
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [key]: { 
          loading: false, 
          error: err instanceof Error ? err.message : 'Error desconocido', 
          data: null 
        }
      }));
    }
  }, [patientId, apiURL, hasNatalChart]);

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    amber: 'bg-amber-500 hover:bg-amber-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
  };

  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <span className="text-sm font-medium text-gray-900">🚀 Técnicas Avanzadas (API)</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-[11px] text-gray-500 mb-2">
            Cálculos reales con Swiss Ephemeris
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {ADVANCED_TECHNIQUES.map((tech) => {
              const Icon = tech.icon;
              const state = results[tech.key];
              const isLoading = state.loading;
              const hasData = state.data !== null;
              const hasError = state.error !== null;
              
              return (
                <button
                  key={tech.key}
                  type="button"
                  onClick={() => fetchTechnique(tech.key, tech.endpoint)}
                  disabled={isLoading || !hasNatalChart}
                  className={`${colorClasses[tech.color]} text-white text-[11px] px-2 py-2 rounded-md flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  title={!hasNatalChart ? 'Requiere carta natal' : `Calcular ${tech.name}`}
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                  <span className="truncate">{tech.name}</span>
                  {hasData && <span className="text-[9px]">✓</span>}
                  {hasError && <span className="text-[9px]">⚠</span>}
                </button>
              );
            })}
          </div>

          {/* Results Display */}
          {activeResult && results[activeResult].data && (
            <div className="mt-3 p-2 bg-gray-50 rounded-md border border-gray-200 max-h-48 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">
                  {ADVANCED_TECHNIQUES.find(t => t.key === activeResult)?.name}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveResult(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <pre className="text-[10px] text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(results[activeResult].data, null, 2).slice(0, 500)}
                {JSON.stringify(results[activeResult].data, null, 2).length > 500 && '...'}
              </pre>
            </div>
          )}

          {/* Error Display */}
          {ADVANCED_TECHNIQUES.map((tech) => {
            const state = results[tech.key];
            if (!state.error) return null;
            return (
              <div key={`err-${tech.key}`} className="text-[10px] text-red-600 bg-red-50 p-1 rounded">
                {tech.name}: {state.error}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}