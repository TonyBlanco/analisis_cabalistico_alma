'use client';

import { useState } from 'react';

interface NameVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fullName: string;
}

/**
 * NameVerificationModal Component
 * 
 * Modal to verify legal name before first save or change.
 * User must accept that this name will be used in all tests and reports.
 */
export default function NameVerificationModal({
  open,
  onClose,
  onConfirm,
  fullName,
}: NameVerificationModalProps) {
  const [accepted, setAccepted] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Verificación de nombre legal
        </h2>
        
        <p className="text-sm text-gray-600 mb-4">
          Estás a punto de guardar tu nombre completo legal:
        </p>
        
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <p className="text-sm font-medium text-gray-900">{fullName}</p>
        </div>

        <p className="text-sm text-gray-700 mb-4">
          <strong>Importante:</strong> Este nombre se usará en todos los tests e informes cabalísticos y astrológicos.
        </p>

        <div className="mb-6">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-700">
              Entiendo que este nombre será utilizado en todos los análisis y no podré cambiarlo más de 2 veces.
            </span>
          </label>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!accepted}
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
