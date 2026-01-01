"use client";

import type { SwmV3Reading } from "./MockEngine";
import type { SwmV3SaveStatus } from "./SwmV3Button";

type Props = {
  reading: SwmV3Reading;
  saveStatus: SwmV3SaveStatus;
  onClose: () => void;
};

function formatMode(mode: string) {
  if (mode === "store_anonymized") return "anónima";
  if (mode === "store_with_consent") return "con consentimiento";
  return "no_store";
}

export default function ResultPanel({ reading, saveStatus, onClose }: Props) {
  const statusLine = (() => {
    switch (saveStatus.state) {
      case "not_saved":
        return "Lectura no guardada";
      case "saving":
        return "Procesando lectura…";
      case "saved":
        return `Lectura guardada (${formatMode(saveStatus.mode)})`;
      case "failed":
        return "No se pudo guardar la lectura";
      default:
        return null;
    }
  })();

  return (
    <div className="fixed right-6 bottom-6 z-40 w-96 max-w-full rounded bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-emerald-700">
            Lectura educativa (mock)
          </div>
          <h4 className="mt-1 text-sm font-medium">Resumen simbólico</h4>
          {statusLine && (
            <div className="mt-1 text-xs text-gray-600">{statusLine}</div>
          )}
        </div>
        <button onClick={onClose} className="text-sm text-gray-500">
          Cerrar
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-700">{reading.summary}</p>

      <div className="mt-3 text-sm">
        <div className="font-medium text-gray-800">Temas</div>
        <ul className="list-disc ml-5 mt-1 text-gray-700">
          {reading.themes.map((theme) => (
            <li key={theme}>{theme}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3 text-sm text-gray-700">
        <div className="font-medium text-gray-800">Correspondencias</div>
        <div className="mt-1">{reading.correspondences.join(", ")}</div>
      </div>

      <div className="mt-3 text-xs text-gray-500">{reading.caution}</div>
    </div>
  );
}

