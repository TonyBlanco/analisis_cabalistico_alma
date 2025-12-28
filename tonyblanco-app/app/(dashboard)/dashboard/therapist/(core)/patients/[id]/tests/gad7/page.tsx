"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://analisis-cabalistico-alma.onrender.com/api";

type GAD7Result = {
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
};

export default function TherapistPatientGad7Page() {
  const params = useParams<{ id: string }>();
  const patientId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GAD7Result | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
          `${API_URL}/tests/results/?test_code=gad-7${patientId ? `&patient_id=${encodeURIComponent(patientId)}` : ""}`,
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
        const items: GAD7Result[] = data?.results || data || [];
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-600">Cargando resultado GAD-7…</p>
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
          <h1 className="text-xl font-semibold text-gray-900">GAD-7 (consultante)</h1>
          <p className="text-sm text-gray-600 mt-2">No hay resultados registrados para este consultante.</p>
        </div>
      </div>
    );
  }

  const progressPercent =
    totalScore !== null && totalScore !== undefined
      ? Math.min(Math.round((totalScore / 21) * 100), 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">GAD-7 — Resultado del consultante</h1>
        <p className="text-sm text-gray-600 mt-2">
          Seguimiento de cribado. Este resultado no es una lectura.
        </p>
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
            <span>Progreso del puntaje (0–21)</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{ width: `${progressPercent}%`, backgroundColor: "var(--accent-color)" }}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Respuestas del consultante</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {Object.entries(rawAnswers).map(([key, value]) => (
              <div key={key} className="rounded-md border border-gray-200 bg-white px-3 py-2">
                <span className="font-medium">{key.toUpperCase()}:</span> <span>{value}</span>
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
          Este resultado no es una lectura.
        </p>
      </div>
    </div>
  );
}
