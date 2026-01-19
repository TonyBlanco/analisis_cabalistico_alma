"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mcmi4SignalDefinition } from "./mcmi4-signal.config";
import { executeTest } from "@/lib/test-api";

type AnswerMap = Record<string, number>;

export default function Mcmi4SignalPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = mcmi4SignalDefinition.questions;
  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [answers, questions]
  );
  const isComplete = answeredCount === totalQuestions;

  const handleSelect = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!isComplete || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await executeTest({
        test_module_code: "mcmi4-signal",
        input_data: {
          scale: mcmi4SignalDefinition.scale,
          responses: answers,
          items_count: totalQuestions,
        },
        save_result: true,
      });

      router.push("/dashboard/patient/tests/mcmi4-signal/result");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al enviar el cuestionario.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">{mcmi4SignalDefinition.name}</h1>
        <p className="text-sm text-gray-600 mt-2">
          {mcmi4SignalDefinition.purpose}. Tiempo estimado {mcmi4SignalDefinition.estimated_time_minutes} minutos.
        </p>
        <div className="mt-4 text-xs text-gray-500">
          Pregunta {Math.min(answeredCount + 1, totalQuestions)} de {totalQuestions}
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gray-900"
            style={{ width: `${Math.round((answeredCount / totalQuestions) * 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="text-xs text-gray-500 mb-2">Pregunta {index + 1}</div>
            <h2 className="text-sm font-medium text-gray-900">{question.text}</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-2">
              {Object.entries(mcmi4SignalDefinition.scale.labels).map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={value}
                    checked={answers[question.id] === Number(value)}
                    onChange={() => handleSelect(question.id, Number(value))}
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
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isComplete || submitting}
          className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-white rounded-md bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Enviando…" : "Enviar"}
        </button>
        {!isComplete && (
          <p className="text-xs text-gray-500 mt-2">
            Completa todas las preguntas para habilitar el envío.
          </p>
        )}
      </div>
    </div>
  );
}
