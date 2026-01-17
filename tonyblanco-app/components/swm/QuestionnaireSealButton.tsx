/**
 * QuestionnaireSealButton - Complete and seal questionnaire
 * 
 * Appears when all 195 questions are answered
 * Transitions workspace to 'sealed' state
 */

'use client';

import React, { useState } from 'react';
import { swmMcmi4Api } from '@/lib/api/swm-mcmi4-api';
import { CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/solid';

interface QuestionnaireSealButtonProps {
  workspaceId: string;
  sessionId: string;
  answeredCount: number;
  totalQuestions: number;
  onSealed?: () => void;
  onError?: (error: string) => void;
}

export const QuestionnaireSealButton: React.FC<QuestionnaireSealButtonProps> = ({
  workspaceId,
  sessionId,
  answeredCount,
  totalQuestions,
  onSealed,
  onError,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState(false);

  const isComplete = answeredCount >= totalQuestions;

  const handleSeal = async () => {
    setSealing(true);

    try {
      const response = await swmMcmi4Api.sealQuestionnaire({
        workspace_id: workspaceId,
        session_id: sessionId,
      });

      setSealed(true);
      setTimeout(() => {
        onSealed?.();
      }, 2000);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to seal questionnaire';
      onError?.(errMsg);
      setSealing(false);
      setShowConfirm(false);
    }
  };

  if (!isComplete) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-600 text-sm">
          Completa las {totalQuestions - answeredCount} preguntas restantes para finalizar
        </p>
      </div>
    );
  }

  if (sealed) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-900 mb-2">
          ¡Cuestionario Sellado!
        </h3>
        <p className="text-green-700">
          Tus respuestas han sido guardadas de forma permanente e inmutable.
        </p>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="bg-purple-50 border-2 border-purple-500 rounded-lg p-6">
        <div className="flex items-start gap-4 mb-6">
          <LockClosedIcon className="h-8 w-8 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-purple-900 mb-2">
              ¿Confirmar Sellado Final?
            </h3>
            <p className="text-purple-800 text-sm leading-relaxed">
              Al sellar el cuestionario:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-purple-700">
              <li>• Todas las {answeredCount} respuestas serán permanentes</li>
              <li>• No podrás modificar ninguna respuesta</li>
              <li>• El workspace pasará a estado "Sellado"</li>
              <li>• Se generará el análisis y resultados finales</li>
            </ul>
            <p className="mt-4 text-purple-800 font-medium text-sm">
              Esta acción es irreversible.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={sealing}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSeal}
            disabled={sealing}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sealing ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Sellando...
              </>
            ) : (
              <>
                <LockClosedIcon className="h-5 w-5" />
                Confirmar Sellado
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <CheckCircleIcon className="h-12 w-12 text-green-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            ¡Cuestionario Completo!
          </h3>
          <p className="text-gray-700 text-sm">
            Has respondido las {answeredCount} preguntas del MCMI-4 Místico
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <LockClosedIcon className="h-6 w-6" />
        Sellar Cuestionario
      </button>

      <p className="text-center text-xs text-gray-600 mt-3">
        Revisa tus respuestas antes de sellar. Esta acción es permanente.
      </p>
    </div>
  );
};
