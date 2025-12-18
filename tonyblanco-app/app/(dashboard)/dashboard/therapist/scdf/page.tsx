"use client";

import { useEffect, useMemo, useState } from "react";
import { getActivePatientId, getActivePatientName } from "@/lib/active-patient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://analisis-cabalistico-alma.onrender.com/api";

type ResultBase = {
  id?: number;
  created_at?: string;
  result_data?: {
    total_score?: number;
    severity_label?: string;
    flags?: Record<string, any>;
  };
  score?: number;
  clinical_diagnosis?: string;
};

export default function ScdfPlaceholderPage() {
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [activePatientName, setActivePatientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultsPhq, setResultsPhq] = useState<ResultBase[]>([]);
  const [resultsGad, setResultsGad] = useState<ResultBase[]>([]);
  const [resultsBai, setResultsBai] = useState<ResultBase[]>([]);
  const [resultsIsi, setResultsIsi] = useState<ResultBase[]>([]);
  const [resultsBdi, setResultsBdi] = useState<ResultBase[]>([]);

  useEffect(() => {
    const id = getActivePatientId();
    const name = getActivePatientName();
    setActivePatientId(id);
    setActivePatientName(name);
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      setError("Sesión no válida.");
      return;
    }
    if (!activePatientId) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchByCode = async (code: string) => {
          const response = await fetch(
            `${API_URL}/tests/results/?test_code=${code}&patient_id=${encodeURIComponent(
              String(activePatientId)
            )}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error(`No se pudieron obtener resultados ${code}.`);
          }
          const data = await response.json();
          const items: ResultBase[] = data?.results || data || [];
          items.sort((a, b) => {
            const da = a.created_at ? new Date(a.created_at).getTime() : 0;
            const db = b.created_at ? new Date(b.created_at).getTime() : 0;
            return db - da;
          });
          return items;
        };

        const [phqItems, gadItems, baiItems, isiItems, bdiItems] = await Promise.all([
          fetchByCode("phq-9"),
          fetchByCode("gad-7"),
          fetchByCode("bai"),
          fetchByCode("isi"),
          fetchByCode("bdi-ii")
        ]);

        setResultsPhq(phqItems);
        setResultsGad(gadItems);
        setResultsBai(baiItems);
        setResultsIsi(isiItems);
        setResultsBdi(bdiItems);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al cargar resultados.";
        setError(msg);
        setResultsPhq([]);
        setResultsGad([]);
        setResultsBai([]);
        setResultsIsi([]);
        setResultsBdi([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [activePatientId]);

  const latestPhq = useMemo(() => (resultsPhq.length > 0 ? resultsPhq[0] : null), [resultsPhq]);
  const latestGad = useMemo(() => (resultsGad.length > 0 ? resultsGad[0] : null), [resultsGad]);
  const latestBai = useMemo(() => (resultsBai.length > 0 ? resultsBai[0] : null), [resultsBai]);
  const latestIsi = useMemo(() => (resultsIsi.length > 0 ? resultsIsi[0] : null), [resultsIsi]);
  const latestBdi = useMemo(() => (resultsBdi.length > 0 ? resultsBdi[0] : null), [resultsBdi]);

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    try {
      return new Date(value).toLocaleDateString("es-ES");
    } catch {
      return value;
    }
  };

  const phqTotal = latestPhq?.result_data?.total_score ?? latestPhq?.score ?? null;
  const phqSeverity = latestPhq?.result_data?.severity_label ?? latestPhq?.clinical_diagnosis ?? null;
  const phqSuicidal = latestPhq?.result_data?.flags?.suicidal_ideation === true;

  const gadTotal = latestGad?.result_data?.total_score ?? latestGad?.score ?? null;
  const gadSeverity = latestGad?.result_data?.severity_label ?? latestGad?.clinical_diagnosis ?? null;

  const baiTotal = latestBai?.result_data?.total_score ?? latestBai?.score ?? null;
  const baiSeverity = latestBai?.result_data?.severity_label ?? latestBai?.clinical_diagnosis ?? null;

  const isiTotal = latestIsi?.result_data?.total_score ?? latestIsi?.score ?? null;
  const isiSeverity = latestIsi?.result_data?.severity_label ?? latestIsi?.clinical_diagnosis ?? null;

  const bdiTotal = latestBdi?.result_data?.total_score ?? latestBdi?.score ?? null;
  const bdiSeverity = latestBdi?.result_data?.severity_label ?? latestBdi?.clinical_diagnosis ?? null;
  const bdiSuicidal = latestBdi?.result_data?.flags?.suicidal_ideation === true;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          Seguimiento Clínico (SCDF) — Vista Preliminar
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Esta vista muestra resultados clínicos reales. El motor SCDF se integrará en fases posteriores.
        </p>
        {activePatientName && (
          <p className="text-sm text-gray-500 mt-1">
            Paciente activo: <span className="font-medium">{activePatientName}</span>
          </p>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">PHQ-9</h2>
            <span className="text-xs text-gray-500">Sólo lectura</span>
          </div>
          {loading && <p className="text-sm text-gray-600">Cargando resultados...</p>}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {!loading && !error && !activePatientId && (
            <p className="text-sm text-gray-600">Selecciona un paciente activo para ver resultados.</p>
          )}
          {!loading && !error && activePatientId && resultsPhq.length === 0 && (
            <p className="text-sm text-gray-600">PHQ-9 aún no realizado por el paciente.</p>
          )}

          {!loading && !error && latestPhq && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-sm text-gray-900">{formatDate(latestPhq.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Puntaje total</p>
                  <p className="text-xl font-semibold text-gray-900">{phqTotal ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Severidad</p>
                  <p className="text-sm font-medium text-gray-900">{phqSeverity ?? "N/A"}</p>
                </div>
                {phqSuicidal && (
                  <div className="rounded-full px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800">
                    Ítem 9 con respuesta positiva (revisar con calma)
                  </div>
                )}
              </div>

              {resultsPhq.length > 1 && (
                <div className="border-t border-gray-200 pt-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Timeline PHQ-9</h3>
                  <div className="space-y-2">
                    {resultsPhq.map((item) => {
                      const score = item.result_data?.total_score ?? item.score ?? "N/A";
                      const sev = item.result_data?.severity_label ?? item.clinical_diagnosis ?? "N/A";
                      const isSuicidal = item.result_data?.flags?.suicidal_ideation === true;
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-gray-100 bg-white px-3 py-2"
                        >
                          <div className="text-sm text-gray-800">
                            {formatDate(item.created_at)}
                          </div>
                          <div className="text-sm text-gray-800">Puntaje: {score}</div>
                          <div className="text-xs text-gray-600">Severidad: {sev}</div>
                          {isSuicidal && (
                            <span className="text-xs text-amber-700">Ítem 9 positivo</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">GAD-7</h2>
            <span className="text-xs text-gray-500">Sólo lectura</span>
          </div>
          {loading && <p className="text-sm text-gray-600">Cargando resultados...</p>}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {!loading && !error && !activePatientId && (
            <p className="text-sm text-gray-600">Selecciona un paciente activo para ver resultados.</p>
          )}
          {!loading && !error && activePatientId && resultsGad.length === 0 && (
            <p className="text-sm text-gray-600">GAD-7 aún no realizado por el paciente.</p>
          )}

          {!loading && !error && latestGad && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-sm text-gray-900">{formatDate(latestGad.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Puntaje total</p>
                  <p className="text-xl font-semibold text-gray-900">{gadTotal ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Severidad</p>
                  <p className="text-sm font-medium text-gray-900">{gadSeverity ?? "N/A"}</p>
                </div>
              </div>

              {resultsGad.length > 1 && (
                <div className="border-t border-gray-200 pt-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Timeline GAD-7</h3>
                  <div className="space-y-2">
                    {resultsGad.map((item) => {
                      const score = item.result_data?.total_score ?? item.score ?? "N/A";
                      const sev = item.result_data?.severity_label ?? item.clinical_diagnosis ?? "N/A";
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-gray-100 bg-white px-3 py-2"
                        >
                          <div className="text-sm text-gray-800">
                            {formatDate(item.created_at)}
                          </div>
                          <div className="text-sm text-gray-800">Puntaje: {score}</div>
                          <div className="text-xs text-gray-600">Severidad: {sev}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">BAI</h2>
            <span className="text-xs text-gray-500">Sólo lectura</span>
          </div>
          {loading && <p className="text-sm text-gray-600">Cargando resultados...</p>}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {!loading && !error && !activePatientId && (
            <p className="text-sm text-gray-600">Selecciona un paciente activo para ver resultados.</p>
          )}
          {!loading && !error && activePatientId && resultsBai.length === 0 && (
            <p className="text-sm text-gray-600">BAI aún no realizado por el paciente.</p>
          )}

          {!loading && !error && latestBai && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-sm text-gray-900">{formatDate(latestBai.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Puntaje total</p>
                  <p className="text-xl font-semibold text-gray-900">{baiTotal ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Severidad</p>
                  <p className="text-sm font-medium text-gray-900">{baiSeverity ?? "N/A"}</p>
                </div>
              </div>

              {resultsBai.length > 1 && (
                <div className="border-t border-gray-200 pt-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Timeline BAI</h3>
                  <div className="space-y-2">
                    {resultsBai.map((item) => {
                      const score = item.result_data?.total_score ?? item.score ?? "N/A";
                      const sev = item.result_data?.severity_label ?? item.clinical_diagnosis ?? "N/A";
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-gray-100 bg-white px-3 py-2"
                        >
                          <div className="text-sm text-gray-800">
                            {formatDate(item.created_at)}
                          </div>
                          <div className="text-sm text-gray-800">Puntaje: {score}</div>
                          <div className="text-xs text-gray-600">Severidad: {sev}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">ISI</h2>
            <span className="text-xs text-gray-500">Sólo lectura</span>
          </div>
          {loading && <p className="text-sm text-gray-600">Cargando resultados...</p>}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {!loading && !error && !activePatientId && (
            <p className="text-sm text-gray-600">Selecciona un paciente activo para ver resultados.</p>
          )}
          {!loading && !error && activePatientId && resultsIsi.length === 0 && (
            <p className="text-sm text-gray-600">ISI aún no realizado por el paciente.</p>
          )}

          {!loading && !error && latestIsi && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-sm text-gray-900">{formatDate(latestIsi.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Puntaje total</p>
                  <p className="text-xl font-semibold text-gray-900">{isiTotal ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Severidad</p>
                  <p className="text-sm font-medium text-gray-900">{isiSeverity ?? "N/A"}</p>
                </div>
              </div>

              {resultsIsi.length > 1 && (
                <div className="border-t border-gray-200 pt-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Timeline ISI</h3>
                  <div className="space-y-2">
                    {resultsIsi.map((item) => {
                      const score = item.result_data?.total_score ?? item.score ?? "N/A";
                      const sev = item.result_data?.severity_label ?? item.clinical_diagnosis ?? "N/A";
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-gray-100 bg-white px-3 py-2"
                        >
                          <div className="text-sm text-gray-800">
                            {formatDate(item.created_at)}
                          </div>
                          <div className="text-sm text-gray-800">Puntaje: {score}</div>
                          <div className="text-xs text-gray-600">Severidad: {sev}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">BDI-II</h2>
            <span className="text-xs text-gray-500">Sólo lectura</span>
          </div>
          {loading && <p className="text-sm text-gray-600">Cargando resultados...</p>}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {!loading && !error && !activePatientId && (
            <p className="text-sm text-gray-600">Selecciona un paciente activo para ver resultados.</p>
          )}
          {!loading && !error && activePatientId && resultsBdi.length === 0 && (
            <p className="text-sm text-gray-600">BDI-II aún no realizado por el paciente.</p>
          )}

          {!loading && !error && latestBdi && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-sm text-gray-900">{formatDate(latestBdi.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Puntaje total</p>
                  <p className="text-xl font-semibold text-gray-900">{bdiTotal ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Severidad</p>
                  <p className="text-sm font-medium text-gray-900">{bdiSeverity ?? "N/A"}</p>
                </div>
                {bdiSuicidal && (
                  <div className="rounded-full px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800">
                    Ideación suicida (ítem) positiva
                  </div>
                )}
              </div>

              {resultsBdi.length > 1 && (
                <div className="border-t border-gray-200 pt-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Timeline BDI-II</h3>
                  <div className="space-y-2">
                    {resultsBdi.map((item) => {
                      const score = item.result_data?.total_score ?? item.score ?? "N/A";
                      const sev = item.result_data?.severity_label ?? item.clinical_diagnosis ?? "N/A";
                      const isSuicidal = item.result_data?.flags?.suicidal_ideation === true;
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-gray-100 bg-white px-3 py-2"
                        >
                          <div className="text-sm text-gray-800">
                            {formatDate(item.created_at)}
                          </div>
                          <div className="text-sm text-gray-800">Puntaje: {score}</div>
                          <div className="text-xs text-gray-600">Severidad: {sev}</div>
                          {isSuicidal && (
                            <span className="text-xs text-amber-700">Ítem ideación suicida</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
