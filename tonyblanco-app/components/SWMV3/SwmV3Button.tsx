"use client";

import { useEffect, useState } from 'react';
import ConsentModal from './ConsentModal';
import ResultPanel from './ResultPanel';
import runMockInterpretation from './MockEngine';

function isFlagEnabled(): boolean {
  try {
    if (typeof window !== 'undefined' && (window as any).__SWM_V3_ENABLED !== undefined) {
      return Boolean((window as any).__SWM_V3_ENABLED);
    }
    return process.env.NEXT_PUBLIC_SWM_V3_ENABLED === 'true';
  } catch (e) {
    return false;
  }
}

export default function SwmV3Button() {
  const [enabled, setEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [consented, setConsented] = useState(false);
  const [reading, setReading] = useState<any | null>(null);

  useEffect(() => setEnabled(isFlagEnabled()), []);

  if (!enabled) return null; // feature-flag gated: do not render when disabled

  const handleConfirm = (mode: any) => {
    // Phase 2 only allows no_store
    setConsented(true);
    setShowModal(false);
  };

  const handleInterpret = () => {
    // Deterministic mock interpretation; always local state only
    const r = runMockInterpretation();
    setReading(r);
  };

  return (
    <div className="mt-4 px-3">
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={!consented}
        className={`w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          consented ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
        }`}
      >
        Interpretar tirada (educativo)
      </button>

      <div className="mt-2">
        <button
          type="button"
          onClick={handleInterpret}
          disabled={!consented}
          className="text-xs text-gray-500"
        >
          Ejecutar simulación (mock)
        </button>
      </div>

      <ConsentModal open={showModal} onClose={() => setShowModal(false)} onConfirm={handleConfirm} />

      {reading && <ResultPanel reading={reading} onClose={() => setReading(null)} />}
    </div>
  );
}
