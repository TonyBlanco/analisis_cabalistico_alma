"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "@/lib/api-base";
import {
  swmMcmi4Api,
  type ArtifactType,
  type WorkspaceArtifact,
  type WorkspaceInstance,
  type WorkspaceStatusResponse,
  type SymbolicAxis,
} from "@/lib/api/swm-mcmi4-api";
import { getPhaseQuestionIds, type PhaseName } from "@/lib/swm-mcmi4/phase-guides.config";
import SymbolicAxesDisplay from "@/components/SwmMcmi4/SymbolicAxesDisplay";
import PhaseGuidedPanel from "@/components/SwmMcmi4/PhaseGuidedPanel";

const API_URL = getApiBaseUrl();

type MinimalTestResult = {
  id?: number;
  created_at?: string;
  test_id?: string;
  test_module?: number | { id?: number; code?: string; name?: string; public_name?: string };
  input_data?: { responses?: Record<string, number> } & Record<string, unknown>;
  result_data?: Record<string, unknown> | null;
};

function formatDate(value?: string) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

async function fetchTestResultById(id: string, token: string): Promise<MinimalTestResult | null> {
  try {
    const resp = await fetch(`${API_URL}/tests/results/${encodeURIComponent(id)}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });
    if (!resp.ok) {
      // Non-blocking: log warning but return null instead of throwing
      console.warn(`[SWM Workspace] Could not fetch TestResult ${id}: ${resp.status}`);
      return null;
    }
    return resp.json();
  } catch (err) {
    console.warn(`[SWM Workspace] Error fetching TestResult ${id}:`, err);
    return null;
  }
}

export default function SwmMcmi4WorkspacePage() {
  const params = useParams<{ workspace_id: string }>();
  const workspaceId = params?.workspace_id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceInstance | null>(null);
  const [status, setStatus] = useState<WorkspaceStatusResponse | null>(null);
  const [signal, setSignal] = useState<MinimalTestResult | null>(null);
  const [reflection, setReflection] = useState<MinimalTestResult | null>(null);
  // PASO 1: Estado para rastrear el status del workspace de reflexión (sealed/draft)
  const [reflectionWorkspaceStatus, setReflectionWorkspaceStatus] = useState<'sealed' | 'draft' | null>(null);

  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const [phaseText, setPhaseText] = useState<Record<string, string>>({
    discovery: "",
    mapping: "",
    interpretation: "",
    synthesis: "",
  });
  const [phaseSaved, setPhaseSaved] = useState<Record<string, string>>({
    discovery: "",
    mapping: "",
    interpretation: "",
    synthesis: "",
  });
  const [phaseSaving, setPhaseSaving] = useState<Record<string, boolean>>({
    discovery: false,
    mapping: false,
    interpretation: false,
    synthesis: false,
  });
  const [phaseError, setPhaseError] = useState<Record<string, string | null>>({
    discovery: null,
    mapping: null,
    interpretation: null,
    synthesis: null,
  });

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [startMessage, setStartMessage] = useState<string | null>(null);

  const [symbolicAxes, setSymbolicAxes] = useState<SymbolicAxis[] | null>(null);
  const [axesLoading, setAxesLoading] = useState(false);
  const [axesError, setAxesError] = useState<string | null>(null);

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);

  const getLatestText = (artifacts: WorkspaceArtifact[]) => {
    if (!artifacts || artifacts.length === 0) return "";
    const latest = [...artifacts].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
    const text = (latest?.content as any)?.text;
    return typeof text === "string" ? text : "";
  };

  const ensureSessionId = async (token: string): Promise<string> => {
    const current = status?.active_session?.session_id;
    if (current) return current;
    const started = await swmMcmi4Api.startSession({ workspace_id: workspaceId }, token);
    const statusResp = await swmMcmi4Api.getWorkspaceStatus(workspaceId, token);
    setStatus(statusResp);
    return started.session_id;
  };

  const saveArtifactText = async (artifactType: ArtifactType, text: string) => {
    const token = getToken();
    if (!token) throw new Error("Sesión no válida.");
    const sessionId = await ensureSessionId(token);
    await swmMcmi4Api.recordProgress(
      {
        workspace_id: workspaceId,
        session_id: sessionId,
        action: "generate_artifact",
        payload: {
          artifact_type: artifactType,
          content: { text },
        },
      },
      token
    );
  };

  useEffect(() => {
    if (!workspaceId) return;
    const token = getToken();
    if (!token) {
      setError("Sesión no válida.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statusResp, listResp] = await Promise.all([
          swmMcmi4Api.getWorkspaceStatus(workspaceId, token),
          swmMcmi4Api.listWorkspaces(undefined, token),
        ]);
        setStatus(statusResp);

        const ws = (listResp.workspaces || []).find((w) => String(w.id) === String(workspaceId)) || null;
        setWorkspace(ws);

        const artifactsToLoad: Array<{ key: string; type: ArtifactType }> = [
          { key: "notes", type: "notes" },
          { key: "discovery", type: "phase:discovery" },
          { key: "mapping", type: "phase:mapping" },
          { key: "interpretation", type: "phase:interpretation" },
          { key: "synthesis", type: "phase:synthesis" },
        ];

        const artifactResponses = await Promise.all(
          artifactsToLoad.map((a) => swmMcmi4Api.getArtifacts(workspaceId, a.type, token).catch(() => ({ artifacts: [] })))
        );

        const notesText = getLatestText(artifactResponses[0].artifacts || []);
        setNotes(notesText);
        setNotesSaved(notesText);

        setPhaseText({
          discovery: getLatestText(artifactResponses[1].artifacts || []),
          mapping: getLatestText(artifactResponses[2].artifacts || []),
          interpretation: getLatestText(artifactResponses[3].artifacts || []),
          synthesis: getLatestText(artifactResponses[4].artifacts || []),
        });
        setPhaseSaved({
          discovery: getLatestText(artifactResponses[1].artifacts || []),
          mapping: getLatestText(artifactResponses[2].artifacts || []),
          interpretation: getLatestText(artifactResponses[3].artifacts || []),
          synthesis: getLatestText(artifactResponses[4].artifacts || []),
        });

        if (ws?.mcmi4_source_data_id) {
          const tr = await fetchTestResultById(String(ws.mcmi4_source_data_id), token);
          setSignal(tr);
        } else {
          setSignal(null);
        }

        // Fetch reflection TestResult (mcmi4-reflection) by querying results for this user
        if (ws?.subject_user_id) {
          try {
            const reflectionResp = await fetch(`${API_URL}/tests/results/?test_code=mcmi4-reflection&user_id=${ws.subject_user_id}`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
              },
            });
            if (reflectionResp.ok) {
              const reflectionData = await reflectionResp.json();
              const reflectionResults = Array.isArray(reflectionData) ? reflectionData : (reflectionData.results || []);
              if (reflectionResults.length > 0) {
                const latestReflection = reflectionResults.sort((a: any, b: any) => {
                  const aTs = a.created_at ? new Date(a.created_at).getTime() : 0;
                  const bTs = b.created_at ? new Date(b.created_at).getTime() : 0;
                  return bTs - aTs;
                })[0];
                setReflection(latestReflection);
              } else {
                setReflection(null);
              }
            } else {
              setReflection(null);
            }
          } catch {
            setReflection(null);
          }
        } else {
          setReflection(null);
        }

        // PASO 1: Fetch reflection workspace status from SWM endpoint (source of truth for sealed status)
        if (ws?.mcmi4_source_data_id) {
          try {
            const reflWsResp = await fetch(`${API_URL}/swm/mcmi4-reflection/by-signal/${ws.mcmi4_source_data_id}`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
              },
            });
            if (reflWsResp.ok) {
              const reflWsData = await reflWsResp.json();
              setReflectionWorkspaceStatus(reflWsData.status === 'sealed' ? 'sealed' : 'draft');
            } else {
              setReflectionWorkspaceStatus(null);
            }
          } catch {
            setReflectionWorkspaceStatus(null);
          }
        }

        // Load symbolic axes if available
        try {
          const axesResp = await swmMcmi4Api.getArtifacts(workspaceId, 'symbolic_axes', token);
          if (axesResp.artifacts && axesResp.artifacts.length > 0) {
            const latest = axesResp.artifacts.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
            setSymbolicAxes((latest.content as any)?.axes || null);
          } else {
            setSymbolicAxes(null);
          }
        } catch {
          setSymbolicAxes(null);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "No se pudo cargar el workspace.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [workspaceId]);

  const answeredCount = useMemo(() => {
    return Object.keys(signal?.input_data?.responses || {}).length;
  }, [signal]);

  const scaleLabel = "Likert 1–5";

  // (E) Extract normalized signal summary from result_data
  const signalSummary = useMemo(() => {
    const resultData = signal?.result_data;
    if (!resultData || typeof resultData !== 'object') return null;
    const hasSchema = (resultData as any).schema_version === 'mcmi4-signal:v1';
    if (!hasSchema) return null;
    const rd = resultData as any;
    const summary = rd.responses_summary ?? {};
    return {
      total_items: rd.total_items ?? answeredCount,
      scale: rd.scale ?? scaleLabel,
      timestamp: rd.timestamp ?? signal?.created_at,
      mean: summary.mean ?? null,
      stdev: summary.stdev ?? null,
      counts: summary.counts ?? {},
    };
  }, [signal, answeredCount, scaleLabel]);

  const notesDirty = notes !== notesSaved;

  const handleStart = async () => {
    if (!workspaceId) return;
    const token = getToken();
    if (!token) {
      setStartError("Sesión no válida.");
      return;
    }
    setStarting(true);
    setStartError(null);
    setStartMessage(null);
    try {
      const resp = await swmMcmi4Api.startSession({ workspace_id: workspaceId }, token);
      setStartMessage(`Sesión iniciada (${resp.session_id}).`);
      const statusResp = await swmMcmi4Api.getWorkspaceStatus(workspaceId, token);
      setStatus(statusResp);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo iniciar la sesión.";
      // Treat "already has an active session" as success - just refresh status
      if (msg.includes('already has an active session')) {
        try {
          const statusResp = await swmMcmi4Api.getWorkspaceStatus(workspaceId, token);
          setStatus(statusResp);
          setStartMessage("Sesión activa encontrada.");
        } catch {
          setStartError("Error refrescando estado de sesión.");
        }
      } else {
        setStartError(msg);
      }
    } finally {
      setStarting(false);
    }
  };

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    setNotesError(null);
    try {
      await saveArtifactText("notes", notes);
      setNotesSaved(notes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudieron guardar las notas.";
      setNotesError(msg);
    } finally {
      setNotesSaving(false);
    }
  };

  const handleSavePhase = async (phase: "discovery" | "mapping" | "interpretation" | "synthesis") => {
    setPhaseSaving((prev) => ({ ...prev, [phase]: true }));
    setPhaseError((prev) => ({ ...prev, [phase]: null }));
    try {
      await saveArtifactText(`phase:${phase}` as ArtifactType, phaseText[phase] || "");
      setPhaseSaved((prev) => ({ ...prev, [phase]: phaseText[phase] || "" }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo guardar el contenido de fase.";
      setPhaseError((prev) => ({ ...prev, [phase]: msg }));
    } finally {
      setPhaseSaving((prev) => ({ ...prev, [phase]: false }));
    }
  };

  const handleComputeAxes = async () => {
    if (!workspaceId) return;
    const token = getToken();
    if (!token) {
      setAxesError("Sesión no válida.");
      return;
    }
    setAxesLoading(true);
    setAxesError(null);
    try {
      const resp = await swmMcmi4Api.computeSymbolicAxes({ workspace_id: workspaceId }, token);
      setSymbolicAxes(resp.axes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudieron computar los ejes simbólicos.";
      setAxesError(msg);
    } finally {
      setAxesLoading(false);
    }
  };

  const handlePhaseResponseChange = (phase: PhaseName, questionId: string, value: string) => {
    setPhaseText((prev) => {
      const current = prev[phase] || "";
      const lines = current.split('\n\n');
      const questionIds = getPhaseQuestionIds(phase);
      const idx = questionIds.indexOf(questionId);
      if (idx === -1) return prev;
      lines[idx] = value;
      return { ...prev, [phase]: lines.join('\n\n') };
    });
  };

  const getPhaseResponses = (phase: PhaseName): Record<string, string> => {
    const text = phaseText[phase] || "";
    const lines = text.split('\n\n');
    const questionIds = getPhaseQuestionIds(phase);
    const responses: Record<string, string> = {};
    questionIds.forEach((id, idx) => {
      responses[id] = lines[idx] || "";
    });
    return responses;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-600">Cargando workspace.</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error || "Workspace no disponible."}</p>
        </div>
        <Link
          href="/dashboard/therapist/swm/mcmi4"
          className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200 inline-block"
        >
          Volver a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace SWM</p>
            <h1 className="text-2xl font-semibold text-gray-900 truncate">MCMI-4 Místico</h1>
            <p className="text-xs text-gray-500 mt-2 font-mono break-all">workspace_id: {workspaceId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/therapist/swm/mcmi4"
              className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
            >
              Volver a lista
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Consultante</p>
            <p className="text-sm font-medium text-gray-900 font-mono break-all">{String(status.subject_user_id)}</p>
          </div>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">TestResult (mcmi4-signal)</p>
            <p className="text-sm font-medium text-gray-900 font-mono break-all">
              {workspace?.mcmi4_source_data_id ? String(workspace.mcmi4_source_data_id) : "N/A"}
            </p>
          </div>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Estado</p>
            <p className="text-sm font-medium text-gray-900">{status.status}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Señal asociada</h2>
            <p className="text-xs text-gray-500">Resumen mínimo (sin preguntas, sin scoring clínico).</p>
          </div>
          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="px-3 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--accent-color)" }}
          >
            {starting ? "Iniciando." : "Iniciar interpretación"}
          </button>
        </div>

        {startError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{startError}</div>
        )}
        {startMessage && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {startMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-md border border-gray-200 p-4">
            <p className="text-xs text-gray-500">TestResult ID</p>
            <p className="text-lg font-semibold text-gray-900">{signal?.id ?? "N/A"}</p>
          </div>
          <div className="rounded-md border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total items</p>
            <p className="text-lg font-semibold text-gray-900">
              {signalSummary?.total_items ?? answeredCount}
            </p>
          </div>
          <div className="rounded-md border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Escala usada</p>
            <p className="text-sm font-medium text-gray-900">
              {signalSummary?.scale ?? scaleLabel}
            </p>
          </div>
        </div>

        {signalSummary && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-700 mb-2">Resumen normalizado (mcmi4-signal:v1)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {signalSummary.mean !== null && (
                <div>
                  <span className="text-xs text-gray-600">Media normalizada: </span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(signalSummary.mean * 100)}%
                  </span>
                </div>
              )}
              {signalSummary.stdev !== null && (
                <div>
                  <span className="text-xs text-gray-600">Desviación estándar: </span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(signalSummary.stdev * 100)}%
                  </span>
                </div>
              )}
            </div>
            {signalSummary.counts && Object.keys(signalSummary.counts).length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Distribución de respuestas:</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(signalSummary.counts).map(([key, count]) => (
                    <span
                      key={key}
                      className="text-xs bg-white border border-gray-200 px-2 py-1 rounded"
                    >
                      {key}: {String(count)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">test_module</p>
              <p className="text-sm font-medium text-gray-900 font-mono">mcmi4-signal</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">timestamp</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(signalSummary?.timestamp ?? signal?.created_at)}
              </p>
            </div>
          </div>
        </div>

        {status.active_session ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Sesión activa</p>
            <p className="text-sm font-medium text-gray-900 font-mono break-all">{status.active_session.session_id}</p>
            <p className="text-xs text-gray-500 mt-1">
              Fase: {status.active_session.current_phase} · Interacciones: {status.active_session.interactions_count}
            </p>
          </div>
        ) : (
          <button
            onClick={handleStart}
            disabled={starting}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {starting ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        )}

        {startError && <p className="text-sm text-red-600">{startError}</p>}
        {startMessage && <p className="text-sm text-green-600">{startMessage}</p>}
      </div>

      {/* Reflexión del Consultante */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Reflexión del Consultante</h3>
        {reflection ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-xs text-gray-500">TestResult ID</p>
                <p className="text-lg font-semibold text-gray-900">{reflection.id ?? "N/A"}</p>
              </div>
              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Fecha de envío</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(reflection.created_at)}</p>
              </div>
            </div>

            {(() => {
              const reflectionData = reflection.result_data as any;
              const hasReflectionSchema = reflectionData?.schema_version === 'mcmi4-reflection:v1';
              if (!hasReflectionSchema) {
                return (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      Formato de reflexión no reconocido (schema_version esperado: mcmi4-reflection:v1)
                    </p>
                  </div>
                );
              }

              const questions = reflectionData.questions || [];
              const answers = reflectionData.answers || {};

              return (
                <div className="space-y-4">
                  <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                    <p className="text-xs font-medium text-purple-700 mb-1">
                      Schema: {reflectionData.schema_version}
                    </p>
                    <p className="text-xs text-purple-600">
                      Total preguntas: {questions.length}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {questions.map((question: string, index: number) => {
                      const qKey = `q${index + 1}`;
                      const answer = answers[qKey] || "(sin respuesta)";
                      return (
                        <div key={qKey} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                          <p className="text-sm font-medium text-gray-900 mb-2">
                            {index + 1}. {question}
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {answer}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : reflectionWorkspaceStatus === 'sealed' ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-800">
              ✓ Reflexión del consultante completada y disponible para consulta.
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Puedes acceder a la reflexión desde el panel de gestión de pacientes.
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              El consultante aún no ha completado la reflexión. La reflexión es un requisito para trabajar en el workspace.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {/* PASO 2: Bloque de orientación UX estático para el terapeuta — ANTES DE FASE 1 */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5">
            <h4 className="text-base font-semibold text-indigo-900 mb-3">Guía del Proceso Interpretativo</h4>
            <div className="text-sm text-indigo-800 space-y-2">
              <p>1. La señal y la reflexión ya están completas.</p>
              <p>2. Ahora interpretas desde los Cuatro Mundos.</p>
              <p>3. No diagnosticas: acompañas, comprendes, integras.</p>
              <p>4. El ritmo lo marcas tú. No hay pasos automáticos.</p>
            </div>
          </div>

          <PhaseGuidedPanel
            phase="discovery"
            responses={getPhaseResponses('discovery')}
            onResponseChange={(qId, val) => handlePhaseResponseChange('discovery', qId, val)}
            onSave={() => handleSavePhase('discovery')}
            saving={phaseSaving.discovery}
            saved={phaseText.discovery === phaseSaved.discovery}
            error={phaseError.discovery}
          />

          <PhaseGuidedPanel
            phase="mapping"
            responses={getPhaseResponses('mapping')}
            onResponseChange={(qId, val) => handlePhaseResponseChange('mapping', qId, val)}
            onSave={() => handleSavePhase('mapping')}
            saving={phaseSaving.mapping}
            saved={phaseText.mapping === phaseSaved.mapping}
            error={phaseError.mapping}
          />

          {/* PASO FUTURO — IA ASISTIVA (DESACTIVADO)
             Aquí se sugerirán preguntas interpretativas opcionales,
             sin scoring, sin diagnóstico, bajo control del terapeuta. 
          */}

          <PhaseGuidedPanel
            phase="interpretation"
            responses={getPhaseResponses('interpretation')}
            onResponseChange={(qId, val) => handlePhaseResponseChange('interpretation', qId, val)}
            onSave={() => handleSavePhase('interpretation')}
            saving={phaseSaving.interpretation}
            saved={phaseText.interpretation === phaseSaved.interpretation}
            error={phaseError.interpretation}
          />

          <PhaseGuidedPanel
            phase="synthesis"
            responses={getPhaseResponses('synthesis')}
            onResponseChange={(qId, val) => handlePhaseResponseChange('synthesis', qId, val)}
            onSave={() => handleSavePhase('synthesis')}
            saving={phaseSaving.synthesis}
            saved={phaseText.synthesis === phaseSaved.synthesis}
            error={phaseError.synthesis}
          />
        </div>

        <div className="space-y-6">
          <SymbolicAxesDisplay
            axes={symbolicAxes}
            loading={axesLoading}
            error={axesError}
            onCompute={handleComputeAxes}
          />

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-900">Notas del terapeuta</h3>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={notesSaving}
                className="px-3 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--accent-color)" }}
              >
                {notesSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
            <p className={`text-xs ${notesDirty ? "text-amber-700" : "text-emerald-700"}`}>
              {notesDirty ? "Sin guardar" : "Guardado"}
            </p>
            {notesError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">{notesError}</div>
            )}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="Notas generales del workspace (libres)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
