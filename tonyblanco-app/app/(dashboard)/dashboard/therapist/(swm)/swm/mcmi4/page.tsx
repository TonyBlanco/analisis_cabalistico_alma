"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { swmMcmi4Api, type WorkspaceInstance } from "@/lib/api/swm-mcmi4-api";
import MCMI4ProcessOrchestrator from "@/components/MCMI4ProcessOrchestrator";

function formatDate(value?: string) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function SwmMcmi4WorkspaceListPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceInstance[]>([]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      setError("Sesión no válida.");
      setLoading(false);
      return;
    }

    const fetchList = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await swmMcmi4Api.listWorkspaces(undefined, token);
        setWorkspaces(resp.workspaces || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "No se pudo listar workspaces.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  const sorted = useMemo(() => {
    return [...workspaces].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [workspaces]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">SWM</p>
            <h1 className="text-2xl font-semibold text-gray-900">MCMI-4 Místico</h1>
            <p className="text-sm text-gray-600 mt-2">
              Orquestación completa del proceso: Asignación → Respuesta → Workspace → Interpretación
            </p>
          </div>
          <Link
            href="/dashboard/therapist"
            className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
          >
            Volver
          </Link>
        </div>
      </div>

      {/* Process Orchestrator - Main Control Panel */}
      <MCMI4ProcessOrchestrator />

      {loading && <p className="text-sm text-gray-600">Cargando workspaces.</p>}

      {error && (
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Historial de Workspaces</h2>
            <p className="text-xs text-gray-500 mt-1">{sorted.length} workspace{sorted.length !== 1 ? 's' : ''} creado{sorted.length !== 1 ? 's' : ''}</p>
          </div>

          {sorted.length === 0 ? (
            <div className="px-6 py-8">
              <p className="text-sm text-gray-600">No hay workspaces MCMI-4 Místico disponibles para tu usuario.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sorted.map((ws) => (
                <div key={ws.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 truncate">{ws.id}</p>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: "var(--accent-color)",
                          color: "var(--accent-color)",
                        }}
                      >
                        {ws.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Consultante: <span className="font-mono">{String(ws.subject_user_id)}</span> · Señal:{" "}
                      <span className="font-mono">{ws.mcmi4_source_data_id}</span>
                    </p>
                    <p className="text-xs text-gray-500">Creado: {formatDate(ws.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/therapist/swm/mcmi4/${encodeURIComponent(ws.id)}`}
                      className="px-3 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "var(--accent-color)" }}
                    >
                      Abrir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

