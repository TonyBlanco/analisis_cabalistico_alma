import React, { useState } from 'react';

type Props = {
  overlays: { natal: boolean; transits: boolean; solarReturn: boolean; progressions: boolean };
  activeLayers: Set<string>;
  houseSystem: string;
  zodiacType: string;
  canRecalculate: boolean; // whether UI has ability to trigger recalculation (we will NOT trigger)
};

const Dot: React.FC<{ type: 'active' | 'available' | 'locked'; label?: string }> = ({ type }) => {
  if (type === 'active') return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2" />;
  if (type === 'available') return <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2" />;
  return <span className="inline-block w-3 h-3 text-xs mr-2">🔒</span>;
};

export default function CalculationStatusPanel({ overlays, activeLayers, houseSystem, zodiacType, canRecalculate }: Props) {
  const [helper, setHelper] = useState<string | null>(null);

  const handleClickWouldRecalc = (label: string, isLocked: boolean) => {
    if (isLocked) {
      setHelper('🔒 Este cálculo requiere recalcular la carta. Disponible en fases avanzadas.');
    } else {
      setHelper(`⚪ ${label} está disponible pero la recalculación no está habilitada desde esta vista.`);
    }
    window.setTimeout(() => setHelper(null), 6000);
  };

  const calcState = (key: string, overlayFlag: boolean) => {
    const active = activeLayers.has(key) && overlayFlag;
    if (active) return 'active' as const;
    if (!overlayFlag) return canRecalculate ? 'available' as const : 'locked' as const;
    return 'available' as const;
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
              <button onClick={() => handleClickWouldRecalc('Tránsitos', !overlays.transits)} className="flex items-center w-full text-left">
                <Dot type={calcState('transits', overlays.transits)} />
                <span className="flex-1">Tránsitos</span>
                <span className="text-xs text-gray-400">{overlays.transits ? '' : '(requiere recalcular)'}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickWouldRecalc('Progresiones Secundarias', !overlays.progressions)} className="flex items-center w-full text-left">
                <Dot type={calcState('progressions', overlays.progressions)} />
                <span className="flex-1">Progresiones Secundarias</span>
                <span className="text-xs text-gray-400">{overlays.progressions ? '' : '(requiere recalcular)'}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickWouldRecalc('Retorno Solar', !overlays.solarReturn)} className="flex items-center w-full text-left">
                <Dot type={calcState('solarReturn', overlays.solarReturn)} />
                <span className="flex-1">Retorno Solar</span>
                <span className="text-xs text-gray-400">{overlays.solarReturn ? '' : '(requiere recalcular)'}</span>
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
