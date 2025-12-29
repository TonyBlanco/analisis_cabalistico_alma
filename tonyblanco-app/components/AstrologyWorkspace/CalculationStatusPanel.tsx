import React, { useState } from 'react';

type Props = {
  overlays: { natal: boolean; transits: boolean; solarReturn: boolean; progressions: boolean };
  activeLayers: Set<string>;
  symbolicLayers?: { natal: boolean; transits: boolean; progressions: boolean; solarArc: boolean; solarReturn: boolean; lunarReturn: boolean };
  houseSystem: string;
  zodiacType: string;
  canRecalculate: boolean; // whether UI has ability to trigger recalculation (we will NOT trigger)
};

type DotType = 'active' | 'available' | 'locked' | 'symbolic';

const Dot: React.FC<{ type: DotType }> = ({ type }) => {
  if (type === 'active') return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2" />;
  if (type === 'symbolic') return <span className="inline-block w-3 h-3 rounded-full bg-sky-500 mr-2 opacity-70" />;
  if (type === 'available') return <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2" />;
  return <span className="inline-block w-3 h-3 rounded-full bg-rose-400 mr-2 opacity-70" />;
};

export default function CalculationStatusPanel({ overlays, activeLayers, symbolicLayers, houseSystem, zodiacType, canRecalculate }: Props) {
  const [helper, setHelper] = useState<string | null>(null);
  const symbolicTooltip = 'Capa simbólica activa. No corresponde a un cálculo astronómico real.';
  const annualSymbolicTooltip = 'Capa anual/mensual activa (lectura simbólica) — sin recalcular carta base.';

  const handleClickWouldRecalc = (label: string, isLocked: boolean) => {
    if (isLocked) {
      setHelper('🔒 Este cálculo requiere recalcular la carta. Disponible en fases avanzadas.');
    } else {
      setHelper(`⚪ ${label} está disponible pero la recalculación no está habilitada desde esta vista.`);
    }
    window.setTimeout(() => setHelper(null), 6000);
  };

  const handleClickSymbolicInfo = (message = symbolicTooltip) => {
    setHelper(message);
    window.setTimeout(() => setHelper(null), 6000);
  };

  const isSymbolicActive = (key: keyof NonNullable<Props['symbolicLayers']>) => {
    if (!symbolicLayers) return false;
    if (key === 'natal') return Boolean(symbolicLayers.natal);
    return activeLayers.has(key) && Boolean(symbolicLayers[key]);
  };

  const calcState = (key: string, overlayFlag: boolean) => {
    if (key === 'natal') {
      if (overlayFlag) return 'active' as const;
      if (isSymbolicActive('natal')) return 'symbolic' as const;
      return 'available' as const;
    }

    const selected = activeLayers.has(key);
    const symbolicActive =
      key === 'transits'
        ? isSymbolicActive('transits')
        : key === 'progressions'
          ? isSymbolicActive('progressions')
          : key === 'solarArc'
            ? isSymbolicActive('solarArc')
            : key === 'solarReturnSymbolic'
              ? isSymbolicActive('solarReturn')
              : key === 'lunarReturnSymbolic'
                ? isSymbolicActive('lunarReturn')
              : false;

    if (selected && overlayFlag) return 'active' as const;
    if (symbolicActive) return 'symbolic' as const;
    if (overlayFlag) return 'available' as const;

    if (key === 'transits' || key === 'progressions' || key === 'solarArc' || key === 'solarReturnSymbolic' || key === 'lunarReturnSymbolic') return 'available' as const;
    return canRecalculate ? 'available' as const : 'locked' as const;
  };

  const systems = ['Placidus','Koch','Campanus','Regiomontanus','Whole Sign'];
  const zodiacs = [{k:'tropical', label:'Tropical'},{k:'sidereal', label:'Sidéreo (Lahiri)'},{k:'draconic', label:'Dracónico'}];

  return (
    <div className="mb-4 p-3 border rounded-md bg-white shadow-sm text-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-gray-700">Estado de cálculos — lectura simbólica</div>
          <div className="text-[13px] text-gray-500">Indicador rápido de qué cálculos está viendo el consultante</div>
        </div>
        <div className="text-xs text-gray-400">Modo: <strong className="text-gray-700">Solo lectura</strong></div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Cálculos</div>
          <ul className="text-sm space-y-2">
            <li className="flex items-center">
              <Dot type={calcState('natal', overlays.natal)} />
              <span className="flex-1">Carta Natal</span>
              <span className="text-xs text-gray-400">(base)</span>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickSymbolicInfo()} className="flex items-center w-full text-left" title={isSymbolicActive('transits') ? symbolicTooltip : undefined}>
                <Dot type={calcState('transits', overlays.transits)} />
                <span className="flex-1">Tránsitos</span>
                <span className="text-xs text-gray-400">{isSymbolicActive('transits') ? 'Activo (lectura simbólica)' : (overlays.transits ? '' : 'pendiente')}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickSymbolicInfo()} className="flex items-center w-full text-left" title={isSymbolicActive('progressions') ? symbolicTooltip : undefined}>
                <Dot type={calcState('progressions', overlays.progressions)} />
                <span className="flex-1">Progresiones Secundarias</span>
                <span className="text-xs text-gray-400">{isSymbolicActive('progressions') ? 'Activo (lectura simbólica)' : (overlays.progressions ? '' : 'pendiente')}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickSymbolicInfo()} className="flex items-center w-full text-left" title={isSymbolicActive('solarArc') ? symbolicTooltip : undefined}>
                <Dot type={calcState('solarArc', false)} />
                <span className="flex-1">Arco Solar</span>
                <span className="text-xs text-gray-400">{isSymbolicActive('solarArc') ? 'Activo (lectura simbólica)' : 'pendiente'}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button
                onClick={() => (isSymbolicActive('solarReturn') ? handleClickSymbolicInfo(annualSymbolicTooltip) : handleClickWouldRecalc('Retorno Solar', !overlays.solarReturn))}
                className="flex items-center w-full text-left"
                title={isSymbolicActive('solarReturn') ? annualSymbolicTooltip : undefined}
              >
                <Dot type={calcState('solarReturnSymbolic', overlays.solarReturn)} />
                <span className="flex-1">Retorno Solar</span>
                <span className="text-xs text-gray-400">{isSymbolicActive('solarReturn') ? 'Activo (lectura simbólica)' : (overlays.solarReturn ? '' : '(requiere recalcular)')}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickSymbolicInfo(annualSymbolicTooltip)} className="flex items-center w-full text-left" title={isSymbolicActive('lunarReturn') ? annualSymbolicTooltip : undefined}>
                <Dot type={calcState('lunarReturnSymbolic', false)} />
                <span className="flex-1">Retorno Lunar</span>
                <span className="text-xs text-gray-400">{isSymbolicActive('lunarReturn') ? 'Activo (lectura simbólica)' : 'pendiente'}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickWouldRecalc('Armónicos', true)} className="flex items-center w-full text-left">
                <Dot type={canRecalculate ? 'available' : 'locked'} />
                <span className="flex-1">Armónicos</span>
                <span className="text-xs text-gray-400">(opcional)</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickWouldRecalc('Persona Charts', true)} className="flex items-center w-full text-left">
                <Dot type={canRecalculate ? 'available' : 'locked'} />
                <span className="flex-1">Persona Charts</span>
                <span className="text-xs text-gray-400">(opcional)</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickWouldRecalc('Relocación', true)} className="flex items-center w-full text-left">
                <Dot type={canRecalculate ? 'available' : 'locked'} />
                <span className="flex-1">Relocación</span>
                <span className="text-xs text-gray-400">(opcional)</span>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Sistemas visibles</div>
          <div className="text-[13px] text-gray-700 mb-2">Sistema de Casas</div>
          <ul className="text-sm space-y-2 mb-3">
            {systems.map((s) => {
              const isActive = s.toLowerCase().startsWith(houseSystem.toLowerCase());
              const locked = !canRecalculate && !isActive;
              return (
                <li key={s} className="flex items-center">
                  <button onClick={() => handleClickWouldRecalc(s, locked)} className="flex items-center w-full text-left">
                    <Dot type={isActive ? 'active' : (locked ? 'locked' : 'available')} />
                    <span className="flex-1">{s}</span>
                    {isActive ? <span className="text-xs text-gray-400">(activo)</span> : <span className="text-xs text-gray-400">{locked ? '(bloqueado)' : ''}</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="text-[13px] text-gray-700 mb-2">Zodiaco</div>
          <ul className="text-sm space-y-2">
            {zodiacs.map(z => {
              const isActive = z.k === zodiacType || (z.k === 'tropical' && !zodiacType);
              const locked = !canRecalculate && !isActive;
              return (
                <li key={z.k} className="flex items-center">
                  <button onClick={() => handleClickWouldRecalc(z.label, locked)} className="flex items-center w-full text-left">
                    <Dot type={isActive ? 'active' : (locked ? 'locked' : 'available')} />
                    <span className="flex-1">{z.label}</span>
                    {isActive ? <span className="text-xs text-gray-400">(activo)</span> : <span className="text-xs text-gray-400">{locked ? '(bloqueado)' : ''}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {helper ? (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 text-xs text-gray-700 rounded">{helper}</div>
      ) : null}
    </div>
  );
}
