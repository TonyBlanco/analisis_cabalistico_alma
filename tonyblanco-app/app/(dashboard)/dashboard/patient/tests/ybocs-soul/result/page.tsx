"use client";

import { useEffect, useMemo, useState } from "react";
import { getTestResults } from "@/lib/test-api";
import type { TestResult } from "@/lib/test-types";

type YbocsStructured = {
  total_score?: number;
  obsession_score?: number;
  compulsion_score?: number;
  severity?: "subclinical" | "mild" | "moderate" | "severe" | "extreme";
  severity_label?: string;
  karmic_pattern?: "thought_dominated" | "ritual_dominated" | "balanced_burden";
  sephirotic_balance?: "gevurah_needed" | "tiferet_active" | "seeking_chesed";
  transition_suggestion?: null | "beriah" | "assiah";
  referral_recommended?: boolean;
};

type YbocsPayload = {
  processed?: boolean;
  summary_text?: string;
  structured_data?: YbocsStructured | null;
};

const PATTERN_LABELS: Record<string, string> = {
  thought_dominated: "Ecos mentales dominantes — Ietzirá superior activa",
  ritual_dominated: "Rituales dominantes — Ietzirá descarga en Asiá",
  balanced_burden: "Carga equilibrada — ambas corrientes presentes",
};

const BALANCE_LABELS: Record<string, string> = {
  gevurah_needed: "Gevurah necesaria — reforzar límites y estructura",
  tiferet_active: "Tiferet activo — camino de integración en marcha",
  seeking_chesed: "Buscando Chesed — expansión y apertura requeridas",
};

const TRANSITION_LABELS: Record<string, string> = {
  beriah: "Mundo de Beriá — reestructuración cognitiva",
  assiah: "Mundo de Asiá — trabajo somático-conductual",
};

const DISCLAIMER = "Exploración simbólica no clínica. No sustituye diagnóstico médico.";

export default function YbocsSoulResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: "ybocs_soul" });
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

  const computed = useMemo((): YbocsPayload | null => {
    const payload = result?.result_data as Record<string, unknown> | undefined;
    if (!payload) return null;
    return (payload.result ?? payload) as YbocsPayload;
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
          <h1 className="text-xl font-semibold text-gray-900">Y-BOCS-Soul — Resultado</h1>
          <p className="text-sm text-gray-600 mt-2">Aún no hay resultados registrados.</p>
        </div>
      </div>
    );
  }

  const sd = computed.structured_data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          Y-BOCS-Soul — Sanctuario del Balance Ietzirático · Resultado
        </h1>
        {computed.summary_text ? (
          <p className="text-sm text-gray-600 mt-2">{computed.summary_text}</p>
        ) : null}
      </div>

      {/* Severity + total */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs text-gray-500">Severidad</p>
          <p className="text-xl font-semibold text-gray-900">{sd.severity_label ?? sd.severity ?? "N/A"}</p>
        </div>

        {/* Subscale breakdown */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="border border-gray-100 rounded p-3">
            <p className="text-xs text-gray-500">Obsesiones</p>
            <p className="text-2xl font-bold text-gray-900">{sd.obsession_score ?? "—"}</p>
            <p className="text-xs text-gray-400">/ 20</p>
          </div>
          <div className="border border-gray-100 rounded p-3">
            <p className="text-xs text-gray-500">Compulsiones</p>
            <p className="text-2xl font-bold text-gray-900">{sd.compulsion_score ?? "—"}</p>
            <p className="text-xs text-gray-400">/ 20</p>
          </div>
          <div className="border border-gray-200 rounded p-3 bg-gray-50">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{sd.total_score ?? "—"}</p>
            <p className="text-xs text-gray-400">/ 40</p>
          </div>
        </div>
      </div>

      {/* Kabbalistic layer */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div>
            <span className="text-xs text-gray-500 block">Patrón kármico</span>
            <span>{PATTERN_LABELS[sd.karmic_pattern ?? ""] ?? sd.karmic_pattern ?? "N/A"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Balance sefirótico</span>
            <span>{BALANCE_LABELS[sd.sephirotic_balance ?? ""] ?? sd.sephirotic_balance ?? "N/A"}</span>
          </div>
          {sd.transition_suggestion ? (
            <div>
              <span className="text-xs text-gray-500 block">Sugerencia de transición</span>
              <span>{TRANSITION_LABELS[sd.transition_suggestion] ?? sd.transition_suggestion}</span>
            </div>
          ) : null}
        </div>
      </div>

      {sd.referral_recommended && (
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
