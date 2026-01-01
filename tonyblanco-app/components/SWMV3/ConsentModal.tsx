"use client";

import { useState } from 'react';

export type SwmV3ConsentMode = 'no_store' | 'store_anonymized' | 'store_with_consent';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { mode: SwmV3ConsentMode; acceptedAt: string; version: string }) => void;
};

export default function ConsentModal({ open, onClose, onConfirm }: Props) {
  const [checked, setChecked] = useState(false);
  const [mode, setMode] = useState<SwmV3ConsentMode>('no_store');

  const consentVersion = 'swm-v3-phase-3-consent-v1';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded bg-white p-6 shadow">
        <h3 className="text-lg font-semibold">Consentimiento - Lectura educativa</h3>
        <p className="mt-2 text-sm text-gray-600">
          Esta funcion genera una lectura educativa y simbolica (mock). No ofrece diagnostico ni recomendaciones
          clinicas.
        </p>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span className="text-sm">
              Entiendo y acepto (opt-in explicito) el uso educativo y no clinico de esta lectura simbolica.
            </span>
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
                <span className="text-sm">No almacenar (no se guarda nada)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="swm_mode"
                  value="store_anonymized"
                  checked={mode === 'store_anonymized'}
                  onChange={() => setMode('store_anonymized')}
                />
                <span className="text-sm">
                  Almacenar anonimizado (sin datos identificables; solo estudio simbolico)
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="swm_mode"
                  value="store_with_consent"
                  checked={mode === 'store_with_consent'}
                  onChange={() => setMode('store_with_consent')}
                />
                <span className="text-sm">
                  Almacenar con consentimiento (asociado al terapeuta; consultante opcional)
                </span>
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
            className={`px-3 py-2 text-sm font-medium rounded ${
              checked ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
            onClick={() =>
              checked &&
              onConfirm({
                mode,
                acceptedAt: new Date().toISOString(),
                version: consentVersion,
              })
            }
            disabled={!checked}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

