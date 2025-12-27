'use client';

import { useMemo } from 'react';
import { AstrologyMode, useAstrologyMode } from './AstrologyModeContext';

const MODE_LABEL: Record<AstrologyMode, string> = {
  TRAINING: 'Training',
  RESEARCH: 'Research',
  SANDBOX: 'Sandbox (simulado)',
};

const MODE_DESC: Record<AstrologyMode, string> = {
  TRAINING: 'Guía pedagógica, preguntas y observables.',
  RESEARCH: 'Exploración de patrones (dataset marcado research/sim).',
  SANDBOX: 'Simulación educativa con scoring didáctico. No personas reales.',
};

export default function AstrologyModeSwitch({ compact = false }: { compact?: boolean }) {
  const { mode, setMode } = useAstrologyMode();

  const badgeClass = useMemo(() => {
    if (mode === 'SANDBOX') return 'bg-amber-100 text-amber-900 border border-amber-300';
    if (mode === 'RESEARCH') return 'bg-slate-100 text-slate-900 border border-slate-300';
    return 'bg-emerald-100 text-emerald-900 border border-emerald-300';
  }, [mode]);

  const handleChange = (value: AstrologyMode) => {
    setMode(value);
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${badgeClass}`}>
          {MODE_LABEL[mode]}
        </span>
        {!compact && (
          <div className="text-xs text-gray-600">
            <p className="font-semibold text-gray-900">Modo activo (solo Astrología)</p>
            <p>{MODE_DESC[mode]}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-800">
        <label className="flex items-center gap-1">
          <input type="radio" name="astro-mode" checked={mode === 'TRAINING'} onChange={() => handleChange('TRAINING')} />
          Training
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="astro-mode" checked={mode === 'RESEARCH'} onChange={() => handleChange('RESEARCH')} />
          Research
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="astro-mode" checked={mode === 'SANDBOX'} onChange={() => handleChange('SANDBOX')} />
          Sandbox (sim)
        </label>
      </div>
    </div>
  );
}
