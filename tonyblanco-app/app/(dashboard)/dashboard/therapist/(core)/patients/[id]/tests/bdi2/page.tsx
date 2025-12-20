"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://analisis-cabalistico-alma.onrender.com/api";

type BDI2Result = {
  id?: number;
  result_data?: {
    total_score?: number;
    severity_label?: string;
    flags?: Record<string, boolean>;
    raw_answers?: Record<string, number>;
  };
  input_data?: { answers?: Record<string, number> };
  details?: { raw_answers?: Record<string, number> };
  score?: number;
  clinical_diagnosis?: string;
  notes?: string;
  created_at?: string;
};

export default function TherapistPatientBdi2Page() {
  const params = useParams<{ id: string }>();
  const patientId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BDI2Result | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      setError("Sesión no válida.");
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_URL}/tests/results/?test_code=bdi-ii${patientId ? `&patient_id=${encodeURIComponent(patientId)}` : ""}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("No se pudo obtener el resultado.");
        }
        const data = await response.json();
        const items: BDI2Result[] = data?.results || data || [];
        if (items.length === 0) {
          setResult(null);
          setNotes("");
        } else {
          setResult(items[0]);
          setNotes(items[0]?.notes || "");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al cargar el resultado.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [patientId]);

  const totalScore = useMemo(() => {
    return result?.result_data?.total_score ?? result?.score ?? null;
  }, [result]);

  const severity = useMemo(() => {
    return result?.result_data?.severity_label ?? result?.clinical_diagnosis ?? null;
  }, [result]);

  const suicidalFlag = result?.result_data?.flags?.suicidal_ideation === true;
  const rawAnswers =
    result?.result_data?.raw_answers ||
    result?.details?.raw_answers ||
    result?.input_data?.answers ||
    {};

  const handleSaveNotes = async () => {
    if (!result?.id) {
      setMessage({ type: "error", text: "No hay resultado para guardar notas." });
      return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      setMessage({ type: "error", text: "Sesión no válida." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const resp = await fetch(`${API_URL}/tests/results/${result.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ notes }),
      });
      if (!resp.ok) {
        throw new Error("No se pudieron guardar las notas.");
      }
      setMessage({ type: "success", text: "Notas guardadas correctamente." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudieron guardar las notas.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    try {
      return new Date(value).toLocaleDateString("es-ES");
    } catch {
      return value;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-600">Cargando resultado BDI-II…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-gray-900">BDI-II (paciente)</h1>
          <p className="text-sm text-gray-600 mt-2">No hay resultados registrados para este paciente.</p>
        </div>
      </div>
    );
  }

  const progressPercent =
    totalScore !== null && totalScore !== undefined
      ? Math.min(Math.round((totalScore / 63) * 100), 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">BDI-II — Resultado del paciente</h1>
          <p className="text-sm text-gray-600 mt-1">
            Seguimiento de cribado. Este resultado no es un diagnóstico.
          </p>
          <p className="text-xs text-gray-500">Fecha: {formatDate(result.created_at)}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowGuidance(true)}
          className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--accent-color)" }}
        >
          Guía clínica BDI-II
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Puntaje total</p>
            <p className="text-3xl font-semibold text-gray-900">{totalScore ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Severidad</p>
            <p className="text-lg font-medium text-gray-900">{severity ?? "N/A"}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Progreso del puntaje (0–63)</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{ width: `${progressPercent}%`, backgroundColor: "var(--accent-color)" }}
            />
          </div>
        </div>

        {suicidalFlag && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Respuestas positivas en ítem de ideación suicida. Requiere valoración clínica según protocolo.
            </p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Respuestas del paciente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {Object.entries(rawAnswers).map(([key, value]) => (
              <div key={key} className={`rounded-md border px-3 py-2 ${key === "q9" ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"}`}>
                <span className="font-medium">{key.toUpperCase()}:</span> <span>{value}</span>
                {key === "q9" && value > 0 && (
                  <span className="ml-2 text-xs text-amber-700">(Destacado)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Notas del terapeuta</h3>
          {message && (
            <div
              className={`rounded-md border p-3 text-sm ${
                message.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Notas clínicas (solo visible para el terapeuta)"
          />
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--accent-color)" }}
          >
            {saving ? "Guardando…" : "Guardar notas"}
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Este resultado no es un diagnóstico.
        </p>
      </div>

      {showGuidance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowGuidance(false)}>
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Guía clínica BDI-II</h3>
                <p className="text-xs text-gray-500">Instrumento de severidad, no diagnóstico.</p>
              </div>
              <button
                onClick={() => setShowGuidance(false)}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>¿Qué mide? Severidad de síntomas depresivos en adultos/adolescentes mayores.</p>
              <p>Interpretación (0–63): mínima (0–13), leve (14–19), moderada (20–28), grave (29–63).</p>
              <p>Diferencias vs PHQ-9: mayor detalle sintomático y énfasis en severidad.</p>
              <p>Considerar evaluación adicional ante puntajes moderados/altos o ítem de ideación suicida.</p>
              <p>Recordatorio: herramienta de cribado; interpretar siempre con juicio clínico.</p>
            </div>
            <div className="text-xs text-gray-500">
              Uso informativo. No genera decisiones automáticas ni recomendaciones.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
