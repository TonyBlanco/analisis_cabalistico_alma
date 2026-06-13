"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { aqKabbalahDefinition } from "./aq-kabbalah.config";
import { executeTest } from "@/lib/test-api";

type ResponseMap = Record<string, string>;

const SUBSCALE_LABELS: Record<string, string> = {
  "1-10": "Ítems 1 a 10",
  "11-20": "Ítems 11 a 20",
  "21-30": "Ítems 21 a 30",
  "31-40": "Ítems 31 a 40",
  "41-50": "Ítems 41 a 50",
};

export default function AqKabbalahPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<ResponseMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = aqKabbalahDefinition.questions;
  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () => questions.filter((q) => responses[q.id] !== undefined).length,
    [questions, responses],
  );
  const isComplete = answeredCount === totalQuestions;

  const handleSelect = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!isComplete || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const responsesPayload: Record<string, number> = {};
      for (const q of questions) {
        responsesPayload[q.id] = Number(responses[q.id]);
      }

      await executeTest({
        test_module_code: aqKabbalahDefinition.code,
        input_data: {
          fecha: new Date().toISOString().split("T")[0],
          responses: responsesPayload,
        },
        save_result: true,
      });

      router.push("/dashboard/patient/tests/aq-kabbalah/result");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al enviar el cuestionario.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const groups = [
    questions.slice(0, 10),
    questions.slice(10, 20),
    questions.slice(20, 30),
    questions.slice(30, 40),
    questions.slice(40, 50),
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">{aqKabbalahDefinition.name}</h1>
        <p className="text-sm text-gray-600 mt-2">
          {aqKabbalahDefinition.purpose}. Tiempo estimado: {aqKabbalahDefinition.estimated_time_minutes} minutos.
        </p>
        <p className="text-xs text-gray-500 mt-1">50 afirmaciones — responde si estás de acuerdo o en desacuerdo.</p>
        <p className="text-xs text-gray-500 mt-1">Exploración simbólica no clínica. No constituye diagnóstico.</p>
        <div className="mt-4 text-xs text-gray-500">{answeredCount} de {totalQuestions} respondidas</div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${Math.round((answeredCount / totalQuestions) * 100)}%`,
              backgroundColor: "var(--accent-color)",
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {groups.map((group, gi) => {
        const rangeKey = Object.keys(SUBSCALE_LABELS)[gi];
        return (
          <div key={gi} className="space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-1">
              {SUBSCALE_LABELS[rangeKey]}
            </p>
            {group.map((question, localIdx) => {
              const globalIdx = gi * 10 + localIdx;
              return (
                <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="text-xs text-gray-400 mb-1">{globalIdx + 1}</div>
                  <p className="text-sm text-gray-900">{question.text}</p>
                  <div className="mt-3 flex gap-4">
                    {aqKabbalahDefinition.scale.options.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={String(opt.value)}
                          checked={responses[question.id] === String(opt.value)}
                          onChange={() => handleSelect(question.id, String(opt.value))}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <button
          type="button"
          disabled={!isComplete || submitting}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--accent-color)" }}
        >
          {submitting ? "Enviando..." : "Enviar"}
        </button>
        {!isComplete && (
          <p className="text-xs text-gray-500 mt-2">
            Faltan {totalQuestions - answeredCount} respuesta{totalQuestions - answeredCount !== 1 ? "s" : ""} para enviar.
          </p>
        )}
      </div>
    </div>
  );
}
