"use client";

import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (mode: 'no_store' | 'store_anonymized' | 'store_with_consent') => void;
};

export default function ConsentModal({ open, onClose, onConfirm }: Props) {
  const [checked, setChecked] = useState(false);
  const [mode, setMode] = useState<'no_store' | 'store_anonymized' | 'store_with_consent'>('no_store');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded bg-white p-6 shadow">
        <h3 className="text-lg font-semibold">Consentimiento — Lectura educativa</h3>
        <p className="mt-2 text-sm text-gray-600">
          Esta función genera una lectura educativa y simbólica. No ofrece diagnóstico ni consejos clínicos.
        </p>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span className="text-sm">Entiendo y acepto recibir una lectura educativa (opt-in)</span>
          </label>

          <fieldset className="mt-2">
            <legend className="text-sm font-medium">Modo de manejo de datos</legend>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="swm_mode"
                  value="no_store"
                  checked={mode === 'no_store'}
                  onChange={() => setMode('no_store')}
                />
                <span className="text-sm">No almacenar (Phase 2 — activo)</span>
              </label>
              <label className="flex items-center gap-2 text-gray-400" aria-disabled>
                <input type="radio" disabled />
                <span className="text-sm">Almacenar anonimizado (Phase 3)</span>
              </label>
              <label className="flex items-center gap-2 text-gray-400" aria-disabled>
                <input type="radio" disabled />
                <span className="text-sm">Almacenar con consentimiento (Phase 3)</span>
              </label>
            </div>
          </fieldset>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="px-3 py-2 text-sm" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium rounded ${checked ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => checked && onConfirm(mode)}
            disabled={!checked}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
