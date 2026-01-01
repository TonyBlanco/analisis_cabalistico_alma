"use client";

import type { SwmV3Reading } from './MockEngine';

type Props = {
  reading: SwmV3Reading;
  onClose: () => void;
};

export default function ResultPanel({ reading, onClose }: Props) {
  return (
    <div className="fixed right-6 bottom-6 z-40 w-96 max-w-full rounded bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-emerald-700">Lectura educativa (mock)</div>
          <h4 className="mt-1 text-sm font-medium">Resumen simbólico</h4>
        </div>
        <button onClick={onClose} className="text-sm text-gray-500">Cerrar</button>
      </div>

      <p className="mt-3 text-sm text-gray-700">{reading.summary}</p>

      <div className="mt-3 text-sm">
        <div className="font-medium text-gray-800">Temas</div>
        <ul className="list-disc ml-5 mt-1 text-gray-700">
          {reading.themes.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3 text-sm text-gray-700">
        <div className="font-medium text-gray-800">Correspondencias</div>
        <div className="mt-1">{reading.correspondences.join(', ')}</div>
      </div>

      <div className="mt-3 text-xs text-gray-500">{reading.caution}</div>
    </div>
  );
}
