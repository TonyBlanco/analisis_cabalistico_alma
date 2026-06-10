/**
 * EditableObservationList — therapist-editable symbolic observations.
 *
 * Step 5 (Modo Híbrido): after the AI generates the assisted reading, the
 * therapist can refine each observation before saving. Every edit is re-validated
 * with the SAME role-aware policy used on the server:
 *   - clinical lexicon blocked unless the active role is 'clinical' (verified),
 *   - anti-fraud rail ALWAYS enforced.
 * Saving is blocked while any field is unsafe.
 */

'use client';

import { useMemo, useState } from 'react';
import { Save, X, AlertCircle, ShieldAlert } from 'lucide-react';
import {
  validateSafetyContentForRole,
  type SafetyRole,
} from '@holistica/symbolic/tree';
import type { SymbolicObservation } from '@holistica/symbolic/tree';

interface EditableObservationListProps {
  observations: SymbolicObservation[];
  role: SafetyRole;
  onSave: (observations: SymbolicObservation[]) => void;
  onCancel: () => void;
}

export function EditableObservationList({
  observations,
  role,
  onSave,
  onCancel,
}: EditableObservationListProps) {
  const [draft, setDraft] = useState<SymbolicObservation[]>(() =>
    observations.map((o) => ({ ...o })),
  );

  const fieldWarnings = useMemo(
    () =>
      draft.map(
        (o) => validateSafetyContentForRole(`${o.title}\n${o.content}`, role).warnings,
      ),
    [draft, role],
  );

  const hasUnsafe = fieldWarnings.some((w) => w.length > 0);

  function updateField(
    index: number,
    key: 'title' | 'content',
    value: string,
  ) {
    setDraft((prev) =>
      prev.map((o, i) => (i === index ? { ...o, [key]: value } : o)),
    );
  }

  function handleSave() {
    if (hasUnsafe) return;
    onSave(
      draft.map((o) => ({
        ...o,
        containsProhibitedContent: false,
      })),
    );
  }

  return (
    <div className="space-y-4" aria-label="Editor de observaciones simbólicas">
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
        <ShieldAlert className="h-4 w-4 text-slate-500 flex-shrink-0" aria-hidden="true" />
        <p className="text-xs text-slate-600">
          Modo de edición ·{' '}
          {role === 'clinical'
            ? 'vocabulario clínico habilitado (perfil verificado)'
            : 'vocabulario clínico bloqueado (modo observacional)'}
          . El rail anti-fraude se aplica siempre.
        </p>
      </div>

      {draft.map((obs, idx) => {
        const warnings = fieldWarnings[idx];
        const unsafe = warnings.length > 0;
        return (
          <div
            key={idx}
            className={`rounded-lg border bg-white p-4 shadow-sm ${
              unsafe ? 'border-red-300' : 'border-purple-200'
            }`}
          >
            <label className="block text-[11px] font-medium text-purple-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={obs.title}
              onChange={(e) => updateField(idx, 'title', e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm mb-3 focus:border-purple-400 focus:outline-none"
            />

            <label className="block text-[11px] font-medium text-purple-700 mb-1">
              Observación
            </label>
            <textarea
              value={obs.content}
              onChange={(e) => updateField(idx, 'content', e.target.value)}
              rows={4}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm leading-relaxed focus:border-purple-400 focus:outline-none"
            />

            <div className="mt-2 flex items-center justify-between">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                {obs.type}
              </span>
            </div>

            {unsafe && (
              <div
                className="mt-2 rounded-lg bg-red-50 border border-red-300 px-3 py-2"
                role="alert"
              >
                <p className="flex items-center gap-1 text-xs font-medium text-red-800 mb-1">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  Contenido bloqueado por seguridad:
                </p>
                <ul className="text-xs text-red-700 space-y-0.5 ml-4 list-disc">
                  {warnings.map((w, wi) => (
                    <li key={wi}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1"
        >
          <X className="h-3 w-3" />
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={hasUnsafe}
          className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <Save className="h-3 w-3" />
          Guardar observaciones
        </button>
      </div>
    </div>
  );
}
