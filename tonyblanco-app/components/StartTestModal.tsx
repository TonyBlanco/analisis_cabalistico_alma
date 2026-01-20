import React from 'react';

interface StartTestModalProps {
  open: boolean;
  testName: string;
  description?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function StartTestModal({
  open,
  testName,
  description,
  loading = false,
  onCancel,
  onConfirm,
}: StartTestModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Iniciar exploración</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-3 text-sm text-gray-700">
          <div>
            <p className="text-sm font-semibold text-gray-900">{testName}</p>
            {description ? <p className="mt-1">{description}</p> : null}
          </div>
        </div>
        <div className="px-5 pb-5 pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent-color)' }}
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Iniciar exploración'}
          </button>
        </div>
      </div>
    </div>
  );
}
