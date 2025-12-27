'use client';

import { useState } from 'react';
import AstrologyHolisticDisclaimer from '@/components/AstrologyWorkspace/AstrologyHolisticDisclaimer';

const OBSERVE = [
  '¿Qué planetas están angulares?',
  '¿Hay concentración por elemento?',
  '¿Qué casas dominan?',
  '¿Qué nodos/ángulos están enfatizados?',
];

const COMPARE = [
  '¿Qué cambia entre A y B?',
  '¿Qué permanece estable?',
  '¿Qué capa (natal/técnica) explica mejor la diferencia visual?',
];

const QUESTIONS = [
  '¿Qué configuraciones llaman la atención?',
  '¿Dónde hay mayor tensión estructural?',
  '¿Qué patrones se repiten en distintos casos?',
];

export default function TrainingModePanel() {
  const [enabled, setEnabled] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Modo Training (pedagógico)</p>
          <h2 className="text-xl font-semibold text-gray-900">Guías y checklist (no interpretativo)</h2>
          <p className="text-xs text-gray-600 mt-1">Preguntas y observaciones; no hay narrativa ni recomendaciones.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-800">
          <input type="checkbox" checked={enabled} onChange={() => setEnabled((v) => !v)} />
          Activar Modo Training
        </label>
      </div>
      <AstrologyHolisticDisclaimer />

      {enabled && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Observa</p>
            <ul className="list-disc pl-4 text-sm text-gray-800 space-y-1">
              {OBSERVE.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Compara</p>
            <ul className="list-disc pl-4 text-sm text-gray-800 space-y-1">
              {COMPARE.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Preguntas guía</p>
            <ul className="list-disc pl-4 text-sm text-gray-800 space-y-1">
              {QUESTIONS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!enabled && (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Activa el modo Training para mostrar checklist y preguntas pedagógicas. No altera cálculos ni visualización base.
        </div>
      )}
    </section>
  );
}
