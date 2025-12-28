"use client";

import React, { useMemo } from 'react';
import type { AdvancedChartInput } from '../chart/chartTypes';
import { buildPsychProfile } from './psychEngine';

interface Props {
  advanced: AdvancedChartInput;
}

export default function PsychologicalHoroscopeAdvanced({ advanced }: Props) {
  const profile = useMemo(() => buildPsychProfile(advanced), [advanced]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold">Psicológico Avanzado — Lectura simbólica</h3>
      <p className="text-xs text-gray-600">Enfoque junguiano (Liz Greene) — interpretación simbólica, no clínica.</p>

      <div className="mt-4 space-y-4">
        <section>
          <div className="font-medium">Arquetipos Dominantes</div>
          <div className="mt-2 text-sm">
            {profile.dominantArchetypes.map(d => (
              <div key={d.planet} className="mb-1">
                <div className="font-medium">{d.planet}</div>
                <div className="text-xs text-gray-500">{d.reason} — peso {d.weight}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="font-medium">Conflictos Internos (Sombra)</div>
          <div className="mt-2 text-sm">
            {profile.shadowConflicts.length === 0 ? <div className="text-xs text-gray-500">No hay tensiones mayores detectadas.</div> : profile.shadowConflicts.map((s,i)=> (
              <div key={i} className="mb-1"><div className="font-medium">{s.pattern}</div><div className="text-xs text-gray-500">Evidencias: {s.evidence.join(', ')}</div></div>
            ))}
          </div>
        </section>

        <section>
          <div className="font-medium">Individuación — Pistas de integración</div>
          <div className="mt-2 text-sm">
            {profile.individuationKeys.length === 0 ? <div className="text-xs text-gray-500">No hay claves de individuación detectables.</div> : profile.individuationKeys.map((k,i)=> (
              <div key={i} className="mb-1"><div className="font-medium">{k.theme}</div><div className="text-xs text-gray-500">Evidencias: {k.evidence.join(', ')}</div></div>
            ))}
          </div>
        </section>

        <section>
          <div className="font-medium">Los Siete Pecados — arquetipos simbólicos</div>
          <div className="mt-2 text-sm">
            {profile.sevenSinsArchetypes.length === 0 ? <div className="text-xs text-gray-500">No hay arquetipos extremos detectados.</div> : profile.sevenSinsArchetypes.map((s,i)=>(
              <div key={i}><div className="font-medium">{s.archetype}</div><div className="text-xs text-gray-500">Evidencias: {s.evidence.join(', ')}</div></div>
            ))}
          </div>
        </section>

        <div className="mt-4 text-xs text-gray-500">Disclaimer: Lectura simbólica y orientativa. No constituye diagnóstico.</div>
      </div>
    </div>
  );
}
