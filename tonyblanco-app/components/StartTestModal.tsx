import React from 'react';

export type PatientTestIntroCopy = {
  purpose: string;
  guidance: string;
  completion: string;
  followUp: string;
  estimatedTime?: string;
  privacy: string;
};

export const DEFAULT_PATIENT_TEST_INTRO_COPY: PatientTestIntroCopy = {
  purpose:
    'Tu terapeuta te ha asignado esta evaluación general como paso previo a tu evaluación holística personalizada.',
  guidance:
    'Hazla con calma, en un momento tranquilo, y responde con sinceridad. No hay respuestas correctas ni incorrectas.',
  completion:
    'Necesitas responder todas las preguntas; el botón de enviar se activa cuando esté completa.',
  followUp:
    'Es posible que tu terapeuta te reenvíe algunos tests durante el proceso para ir viendo tu evolución; es normal repetir alguno.',
  privacy:
    'Tus respuestas se tratarán de forma confidencial y estarán disponibles para acompañar tu proceso.',
};

interface StartTestModalProps {
  open: boolean;
  testName: string;
  description?: string;
  introCopy?: Partial<PatientTestIntroCopy>;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function StartTestModal({
  open,
  testName,
  description,
  introCopy,
  loading = false,
  onCancel,
  onConfirm,
}: StartTestModalProps) {
  if (!open) return null;

  const copy = { ...DEFAULT_PATIENT_TEST_INTRO_COPY, ...introCopy };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-test-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200">
          <h3 id="start-test-title" className="text-lg font-semibold text-gray-900">
            Iniciar exploración
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4 text-sm leading-6 text-gray-700">
          <div>
            <p className="text-base font-semibold text-gray-900">{testName}</p>
            {description ? <p className="mt-1 text-gray-600">{description}</p> : null}
          </div>
          <p>{copy.purpose}</p>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-2 text-blue-950">
            <p className="font-medium">Antes de empezar</p>
            <p>{copy.guidance}</p>
            <p>{copy.completion}</p>
          </div>
          <p>{copy.followUp}</p>
          {copy.estimatedTime ? <p className="font-medium text-gray-800">{copy.estimatedTime}</p> : null}
          <p className="text-xs leading-5 text-gray-500">{copy.privacy}</p>
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
