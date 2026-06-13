"use client";

import { useEffect, useMemo, useState } from "react";
import { getTestResults } from "@/lib/test-api";
import type { TestResult } from "@/lib/test-types";

type Eat26Structured = {
  total_score?: number;
  risk_level?: "low" | "moderate" | "high";
  risk_label?: string;
  dominant_pattern?: string;
  malkhut_keter_disruption?: boolean;
  body_reverence?: boolean;
  gevurah_excess?: boolean;
  transition_suggestion?: string | null;
};

type Eat26Payload = {
  processed?: boolean;
  summary_text?: string;
  structured_data?: Eat26Structured | null;
};

const PATTERN_LABELS: Record<string, string> = {
  restriction: "Restricción — Gevurah excesiva sobre el sustento",
  preoccupation: "Preocupación — Conflicto Malkhut-Keter",
  ritualization: "Ritualización — Binah rígida",
  balanced: "Equilibrado — Chesed-Gevurah en armonía",
};

const TRANSITION_LABELS: Record<string, string> = {
  yetzirah: "Mundo de Ietzirá — exploración emocional",
  beriah: "Mundo de Beriá — reestructuración cognitiva",
};

const DISCLAIMER =
  "Exploración simbólica no clínica. No sustituye diagnóstico médico.";

export default function Eat26SpiritResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: "eat26_spirit" });
        const sorted = [...(all || [])].sort((a: unknown, b: unknown) => {
          const aDate = new Date((a as TestResult).created_at || 0).getTime();
          const bDate = new Date((b as TestResult).created_at || 0).getTime();
          return bDate - aDate;
        });
        setResult(sorted[0] || null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al cargar el resultado.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const computed = useMemo((): Eat26Payload | null => {
    const payload = result?.result_data as Record<string, unknown> | undefined;
    if (!payload) return null;
    return (payload.result ?? payload) as Eat26Payload;
  }, [result]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-600">Cargando resultado...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!result || !computed?.structured_data) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-gray-900">EAT-26-Spirit — Resultado</h1>
          <p className="text-sm text-gray-600 mt-2">Aún no hay resultados registrados.</p>
        </div>
      </div>
    );
  }

  const sd = computed.structured_data;
  const showReferral = sd.risk_level === "high";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          EAT-26-Spirit — Eternal Abundance Threshold · Resultado
        </h1>
        {computed.summary_text ? (
          <p className="text-sm text-gray-600 mt-2">{computed.summary_text}</p>
        ) : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs text-gray-500">Nivel de riesgo</p>
          <p className="text-xl font-semibold text-gray-900">{sd.risk_label ?? sd.risk_level ?? "N/A"}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div>
            <span className="text-xs text-gray-500 block">Puntuación total</span>
            <span>{sd.total_score ?? "N/A"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Patrón dominante</span>
            <span>{PATTERN_LABELS[sd.dominant_pattern ?? ""] ?? sd.dominant_pattern ?? "N/A"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Reverencia corporal</span>
            <span>{sd.body_reverence === true ? "Sí — reverencia presente" : sd.body_reverence === false ? "En desarrollo" : "N/A"}</span>
          </div>
          {sd.transition_suggestion ? (
            <div>
              <span className="text-xs text-gray-500 block">Sugerencia de transición</span>
              <span>{TRANSITION_LABELS[sd.transition_suggestion] ?? sd.transition_suggestion}</span>
            </div>
          ) : null}
        </div>
      </div>

      {showReferral && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            Si esta exploración te genera preocupación, te animamos a compartirlo con tu terapeuta.
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4 text-xs text-gray-500">
        {DISCLAIMER}
      </div>
    </div>
  );
}
