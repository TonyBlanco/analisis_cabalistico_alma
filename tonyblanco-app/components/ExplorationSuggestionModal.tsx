import React from 'react';

interface ExplorationSuggestionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ExplorationSuggestionModal({ open, onClose }: ExplorationSuggestionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            ¿Por qué esta exploración es sugerida ahora?
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Desde Beriá (Comprensión)</h4>
            <p>
              La lectura actual trabaja sentido y comprensión. Esta sugerencia invita a traducir esa claridad en
              experiencia emocional concreta.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Hacia Ietzirá (Emoción)</h4>
            <p>
              Ietzirá permite observar el movimiento afectivo y la regulación interna, para acompañar procesos sin
              forzar conclusiones.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Sentido terapéutico</h4>
            <p>
              La transición ayuda a identificar recursos, tensiones y ritmos emocionales que completen la lectura de
              Beriá.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Nota ética (orientativo, no automático)</h4>
            <p>
              Esta sugerencia es una guía simbólica. La decisión final siempre corresponde al criterio profesional del
              terapeuta.
            </p>
          </div>
        </div>
        <div className="px-5 pb-5 pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
