"use client";

import { useEffect, useMemo, useState } from "react";
import { getTestResults } from "@/lib/test-api";
import type { TestResult } from "@/lib/test-types";

type ShaStructured = {
  total_score?: number;
  risk_zone?: "low" | "moderate" | "high" | "severe";
  zone_label?: string;
  consumption_pattern?: "low_use" | "moderate_use" | "high_frequency";
  gevurah_status?: "intact" | "challenged" | "weakened";
  netzach_status?: "occasional_refuge" | "moderate_refuge" | "excessive_refuge";
  manifestation_impaired?: boolean;
  transition_suggestion?: null | "assiah" | "beriah";
};

type ShaPayload = {
  processed?: boolean;
  summary_text?: string;
  structured_data?: ShaStructured | null;
};

const REFERRAL_ZONES: Array<ShaStructured["risk_zone"]> = ["high", "severe"];

const GEVURAH_LABELS: Record<string, string> = {
  intact: "Íntegra — Gevurah en equilibrio",
  challenged: "En tensión — Gevurah bajo presión",
  weakened: "Debilitada — Gevurah requiere atención",
};

const NETZACH_LABELS: Record<string, string> = {
  occasional_refuge: "Refugio ocasional — Netzach estable",
  moderate_refuge: "Refugio moderado — Netzach en vigilancia",
  excessive_refuge: "Refugio excesivo — Netzach desequilibrado",
};

const DISCLAIMER =
  "Exploración simbólica no clínica. No sustituye diagnóstico médico.";

export default function ShaHarmonyResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: "sha_harmony" });
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

  const computed = useMemo((): ShaPayload | null => {
    const payload = result?.result_data as Record<string, unknown> | undefined;
    if (!payload) return null;
    return (payload.result ?? payload) as ShaPayload;
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
          <h1 className="text-xl font-semibold text-gray-900">SHA — Resultado</h1>
          <p className="text-sm text-gray-600 mt-2">Aún no hay resultados registrados.</p>
        </div>
      </div>
    );
  }

  const sd = computed.structured_data;
  const riskZone = sd.risk_zone ?? "low";
  const showReferral = REFERRAL_ZONES.includes(riskZone);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          SHA — Sephirotic Harmony Audit · Resultado
        </h1>
        {computed.summary_text ? (
          <p className="text-sm text-gray-600 mt-2">{computed.summary_text}</p>
        ) : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs text-gray-500">Zona de riesgo</p>
          <p className="text-xl font-semibold text-gray-900">{sd.zone_label ?? riskZone}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div>
            <span className="text-xs text-gray-500 block">Puntuación total</span>
            <span>{sd.total_score ?? "N/A"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Estado de Gevurah</span>
            <span>{GEVURAH_LABELS[sd.gevurah_status ?? ""] ?? sd.gevurah_status ?? "N/A"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Estado de Netzach</span>
            <span>{NETZACH_LABELS[sd.netzach_status ?? ""] ?? sd.netzach_status ?? "N/A"}</span>
          </div>
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
