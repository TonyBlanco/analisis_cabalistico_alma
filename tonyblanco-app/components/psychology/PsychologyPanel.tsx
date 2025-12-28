'use client';

import React, { useMemo, useState } from 'react';
import { PsychAstroInput } from '../psychology/types';
import { generatePsychAstroOutline } from '../psychology/PsychologicalAstrologyEngine';
import { mapCrossInsights } from '../psychology/HolisticCrossMapper';
import ReportBuilder from './ReportBuilder';

interface PsychologyPanelProps {
  input: PsychAstroInput;
}

export default function PsychologyPanel({ input }: PsychologyPanelProps) {
  const generated = useMemo(() => generatePsychAstroOutline(input), [input]);
  const [outline, setOutline] = useState(generated);
  const cross = useMemo(() => mapCrossInsights({ psych_astrology_outline: outline, psychological_tests_results: input.psychological_tests_summary }), [outline, input.psychological_tests_summary]);

  function handleExport() {
    // Attempt a high-quality print (vector-preserving) by opening a print window
    ReportBuilder.openPrintableReport({ outline, natalSnapshot: input.natal_chart_snapshot });
  }

  return (
    <div className="p-4 border rounded bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Interpretación Psicológica Asistida</h3>
        <div>
          <button onClick={handleExport} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Exportar (PDF)</button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <strong>Identidad central:</strong>
          <p className="text-sm text-gray-700">{outline.core_identity}</p>
        </div>

        <div>
          <strong>Arquetipos dominantes:</strong>
          <ul className="list-disc pl-5">
            {outline.dominant_archetypes.map((a, i) => (<li key={i}>{a}</li>))}
          </ul>
        </div>

        <div>
          <strong>Sombra y tensiones:</strong>
          <ul className="list-disc pl-5">
            {outline.shadow_dynamics.map((s, i) => (<li key={i}>{s}</li>))}
          </ul>
        </div>

        <div>
          <strong>Camino de individuación:</strong>
          <ul className="list-disc pl-5">
            {outline.individuation_path.map((s, i) => (<li key={i}>{s}</li>))}
          </ul>
        </div>

        {input.psychological_tests_summary ? (
          <div className="pt-2 border-t">
            <h4 className="font-semibold">Cruce Holístico (tests)</h4>
            <div className="text-sm text-gray-700">
              <strong>Resonancias simbólicas:</strong>
              <ul className="list-disc pl-5">
                {cross.symbolic_resonances.map((c, i) => (<li key={i}><strong>{c.label}:</strong> {c.description}</li>))}
              </ul>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
