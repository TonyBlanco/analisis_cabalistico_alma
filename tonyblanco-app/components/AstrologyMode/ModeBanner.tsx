'use client';

import { useState } from 'react';
import { useAstrologyMode } from './AstrologyModeContext';
import { logEvent } from '@/components/AstrologyStudy/eventLogger';

export default function ModeBanner({
  sandboxBlocked,
  sandboxReason,
}: {
  sandboxBlocked?: boolean;
  sandboxReason?: string;
}) {
  const { mode } = useAstrologyMode();
  const [confirmedSandbox, setConfirmedSandbox] = useState(false);

  if (mode === 'SANDBOX') {
    if (sandboxBlocked) {
      return (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sandbox no disponible con datos reales. {sandboxReason || 'Usa dataset simulado o cambia a Training/Research.'}
        </div>
      );
    }
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Simulación educativa. No predicción real.</p>
          {!confirmedSandbox && (
            <button
              type="button"
              className="text-xs underline font-semibold"
              onClick={() => {
                setConfirmedSandbox(true);
                logEvent('SANDBOX_ENTER_CONFIRM', { accepted: true });
              }}
            >
              Confirmar uso simulado
            </button>
          )}
        </div>
        <p className="text-xs text-amber-800">Sin scoring clínico. Sin datos reales. Resultados solo didácticos.</p>
      </div>
    );
  }

  if (mode === 'RESEARCH') {
    return (
      <div className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900">
        Exploración de patrones (no clínico). Dataset research/simulado únicamente.
      </div>
    );
  }

  // TRAINING
  return (
    <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      Guía pedagógica y observacional. Sin narrativa interpretativa ni predicción.
    </div>
  );
}
