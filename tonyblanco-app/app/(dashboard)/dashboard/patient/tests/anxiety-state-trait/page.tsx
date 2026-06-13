'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { anxietyStateTraitDefinition } from './anxiety-state-trait.config';
import { executeTest } from '@/lib/test-api';

import {
  PatientQuestionnaireCompletionStatus,
  usePatientQuestionnaireCompletion,
} from "@/components/patient/PatientQuestionnaireCompletion";

type AnswerMap = Record<string, string>;

export default function AnxietyStateTraitPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = anxietyStateTraitDefinition.questions;
  const completion = usePatientQuestionnaireCompletion(
    questions.map((question) => question.id),
    answers,
  );
  const { answeredCount, totalQuestions, isComplete } = completion;

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!completion.revealMissing() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const responses: Record<string, number> = {};
      for (const question of questions) {
        responses[question.id] = Number(answers[question.id]);
      }

      await executeTest({
        test_module_code: anxietyStateTraitDefinition.code,
        input_data: {
          fecha: new Date().toISOString().split('T')[0],
          responses,
          seed: anxietyStateTraitDefinition.fixedSeed,
          selected_item_ids: [...anxietyStateTraitDefinition.selectedItemIds],
        },
        save_result: true,
      });

      router.push('/dashboard/patient/tests/anxiety-state-trait/result');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al enviar el cuestionario.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">{anxietyStateTraitDefinition.name}</h1>
        <p className="text-sm text-gray-600 mt-2">
          {anxietyStateTraitDefinition.purpose} Tiempo estimado {anxietyStateTraitDefinition.estimated_time_minutes} minutos.
        </p>
        <p className="text-xs text-gray-500 mt-2">Cubre cómo te sientes ahora y cómo reaccionas en general. Uso orientativo.</p>

        <div className="mt-4 text-xs text-gray-500">
          Pregunta {Math.min(answeredCount + 1, totalQuestions)} de {totalQuestions}
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full"
            style={{
              width: `${Math.round((answeredCount / totalQuestions) * 100)}%`,
              backgroundColor: 'var(--accent-color)',
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div
            key={question.id}
            {...completion.getQuestionCardProps(question.id)}
            className={completion.getQuestionCardClassName(
              question.id,
              "bg-white border border-gray-200 rounded-lg p-5 shadow-sm",
            )}
          >
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Pregunta {index + 1}</span>
              <span>{question.dimension === 'state' ? 'Estado (hoy)' : 'Rasgo (general)'}</span>
            </div>
            <h2 className="text-sm font-medium text-gray-900">{question.text}</h2>
            <div className="mt-4 space-y-2">
              {Object.entries(anxietyStateTraitDefinition.scale.labels).map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={value}
                    checked={answers[question.id] === value}
                    onChange={() => handleSelect(question.id, value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span>
                    {value} - {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        onPointerDownCapture={() => completion.revealMissing()}
      >
        <PatientQuestionnaireCompletionStatus completion={completion} />
        <button
          type="button"
          disabled={!isComplete || submitting}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          {submitting ? 'Enviando.' : 'Enviar'}
        </button>
        {!isComplete && (
          <p className="text-xs text-gray-500 mt-2">Completa todas las preguntas para habilitar el envío.</p>
        )}
      </div>
    </div>
  );
}
