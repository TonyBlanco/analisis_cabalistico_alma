'use client';

import { useState } from 'react';
import { getHelpContent, HelpContentId } from './HelpContentRegistry';

export default function HelpButton({ contentId, label = '¿Cómo funciona?' }: { contentId: HelpContentId; label?: string }) {
  const [open, setOpen] = useState(false);
  const entry = getHelpContent(contentId);

  if (!entry) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-blue-700 underline decoration-dotted underline-offset-4"
        title={entry.title}
      >
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white border border-gray-200 shadow-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Ayuda</p>
                <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
                aria-label="Cerrar ayuda"
              >
                ✕
              </button>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
              {entry.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="text-[11px] text-gray-500">
              Solo lectura. No modifica cálculos ni endpoints.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
