import React, { useState } from 'react';

type Props = {
  overlays: { natal: boolean; transits: boolean; solarReturn: boolean; progressions: boolean };
  activeLayers: Set<string>;
  symbolicLayers?: {
    natal: boolean;
    transits: boolean;
    progressions: boolean;
    solarArc: boolean;
    solarReturn: boolean;
    lunarReturn: boolean;
    planetary: boolean;
    harmonics: boolean;
    persona: boolean;
    relocation: boolean;
    mathPoints: boolean;
  };
  harmonicMode?: 'off' | 'h5' | 'h7' | 'h9' | 'h11' | 'h13' | 'h16';
  personaMode?: 'off' | 'social' | 'professional' | 'intimate';
  relocationMode?: 'off' | 'home' | 'work' | 'travel' | 'abroad';
  advancedObjects?: { nodes: boolean; fortune: boolean; symbolicPoints: boolean };
  fixedStars?: { primary: boolean; secondary: boolean };
  relationshipMode?: 'off' | 'couple' | 'family' | 'work' | 'social';
  relationshipRole?: 'active' | 'reactive';
  developmentStage?: 'off' | 'early_childhood' | 'childhood_early' | 'childhood_middle' | 'adolescence' | 'young_adult';
  houseSystem: string;
  zodiacType: string;
  canRecalculate: boolean; // whether UI has ability to trigger recalculation (we will NOT trigger)
  secondaryLayerKey?: string | null;
  comparisonEnabled?: boolean;
  comparisonAspectsEnabled?: boolean;
};

type DotType = 'active' | 'available' | 'locked' | 'symbolic';

const Dot: React.FC<{ type: DotType }> = ({ type }) => {
  if (type === 'active') return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2" />;
  if (type === 'symbolic') return <span className="inline-block w-3 h-3 rounded-full bg-sky-500 mr-2 opacity-70" />;
  if (type === 'available') return <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2" />;
  return <span className="inline-block w-3 h-3 rounded-full bg-rose-400 mr-2 opacity-70" />;
};

