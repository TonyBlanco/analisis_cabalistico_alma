'use client';

import { useCallback, useMemo, useState } from 'react';

type AnswerMap = Record<string, unknown>;

export type PatientQuestionnaireCompletion = {
  answeredCount: number;
  totalQuestions: number;
  missingCount: number;
  isComplete: boolean;
  showMissing: boolean;
  revealMissing: () => boolean;
  getQuestionCardProps: (questionId: string) => {
    id: string;
    'data-testid': string;
    'aria-invalid': true | undefined;
  };
  getQuestionCardClassName: (questionId: string, baseClassName: string) => string;
};

const questionElementId = (questionId: string) =>
  `patient-question-${questionId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

const hasAnswer = (answers: AnswerMap, questionId: string) =>
  answers[questionId] !== undefined && answers[questionId] !== null && answers[questionId] !== '';

export function usePatientQuestionnaireCompletion(
  questionIds: readonly string[],
  answers: AnswerMap
): PatientQuestionnaireCompletion {
  const [showMissing, setShowMissing] = useState(false);
  const missingIds = useMemo(
    () => questionIds.filter((questionId) => !hasAnswer(answers, questionId)),
    [answers, questionIds]
  );
  const missingSet = useMemo(() => new Set(missingIds), [missingIds]);
  const totalQuestions = questionIds.length;
  const missingCount = missingIds.length;
  const answeredCount = totalQuestions - missingCount;
  const isComplete = totalQuestions > 0 && missingCount === 0;

  const revealMissing = useCallback(() => {
    if (missingIds.length === 0) return true;

    setShowMissing(true);
    const scrollToFirstMissing = () => {
      document.getElementById(questionElementId(missingIds[0]))?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    };
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(scrollToFirstMissing);
    } else {
      scrollToFirstMissing();
    }
    return false;
  }, [missingIds]);

  const getQuestionCardProps = useCallback(
    (questionId: string) => ({
      id: questionElementId(questionId),
      'data-testid': `question-card-${questionId}`,
      'aria-invalid': showMissing && missingSet.has(questionId) ? (true as const) : undefined,
    }),
    [missingSet, showMissing]
  );

  const getQuestionCardClassName = useCallback(
    (questionId: string, baseClassName: string) =>
      showMissing && missingSet.has(questionId)
        ? `${baseClassName} border-red-400 ring-2 ring-red-100`
        : baseClassName,
    [missingSet, showMissing]
  );

  return {
    answeredCount,
    totalQuestions,
    missingCount,
    isComplete,
    showMissing,
    revealMissing,
    getQuestionCardProps,
    getQuestionCardClassName,
  };
}

type PatientQuestionnaireCompletionPanelProps = {
  completion: PatientQuestionnaireCompletion;
  submitting: boolean;
  onSubmit: () => void;
  submitLabel?: string;
  submittingLabel?: string;
};

export function PatientQuestionnaireCompletionPanel({
  completion,
  submitting,
  onSubmit,
  submitLabel = 'Enviar',
  submittingLabel = 'Enviando...',
}: PatientQuestionnaireCompletionPanelProps) {
  const handleIncompletePointerDown = () => {
    if (!completion.isComplete) completion.revealMissing();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-800">
          {completion.answeredCount} de {completion.totalQuestions} respondidas
        </p>
        {!completion.isComplete ? (
          <p className="text-xs text-gray-500">El envío se activa cuando respondas todas.</p>
        ) : (
          <p className="text-xs font-medium text-green-700">Lista para enviar</p>
        )}
      </div>

      {completion.showMissing && !completion.isComplete ? (
        <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Te faltan {completion.missingCount} respuestas para poder enviar.
        </p>
      ) : null}

      <div onPointerDownCapture={handleIncompletePointerDown}>
        <button
          type="button"
          disabled={!completion.isComplete || submitting}
          onClick={onSubmit}
          className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          style={{ backgroundColor: completion.isComplete && !submitting ? 'var(--accent-color)' : undefined }}
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </div>
  );
}

export function PatientQuestionnaireCompletionStatus({
  completion,
}: {
  completion: PatientQuestionnaireCompletion;
}) {
  return (
    <div className="mb-4 space-y-2">
      <p className="text-sm font-medium text-gray-800">
        {completion.answeredCount} de {completion.totalQuestions} respondidas
      </p>
      {completion.showMissing && !completion.isComplete ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Te faltan {completion.missingCount} respuestas para poder enviar.
        </p>
      ) : null}
    </div>
  );
}
