"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getReflection,
  updateReflection,
  sealReflection,
  REFLECTION_QUESTIONS,
  type ReflectionWorkspace,
} from "@/lib/api/mcmi4-reflection-api";
import { getApiBaseUrl } from "@/lib/api-base";
import { MCMI4_SIGNAL_PUBLIC_NAME } from "@/lib/mcmi4SignalCopy";

type SignalResult = {
  created_at?: string;
  result_data?: {
    total_items?: number;
    mean?: number;
    stdev?: number;
  };
};

const API_BASE = getApiBaseUrl();

async function getSignalTestResultById(testResultId: string): Promise<any | null> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken") || localStorage.getItem("token")
      : null;
  
  // No crash if no token - return null gracefully
  if (!token) {
    console.warn('[getSignalTestResultById] No auth token found');
    return null;
  }

  const res = await fetch(
    `${API_BASE}/tests/results/${encodeURIComponent(testResultId)}/`,
    {
      credentials: 'include',
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (res.status === 401 || res.status === 403) {
    console.warn('[getSignalTestResultById] Auth error:', res.status);
    return null;
  }

  if (!res.ok) {
    throw new Error("No se pudo cargar la señal asociada.");
  }

  return res.json();
}

export default function Mcmi4ReflectionWorkspacePage() {
  const params = useParams<{ workspace_id: string }>();
  const workspaceId = params?.workspace_id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signalResult, setSignalResult] = useState<SignalResult | null>(null);
  const [workspace, setWorkspace] = useState<ReflectionWorkspace | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sealing, setSealing] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const ws = await getReflection(workspaceId);
        setWorkspace(ws);
        setAnswers(ws.artifact?.content.answers || {});

        if (ws.linked_test_result_id) {
          try {
            const signal = await getSignalTestResultById(ws.linked_test_result_id);
            setSignalResult(signal);
          } catch (signalErr) {
            console.warn("No se pudo cargar la señal vinculada:", signalErr);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo cargar la reflexión."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [workspaceId]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!workspace || !unsavedChanges) return;

    try {
      setSaving(true);
      setError(null);
      await updateReflection(workspace.workspace_id, { answers });
      setUnsavedChanges(false);
      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              artifact: prev.artifact
                ? {
                    ...prev.artifact,
                    content: {
                      ...(prev.artifact.content || {}),
                      answers,
                    },
                  }
                : prev.artifact,
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la reflexión");
    } finally {
      setSaving(false);
    }
  };

  const handleSeal = async () => {
    if (!workspace) return;

    const confirmed = confirm(
      "¿Finalizar reflexión? Una vez finalizada, no podrás editarla."
    );
    if (!confirmed) return;

    try {
      setSealing(true);
      setError(null);

      if (unsavedChanges) {
        await updateReflection(workspace.workspace_id, { answers });
        setUnsavedChanges(false);
      }

      await sealReflection(workspace.workspace_id);
      const ws = await getReflection(workspace.workspace_id);
      setWorkspace(ws);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al finalizar la reflexión");
    } finally {
      setSealing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Reflexión personal
          </h1>
          <p className="text-sm text-red-700">{error || "Reflexión no disponible."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Reflexión experiencial
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Espacio personal para reflexionar sobre {MCMI4_SIGNAL_PUBLIC_NAME}.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 border border-gray-200">
            <span className="text-xs font-semibold text-gray-700">Estado</span>
            <span className="text-xs font-medium text-gray-900 capitalize">
              {workspace.status}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 font-mono break-all">
          workspace_id: {workspace.workspace_id}
        </p>
      </div>

      {/* Signal Summary (Read-only Mirror) */}
      {signalResult && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            Tu evaluación
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Fecha:</span>
              <p className="font-medium text-gray-900">
                {signalResult.created_at
                  ? new Date(signalResult.created_at).toLocaleDateString("es-ES")
                  : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Items:</span>
              <p className="font-medium text-gray-900">
                {signalResult.result_data?.total_items || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Media:</span>
              <p className="font-medium text-gray-900">
                {signalResult.result_data?.mean?.toFixed(2) || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Variabilidad:</span>
              <p className="font-medium text-gray-900">
                {signalResult.result_data?.stdev?.toFixed(2) || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {workspace.status === "sealed" ? (
        /* Sealed View (Read-only) */
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium">
              ✓ Reflexión finalizada el{" "}
              {workspace.sealed_at
                ? new Date(workspace.sealed_at).toLocaleDateString("es-ES")
                : ""}
            </p>
          </div>

          {REFLECTION_QUESTIONS.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
            >
              <h3 className="text-sm font-medium text-gray-900 mb-2">{q.text}</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {answers[q.id] || "(Sin respuesta)"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* Draft Edit Mode */
        <>
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              {unsavedChanges ? "✎ Cambios sin guardar" : "✓ Todo guardado"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!unsavedChanges || saving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {REFLECTION_QUESTIONS.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
              >
                <label className="block mb-2">
                  <span className="text-xs text-gray-500">Pregunta {idx + 1}</span>
                  <h3 className="text-sm font-medium text-gray-900 mt-1">
                    {q.text}
                  </h3>
                </label>
                <textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Escribe tu reflexión aquí..."
                />
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  ¿Listo para finalizar?
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Una vez finalizada, no podrás editar tu reflexión.
                </p>
              </div>
              <button
                onClick={handleSeal}
                disabled={sealing}
                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sealing ? "Finalizando..." : "Finalizar Reflexión"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
