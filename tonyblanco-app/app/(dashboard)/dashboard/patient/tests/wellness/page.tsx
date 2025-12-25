'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { wellnessDefinition } from './wellness.config';
import { executeTest } from '@/lib/test-api';

type AnswerMap = Record<string, string>;

export default function WellnessAssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = wellnessDefinition.questions;
  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [answers, questions]
  );
  const isComplete = answeredCount === totalQuestions;

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!isComplete || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const responses: Record<string, number> = {};
      for (const q of questions) {
        responses[q.id] = Number(answers[q.id]);
      }

      await executeTest({
        test_module_code: wellnessDefinition.code,
        input_data: {
          fecha: new Date().toISOString().split('T')[0],
          responses,
        },
        save_result: true,
      });

      router.push('/dashboard/patient/tests/wellness/result');
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
        <h1 className="text-2xl font-semibold text-gray-900">{wellnessDefinition.name}</h1>
        <p className="text-sm text-gray-600 mt-2">
          {wellnessDefinition.purpose}. Tiempo estimado {wellnessDefinition.estimated_time_minutes} minutos.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Nota: cuestionario orientativo de bienestar. No constituye diagnóstico.
        </p>

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
          <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="text-xs text-gray-500 mb-2">Pregunta {index + 1}</div>
            <h2 className="text-sm font-medium text-gray-900">{question.text}</h2>
            <div className="mt-4 space-y-2">
              {Object.entries(wellnessDefinition.scale.labels).map(([value, label]) => (
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
                    {value} — {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <button
          type="button"
          disabled={!isComplete || submitting}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          {submitting ? 'Enviando…' : 'Enviar'}
        </button>
        {!isComplete && (
          <p className="text-xs text-gray-500 mt-2">Completa todas las preguntas para habilitar el envío.</p>
        )}
      </div>
    </div>
  );
}