export default function CalculationStatusPanel({ overlays, activeLayers, symbolicLayers, harmonicMode = 'off', personaMode = 'off', relocationMode = 'off', advancedObjects = { nodes: false, fortune: false, symbolicPoints: false }, fixedStars = { primary: false, secondary: false }, relationshipMode = 'off', relationshipRole = 'active', developmentStage = 'off', houseSystem, zodiacType, canRecalculate, secondaryLayerKey = null, comparisonEnabled = false, comparisonAspectsEnabled = false }: Props) {
  const [helper, setHelper] = useState<string | null>(null);
  const symbolicTooltip = 'Capa simbólica activa. No corresponde a un cálculo astronómico real.';
  const annualSymbolicTooltip = 'Capa anual/mensual activa (lectura simbólica) — sin recalcular carta base.';
  const isSecondary = (key: string) => Boolean(secondaryLayerKey && secondaryLayerKey === key);

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
            : key === 'return_solar'
              ? isSymbolicActive('solarReturn')
              : key === 'return_lunar'
                ? isSymbolicActive('lunarReturn')
                : key === 'planetary'
                  ? isSymbolicActive('planetary')
                  : key === 'harmonics'
                    ? isSymbolicActive('harmonics')
                    : key === 'persona'
                      ? isSymbolicActive('persona')
                      : key === 'relocation'
                        ? isSymbolicActive('relocation')
                        : key === 'mathPoints'
                          ? isSymbolicActive('mathPoints')
                : false;

    if (selected && overlayFlag) return 'active' as const;
    if (symbolicActive) return 'symbolic' as const;
    if (overlayFlag) return 'available' as const;

    if (key === 'transits' || key === 'progressions' || key === 'solarArc' || key === 'return_solar' || key === 'return_lunar' || key === 'planetary' || key === 'harmonics' || key === 'persona' || key === 'relocation' || key === 'mathPoints') return 'available' as const;
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
              <button onClick={() => handleClickSymbolicInfo('Doble rueda simbólica de comparación (solo visual).')} className="flex items-center w-full text-left" title={comparisonEnabled ? 'Doble rueda simbólica de comparación (solo visual).' : undefined}>
                <Dot type={comparisonEnabled ? 'symbolic' : 'available'} />
                <span className="flex-1">Doble Rueda</span>
                <span className="text-xs text-gray-400">{comparisonEnabled ? 'Activo (lectura simbólica)' : 'pendiente'}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickSymbolicInfo('Aspecto simbólico (no matemático).')} className="flex items-center w-full text-left" title={comparisonAspectsEnabled ? 'Aspecto simbólico (no matemático).' : undefined}>
                <Dot type={comparisonAspectsEnabled ? 'symbolic' : 'available'} />
                <span className="flex-1">Aspectos cruzados</span>
                <span className="text-xs text-gray-400">{comparisonAspectsEnabled ? 'Activo (simbólico)' : 'pendiente'}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickSymbolicInfo()} className="flex items-center w-full text-left" title={isSymbolicActive('transits') ? symbolicTooltip : undefined}>
                <Dot type={calcState('transits', overlays.transits)} />
                <span className="flex-1">Tránsitos</span>
                <span className="text-xs text-gray-400">{isSecondary('transits') ? 'secundaria' : (isSymbolicActive('transits') ? 'Activo (lectura simbólica)' : (overlays.transits ? '' : 'pendiente'))}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickSymbolicInfo()} className="flex items-center w-full text-left" title={isSymbolicActive('progressions') ? symbolicTooltip : undefined}>
                <Dot type={calcState('progressions', overlays.progressions)} />
                <span className="flex-1">Progresiones Secundarias</span>
                <span className="text-xs text-gray-400">{isSecondary('progressions') ? 'secundaria' : (isSymbolicActive('progressions') ? 'Activo (lectura simbólica)' : (overlays.progressions ? '' : 'pendiente'))}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickSymbolicInfo()} className="flex items-center w-full text-left" title={isSymbolicActive('solarArc') ? symbolicTooltip : undefined}>
                <Dot type={calcState('solarArc', false)} />
                <span className="flex-1">Arco Solar</span>
                <span className="text-xs text-gray-400">{isSecondary('solarArc') ? 'secundaria' : (isSymbolicActive('solarArc') ? 'Activo (lectura simbólica)' : 'pendiente')}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button
                onClick={() => (isSymbolicActive('solarReturn') ? handleClickSymbolicInfo(annualSymbolicTooltip) : handleClickWouldRecalc('Retorno Solar', !overlays.solarReturn))}
                className="flex items-center w-full text-left"
                title={isSymbolicActive('solarReturn') ? annualSymbolicTooltip : undefined}
              >
                <Dot type={calcState('return_solar', overlays.solarReturn)} />
                <span className="flex-1">Retorno Solar</span>
                <span className="text-xs text-gray-400">{isSecondary('return_solar') ? 'secundaria' : (isSymbolicActive('solarReturn') ? 'Activo (lectura simbólica)' : (overlays.solarReturn ? '' : '(requiere recalcular)'))}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickSymbolicInfo(annualSymbolicTooltip)} className="flex items-center w-full text-left" title={isSymbolicActive('lunarReturn') ? annualSymbolicTooltip : undefined}>
                <Dot type={calcState('return_lunar', false)} />
                <span className="flex-1">Retorno Lunar</span>
                <span className="text-xs text-gray-400">{isSecondary('return_lunar') ? 'secundaria' : (isSymbolicActive('lunarReturn') ? 'Activo (lectura simbólica)' : 'pendiente')}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button onClick={() => handleClickSymbolicInfo('Capa planetaria simbólica activa. No predictiva.')} className="flex items-center w-full text-left" title={isSymbolicActive('planetary') ? 'Capa planetaria simbólica activa. No predictiva.' : undefined}>
                <Dot type={calcState('planetary', false)} />
                <span className="flex-1">Planetarios</span>
                <span className="text-xs text-gray-400">{isSymbolicActive('planetary') ? 'Activo (lectura simbólica)' : 'pendiente'}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button
                onClick={() => handleClickSymbolicInfo('Armónicos (modo simbólico): representan patrones de resonancia psicológica. No son cálculos astronómicos.')}
                className="flex items-center w-full text-left"
                title={isSymbolicActive('harmonics') ? 'Armónicos (modo simbólico): representan patrones de resonancia psicológica. No son cálculos astronómicos.' : undefined}
              >
                <Dot type={calcState('harmonics', false)} />
                <span className="flex-1">Armónicos</span>
                <span className="text-xs text-gray-400">
                  {isSymbolicActive('harmonics')
                    ? (harmonicMode !== 'off' ? `Activo (lectura simbólica) · ${harmonicMode}` : 'Activo (lectura simbólica)')
                    : 'pendiente'}
                </span>
              </button>
            </li>

            <li className="flex items-center">
              <button
                onClick={() => handleClickSymbolicInfo('Persona Chart (simbólico): representa la identidad que el individuo muestra o utiliza en un contexto específico. No es una carta astronómica.')}
                className="flex items-center w-full text-left"
                title={isSymbolicActive('persona') ? 'Persona Chart (simbólico): representa la identidad que el individuo muestra o utiliza en un contexto específico. No es una carta astronómica.' : undefined}
              >
                <Dot type={calcState('persona', false)} />
                <span className="flex-1">Persona Chart</span>
                <span className="text-xs text-gray-400">
                  {isSymbolicActive('persona')
                    ? (personaMode !== 'off' ? `Activo (lectura simbólica) · ${personaMode}` : 'Activo (lectura simbólica)')
                    : 'pendiente'}
                </span>
              </button>
            </li>

            <li className="flex items-center">
              <button
                onClick={() => handleClickSymbolicInfo('Relocación simbólica: describe cómo el entorno influye en la experiencia vital. No es una carta astronómica relocada.')}
                className="flex items-center w-full text-left"
                title={isSymbolicActive('relocation') ? 'Relocación simbólica: describe cómo el entorno influye en la experiencia vital. No es una carta astronómica relocada.' : undefined}
              >
                <Dot type={calcState('relocation', false)} />
                <span className="flex-1">Relocación</span>
                <span className="text-xs text-gray-400">
                  {isSymbolicActive('relocation')
                    ? (() => {
                      const label =
                        relocationMode === 'home' ? 'Hogar' :
                          relocationMode === 'work' ? 'Trabajo' :
                            relocationMode === 'travel' ? 'Viaje' :
                              relocationMode === 'abroad' ? 'Extranjero' :
                                null;
                      return label ? `Activo (lectura simbólica) · ${label}` : 'Activo (lectura simbólica)';
                    })()
                    : 'pendiente'}
                </span>
              </button>
            </li>

            <li className="flex items-center">
              <button
                onClick={() => handleClickSymbolicInfo('Objetos avanzados (modo simbólico): marcadores de proceso psicológico. No son cálculos astronómicos.')}
                className="flex items-center w-full text-left"
                title={isSymbolicActive('mathPoints') ? 'Objetos avanzados (modo simbólico): marcadores de proceso psicológico. No son cálculos astronómicos.' : undefined}
              >
                <Dot type={calcState('mathPoints', false)} />
                <span className="flex-1">Objetos avanzados</span>
                <span className="text-xs text-gray-400">
                  {isSymbolicActive('mathPoints')
                    ? (() => {
                      const parts: string[] = [];
                      if (advancedObjects.nodes) parts.push('Nodos');
                      if (advancedObjects.fortune) parts.push('Fortuna');
                      if (advancedObjects.symbolicPoints) parts.push('Puntos');
                      return parts.length > 0 ? `Activo (lectura simbólica) · ${parts.join(' / ')}` : 'Activo (lectura simbólica)';
                    })()
                    : 'pendiente'}
                </span>
              </button>
            </li>

            <li className="flex items-center">
              <button
                onClick={() => handleClickSymbolicInfo('Estrellas fijas (modo simbólico): arquetipos culturales utilizados como referencias psicológicas. No son predicciones.')}
                className="flex items-center w-full text-left"
                title={fixedStars.primary ? 'Estrellas fijas (modo simbólico): arquetipos culturales utilizados como referencias psicológicas. No son predicciones.' : undefined}
              >
                <Dot type={fixedStars.primary ? 'symbolic' : 'available'} />
                <span className="flex-1">Estrellas fijas</span>
                <span className="text-xs text-gray-400">{fixedStars.primary ? 'Activo (lectura simbólica)' : 'pendiente'}</span>
              </button>
            </li>

            <li className="flex items-center">
              <button
                onClick={() => handleClickSymbolicInfo('Relaciones (modo simbólico): muestra dinámicas psicológicas del vínculo. No evalúa compatibilidad ni predice resultados.')}
                className="flex items-center w-full text-left"
                title={relationshipMode !== 'off' ? 'Relaciones (modo simbólico): dinámicas psicológicas del vínculo. No compatibilidad ni predicción.' : undefined}
              >
                <Dot type={relationshipMode !== 'off' ? 'symbolic' : 'available'} />
                <span className="flex-1">Relaciones</span>
                <span className="text-xs text-gray-400">
                  {relationshipMode !== 'off'
                    ? (() => {
                      const label =
                        relationshipMode === 'couple' ? 'Pareja' :
                          relationshipMode === 'family' ? 'Familia' :
                            relationshipMode === 'work' ? 'Trabajo' :
                              relationshipMode === 'social' ? 'Social' :
                                'Activo';
                      const role = relationshipRole === 'reactive' ? 'Reactivo' : 'Activo';
                      return `Activo (lectura simbólica) · ${label} · Rol: ${role}`;
                    })()
                    : 'pendiente'}
                </span>
              </button>
            </li>

            <li className="flex items-center">
              <button
                onClick={() => handleClickSymbolicInfo('Desarrollo (modo simbólico): acompaña ritmos de crecimiento y aprendizaje. No diagnostica ni predice.')}
                className="flex items-center w-full text-left"
                title={developmentStage !== 'off' ? 'Desarrollo (modo simbólico): acompaña ritmos de crecimiento y aprendizaje. No diagnostica ni predice.' : undefined}
              >
                <Dot type={developmentStage !== 'off' ? 'symbolic' : 'available'} />
                <span className="flex-1">Infancia &amp; Desarrollo</span>
                <span className="text-xs text-gray-400">
                  {developmentStage !== 'off'
                    ? (() => {
                      const label =
                        developmentStage === 'early_childhood' ? 'Primera infancia (0–3)' :
                          developmentStage === 'childhood_early' ? 'Infancia temprana (4–7)' :
                            developmentStage === 'childhood_middle' ? 'Infancia media (8–11)' :
                              developmentStage === 'adolescence' ? 'Adolescencia (12–18)' :
                                developmentStage === 'young_adult' ? 'Juventud temprana (18–25)' :
                                  'Activo';
                      return `Activo (lectura simbólica) · ${label}`;
                    })()
                    : 'pendiente'}
                </span>
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
