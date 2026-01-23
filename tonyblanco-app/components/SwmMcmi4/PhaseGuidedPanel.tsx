/**
 * PhaseGuidedPanel - Structured interpretative guidance for each workspace phase
 * 
 * Displays 2-4 guiding questions per phase with structured response fields.
 * Responses persist independently per question using existing artifact system.
 * 
 * AI INTEGRATION (v2 - safe/mcmi4-mistico-core-v1):
 * - Optional SymbolicAIPanel for explorative suggestions
 * - Read-only, never modifies artifacts
 * - ON/OFF toggle controlled by therapist
 */

import { useMemo, useState } from 'react';
import { getPhaseGuide, getPhaseCompletionStatus, type PhaseName } from '@/lib/swm-mcmi4/phase-guides.config';
import SymbolicAIPanel from './SymbolicAIPanel';

interface PhaseGuidedPanelProps {
  phase: PhaseName;
  responses: Record<string, string>;
  onResponseChange: (questionId: string, value: string) => void;
  onSave: () => Promise<void>;
  saving?: boolean;
  saved?: boolean;
  error?: string | null;
  // AI-related props (optional)
  dominantWorld?: string;
  shadowWorld?: string;
  symbolicTensions?: string[];
  aiApiKey?: string;
}

const statusLabels = {
  pending: 'Pendiente',
  'in-progress': 'En progreso',
  completed: 'Completada',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-600 border-gray-200',
  'in-progress': 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
};

export default function PhaseGuidedPanel({
  phase,
  responses,
  onResponseChange,
  onSave,
  saving,
  saved,
  error,
  dominantWorld = '',
  shadowWorld = '',
  symbolicTensions = [],
  aiApiKey,
}: PhaseGuidedPanelProps) {
  const guide = getPhaseGuide(phase);
  const [localResponses, setLocalResponses] = useState<Record<string, string>>(responses);

  const status = useMemo(() => {
    return getPhaseCompletionStatus(phase, localResponses);
  }, [phase, localResponses]);

  const isDirty = useMemo(() => {
    return guide.questions.some((q) => {
      return (localResponses[q.id] || '') !== (responses[q.id] || '');
    });
  }, [localResponses, responses, guide.questions]);

  const handleChange = (questionId: string, value: string) => {
    setLocalResponses((prev) => ({ ...prev, [questionId]: value }));
    onResponseChange(questionId, value);
  };

  const handleSaveClick = async () => {
    if (!isDirty || saving) return;
    await onSave();
    // Update local state to match saved state
    setLocalResponses(responses);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-gray-900">{guide.title}</h3>
              <span
                className={`px-2 py-0.5 text-[11px] font-medium rounded-full border ${statusColors[status]}`}
              >
                {statusLabels[status]}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{guide.description}</p>
          </div>

          {isDirty && (
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className="flex-shrink-0 px-3 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          )}

          {!isDirty && saved && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              ✓ Guardado
            </span>
          )}
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="divide-y divide-gray-100">
        {guide.questions.map((question, idx) => {
          const value = localResponses[question.id] || '';
          const hasContent = value.trim().length > 0;

          return (
            <div key={question.id} className="px-6 py-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor={question.id} className="block text-sm font-medium text-gray-900">
                    {question.text}
                  </label>
                </div>
                {hasContent && (
                  <span className="text-xs text-green-600">✓</span>
                )}
              </div>

              <textarea
                id={question.id}
                value={value}
                onChange={(e) => handleChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--accent-color)] resize-y"
              />
            </div>
          );
        })}
      </div>

      {/* Symbolic AI Assistant Panel - Optional, therapist-controlled */}
      <div className="px-6 py-4 border-t border-gray-100">
        <SymbolicAIPanel
          phase={phase}
          dominantWorld={dominantWorld}
          shadowWorld={shadowWorld}
          symbolicTensions={symbolicTensions}
          therapistText={Object.values(localResponses).filter(Boolean).join('\n\n')}
          apiKey={aiApiKey}
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Responde cada pregunta de forma libre. No hay respuestas "correctas" — el objetivo es guiar tu pensamiento interpretativo.
        </p>
      </div>
    </div>
  );
}
