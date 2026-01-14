import React from 'react';

export type Suggestion = {
  current_world?: string | null;
  next_world?: string | null;
  suggested_test_code?: string | null;
  suggested_test_name?: string | null;
  secondary_suggestions?: Array<{ code?: string | null; name?: string | null }>;
};

type Props = {
  suggestion: Suggestion;
  onViewReason: () => void;
  onAssign?: (code?: string | null) => void;
  onDiscard?: () => void;
};

export default function ResultSuggestionsCard({ suggestion, onViewReason, onAssign, onDiscard }: Props) {
  if (!suggestion) return null;

  const primary = suggestion.suggested_test_name || suggestion.suggested_test_code || 'Exploración sugerida';

  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-emerald-900">Exploración sugerida</h4>
          <p className="text-sm text-emerald-900 mt-1 font-medium">{primary}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewReason}
            className="px-3 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-700"
          >
            Ver motivo
          </button>
          {onAssign && (
            <button
              onClick={() => onAssign(suggestion.suggested_test_code)}
              className="px-3 py-1 rounded bg-white border border-emerald-200 text-emerald-700 text-xs hover:bg-emerald-50"
            >
              Asignar ahora
            </button>
          )}
          <button
            onClick={onDiscard}
            className="px-2 py-1 rounded text-slate-600 text-xs hover:bg-slate-100"
            aria-label="Descartar sugerencia en esta sesión"
          >
            ❌
          </button>
        </div>
      </div>

      {(suggestion.current_world || suggestion.next_world) && (
        <p className="text-xs text-emerald-700 mt-3">
          {suggestion.current_world && `Desde ${suggestion.current_world.charAt(0).toUpperCase() + suggestion.current_world.slice(1)}`}
          {suggestion.current_world && suggestion.next_world && ' · '}
          {suggestion.next_world && `Hacia ${suggestion.next_world.charAt(0).toUpperCase() + suggestion.next_world.slice(1)}`}
        </p>
      )}
    </div>
  );
}
