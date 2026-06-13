'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { executeTest } from '@/lib/test-api';
import {
  buildPastLivesOpenReflection,
  pastLivesDefinition,
} from './past-lives.config';

type AnswerMap = Record<string, string>;
type ReflectionMap = Record<string, string>;

export default function PastLivesAssessmentPage() {
  const router = useRouter();
  const [ack, setAck] = useState(false);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [reflection, setReflection] = useState<ReflectionMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = pastLivesDefinition.questions;
  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [answers, questions],
  );
  const isComplete = answeredCount === totalQuestions;

  const sections = pastLivesDefinition.sections;

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleReflectionChange = (fieldId: string, value: string) => {
    setReflection((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async () => {
    if (!ack || !isComplete || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const responses: Record<string, number> = {};
      for (const q of questions) {
        responses[q.id] = Number(answers[q.id]);
      }

      const openReflection = buildPastLivesOpenReflection(reflection);

      await executeTest({
        test_module_code: pastLivesDefinition.code,
        input_data: {
          fecha: new Date().toISOString().split('T')[0],
          responses,
          ...(openReflection !== undefined ? { open_reflection: openReflection } : {}),
        },
        save_result: true,
      });

      router.push('/dashboard/patient/tests/past-lives/result');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al enviar el cuestionario.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">{pastLivesDefinition.name}</h1>
        <p className="text-sm text-gray-600 mt-2">
          Tiempo estimado {pastLivesDefinition.estimated_time_minutes} minutos ·{' '}
          {sections.length} bloques de exploración.
        </p>

        <div className="mt-4 bg-violet-50 border border-violet-200 rounded-md p-4 space-y-2">
          <h2 className="text-sm font-semibold text-violet-900">
            {pastLivesDefinition.intro.title}
          </h2>
          {pastLivesDefinition.intro.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-sm text-violet-900 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-4">
          <p className="text-sm text-amber-900 whitespace-pre-line">{pastLivesDefinition.disclaimer}</p>
          <label className="mt-3 flex items-start gap-3 text-sm text-amber-900 cursor-pointer">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              className="h-4 w-4 mt-0.5 border-gray-300"
            />
            <span>He leído y comprendido la nota anterior.</span>
          </label>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Progreso: {answeredCount} de {totalQuestions} ({progressPct}%)
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full"
            style={{
              width: `${progressPct}%`,
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

      <div className="space-y-6">
        {sections.map((section) => {
          const sectionQuestions = questions.filter((q) => q.sectionId === section.id);
          return (
            <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">{section.title}</h2>
              {section.hint ? (
                <p className="text-xs text-gray-500 mt-1 italic">{section.hint}</p>
              ) : null}
              {section.note ? (
                <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                  {section.note}
                </p>
              ) : null}
              <div className="mt-4 space-y-4">
                {sectionQuestions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-md p-4">
                    <p className="text-sm font-medium text-gray-900">{question.text}</p>
                    <div className="mt-3 space-y-2">
                      {pastLivesDefinition.scale.labels.map((opt) => {
                        const valueStr = String(opt.value);
                        return (
                          <label
                            key={valueStr}
                            className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={valueStr}
                              checked={answers[question.id] === valueStr}
                              onChange={() => handleSelect(question.id, valueStr)}
                              className="h-4 w-4 border-gray-300"
                            />
                            <span>
                              {opt.value} — {opt.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-semibold text-gray-900">Reflexión guiada (opcional)</h2>
        <p className="text-xs text-gray-500">
          Estos campos te ayudan a profundizar. No son obligatorios para enviar el cuestionario.
        </p>
        {pastLivesDefinition.guidedReflection.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-900">{field.label}</label>
            {field.hints && field.hints.length > 0 ? (
              <ul className="mt-1 text-xs text-gray-500 list-disc list-inside">
                {field.hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            ) : null}
            {field.type === 'text_long' ? (
              <textarea
                value={reflection[field.id] || ''}
                onChange={(e) => handleReflectionChange(field.id, e.target.value)}
                rows={5}
                className="mt-2 w-full border border-gray-300 rounded-md p-3 text-sm text-gray-900"
                placeholder={field.placeholder}
              />
            ) : (
              <input
                type="text"
                value={reflection[field.id] || ''}
                onChange={(e) => handleReflectionChange(field.id, e.target.value)}
                className="mt-2 w-full border border-gray-300 rounded-md p-3 text-sm text-gray-900"
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <button
          type="button"
          disabled={!ack || !isComplete || submitting}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          {submitting ? 'Enviando…' : 'Enviar'}
        </button>
        {!ack && <p className="text-xs text-gray-500 mt-2">Debes aceptar la nota antes de comenzar.</p>}
        {ack && !isComplete && (
          <p className="text-xs text-gray-500 mt-2">Completa todas las preguntas para habilitar el envío.</p>
        )}
      </div>
    </div>
  );
}