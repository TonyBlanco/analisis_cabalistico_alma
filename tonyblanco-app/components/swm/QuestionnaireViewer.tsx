/**
 * QuestionnaireViewer - Display MCMI-4 Questionnaire with 195 questions
 * 
 * Consumes backend SWM API (GET /questionnaire, POST /progress)
 * Navigates through 4 Kabbalistic worlds: Atzilut → Briah → Yetzirah → Assiah
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  swmMcmi4Api,
  type Question,
  type QuestionnaireResponse,
  type CurrentProgress,
} from '@/lib/api/swm-mcmi4-api';
import { SparklesIcon, CheckCircleIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

interface QuestionnaireViewerProps {
  workspaceId: string;
  sessionId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const WORLD_COLORS: Record<string, string> = {
  atzilut: 'from-purple-600 to-indigo-600',
  briah: 'from-blue-600 to-cyan-600',
  yetzirah: 'from-green-600 to-emerald-600',
  assiah: 'from-amber-600 to-orange-600',
};

const WORLD_LABELS: Record<string, string> = {
  atzilut: 'Atzilut (Emanación)',
  briah: 'Briah (Creación)',
  yetzirah: 'Yetzirah (Formación)',
  assiah: 'Assiah (Acción)',
};

export const QuestionnaireViewer: React.FC<QuestionnaireViewerProps> = ({
  workspaceId,
  sessionId,
  onComplete,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  // Load questionnaire on mount
  useEffect(() => {
    loadQuestionnaire();
  }, [workspaceId]);

  // Update current question when progress changes
  useEffect(() => {
    if (questionnaire && questionnaire.current_progress) {
      const nextQ = questionnaire.next_question;
      if (nextQ) {
        setCurrentQuestion(nextQ);
        // Check if we already have a response for this question
        const existingResponse = responses[nextQ.id];
        setSelectedValue(existingResponse || null);
      }
    }
  }, [questionnaire]);

  const loadQuestionnaire = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await swmMcmi4Api.getQuestionnaire(workspaceId);
      setQuestionnaire(data);
      
      // Initialize responses map from current progress (if any)
      if (data.current_progress && data.current_progress.answered_count > 0) {
        // Note: Backend doesn't return full responses map in progress,
        // so we'll track locally. In a real scenario, we'd need to fetch
        // the questionnaire_progress artifact to get all responses.
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to load questionnaire';
      setError(errMsg);
      onError?.(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResponse = async (value: number) => {
    if (!currentQuestion || !questionnaire) return;

    setSaving(true);
    setError(null);

    try {
      const response = await swmMcmi4Api.saveQuestionnaireResponse({
        workspace_id: workspaceId,
        session_id: sessionId,
        question_id: currentQuestion.id,
        value,
        world: currentQuestion.world,
      });

      // Update local state
      setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
      setSelectedValue(value);

      // Update questionnaire with new progress
      if (questionnaire) {
        const updatedQuestionnaire: QuestionnaireResponse = {
          ...questionnaire,
          current_progress: response.current_progress,
          next_question: response.next_question,
        };
        setQuestionnaire(updatedQuestionnaire);

        // Check if completed
        if (response.current_progress.answered_count >= 195) {
          onComplete?.();
        }
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to save response';
      setError(errMsg);
      onError?.(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const getProgressPercentage = (): number => {
    if (!questionnaire?.current_progress) return 0;
    return questionnaire.current_progress.progress_percentage;
  };

  const getCurrentWorldLabel = (): string => {
    if (!questionnaire?.current_progress) return '';
    return WORLD_LABELS[questionnaire.current_progress.current_world] || '';
  };

  const getCurrentWorldColor = (): string => {
    if (!questionnaire?.current_progress) return 'from-gray-600 to-gray-600';
    return WORLD_COLORS[questionnaire.current_progress.current_world] || 'from-gray-600 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <SparklesIcon className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando cuestionario...</p>
        </div>
      </div>
    );
  }

  if (error && !questionnaire) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-medium mb-2">Error al cargar cuestionario</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={loadQuestionnaire}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-800 font-medium">Cuestionario completado</p>
          <p className="text-gray-600 text-sm mt-2">195/195 preguntas respondidas</p>
        </div>
      </div>
    );
  }

  const progress = questionnaire?.current_progress;
  const answeredCount = progress?.answered_count || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className={`inline-block px-4 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getCurrentWorldColor()}`}>
                {getCurrentWorldLabel()}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{answeredCount} / 195</p>
              <p className="text-sm text-gray-600">{getProgressPercentage().toFixed(1)}% completado</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getCurrentWorldColor()} transition-all duration-300`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>

          {/* World Progress Indicators */}
          {progress && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {Object.entries(progress.worlds_progress || {}).map(([world, worldProgress]) => (
                <div key={world} className="text-center">
                  <p className="text-xs font-medium text-gray-700 uppercase mb-1">
                    {world}
                  </p>
                  <p className="text-sm text-gray-900">
                    {worldProgress.answered} / {worldProgress.total}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-full bg-gradient-to-r ${WORLD_COLORS[world]} rounded-full`}
                      style={{ width: `${(worldProgress.answered / worldProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Question Header */}
          <div className="mb-6 border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Pregunta {answeredCount + 1}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{currentQuestion.dimension}</span>
                {currentQuestion.sefirah && (
                  <>
                    <span>•</span>
                    <span className="italic">{currentQuestion.sefirah}</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-lg text-gray-900 leading-relaxed">
              {currentQuestion.text}
            </p>
          </div>

          {/* Likert Scale (1-5) */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 text-center mb-4">
              Selecciona tu respuesta:
            </p>
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleSaveResponse(value)}
                  disabled={saving}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all
                    ${selectedValue === value
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                    }
                    ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className="block text-2xl font-bold text-gray-900 mb-1">{value}</span>
                  <span className="block text-xs text-gray-600">
                    {value === 1 && 'Muy en desacuerdo'}
                    {value === 2 && 'En desacuerdo'}
                    {value === 3 && 'Neutral'}
                    {value === 4 && 'De acuerdo'}
                    {value === 5 && 'Muy de acuerdo'}
                  </span>
                  {selectedValue === value && (
                    <CheckCircleIcon className="absolute top-2 right-2 h-6 w-6 text-purple-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Saving Indicator */}
          {saving && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Guardando respuesta...</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Responde con honestidad. Tus respuestas son confidenciales y se utilizarán
            exclusivamente para tu análisis personal.
          </p>
        </div>
      </div>
    </div>
  );
};
