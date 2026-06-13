"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gad7Definition } from "./gad7.config";
import { getApiBaseUrl } from "@/lib/api-base";
import {
  PatientQuestionnaireCompletionPanel,
  usePatientQuestionnaireCompletion,
} from "@/components/patient/PatientQuestionnaireCompletion";

type AnswerMap = Record<string, string>;

const API_URL = getApiBaseUrl();

export default function Gad7Page() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = gad7Definition.questions;
  const completion = usePatientQuestionnaireCompletion(
    questions.map((question) => question.id),
    answers
  );
  const { answeredCount, totalQuestions } = completion;

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!completion.revealMissing() || submitting) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      setError("Sesión no válida. Inicia sesión nuevamente.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/tests/gad7/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(answers),
      });

      if (!response.ok) {
        let msg = "No se pudo guardar el GAD-7.";
        try {
          const data = await response.json();
          msg = data?.message || data?.error || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      router.push("/dashboard/patient/tests/gad7/result");
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
        <h1 className="text-2xl font-semibold text-gray-900">{gad7Definition.name}</h1>
        <p className="text-sm text-gray-600 mt-2">
          {gad7Definition.purpose} para {gad7Definition.target_population}. Tiempo estimado {gad7Definition.estimated_time_minutes} minutos.
        </p>
        <div className="mt-4 text-xs text-gray-500">
          Pregunta {Math.min(answeredCount + 1, totalQuestions)} de {totalQuestions}
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gray-900"
            style={{
              width: `${Math.round((answeredCount / totalQuestions) * 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div
            key={question.id}
            {...completion.getQuestionCardProps(question.id)}
            className={completion.getQuestionCardClassName(
              question.id,
              "bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
            )}
          >
            <div className="text-xs text-gray-500 mb-2">Pregunta {index + 1}</div>
            <h2 className="text-sm font-medium text-gray-900">{question.text}</h2>
            <div className="mt-4 space-y-2">
              {Object.entries(question.scale.labels).map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer"
                >
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

      {error && (
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <PatientQuestionnaireCompletionPanel
        completion={completion}
        submitting={submitting}
        submittingLabel="Enviando…"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
