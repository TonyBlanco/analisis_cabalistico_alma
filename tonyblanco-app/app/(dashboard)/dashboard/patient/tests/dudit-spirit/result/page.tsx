"use client";

import { useEffect, useMemo, useState } from "react";
import { getTestResults } from "@/lib/test-api";
import type { TestResult } from "@/lib/test-types";

type DuditStructured = {
  score_total?: number;
  risk_level?: "low" | "medium" | "high";
  usage_pattern?: "exploratory" | "habitual" | "compulsive";
  body_awareness_level?: "low" | "medium" | "high";
  transition_suggestion?: null | "assiah";
  sex_used?: "hombre" | "mujer";
  problematic_threshold?: number;
  referral_recommended?: boolean;
};

type DuditPayload = {
  processed?: boolean;
  summary_text?: string;
  structured_data?: DuditStructured | null;
};

const RISK_LABELS: Record<string, string> = {
  low: "Bajo — Yesod en equilibrio",
  medium: "Uso problemático — Yesod bajo tensión",
  high: "Alto riesgo — Yesod requiere atención urgente",
};

const PATTERN_LABELS: Record<string, string> = {
  exploratory: "Exploratorio — uso ocasional",
  habitual: "Habitual — patrón regular establecido",
  compulsive: "Compulsivo — pérdida de control",
};

const AWARENESS_LABELS: Record<string, string> = {
  low: "Baja — desconexión somática",
  medium: "Media — conciencia en desarrollo",
  high: "Alta — integración corporal presente",
};

const TRANSITION_LABELS: Record<string, string> = {
  assiah: "Mundo de Asiá — trabajo físico-conductual",
};

const DISCLAIMER = "Exploración simbólica no clínica. No sustituye diagnóstico médico.";

export default function DuditSpiritResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: "dudit_spirit" });
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

  const computed = useMemo((): DuditPayload | null => {
    const payload = result?.result_data as Record<string, unknown> | undefined;
    if (!payload) return null;
    return (payload.result ?? payload) as DuditPayload;
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
          <h1 className="text-xl font-semibold text-gray-900">DUDIT-Spirit — Resultado</h1>
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
          DUDIT-Spirit — Divine Unity Drug Introspection · Resultado
        </h1>
        {computed.summary_text ? (
          <p className="text-sm text-gray-600 mt-2">{computed.summary_text}</p>
        ) : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs text-gray-500">Nivel de riesgo</p>
          <p className="text-xl font-semibold text-gray-900">
            {RISK_LABELS[sd.risk_level ?? ""] ?? sd.risk_level ?? "N/A"}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div>
            <span className="text-xs text-gray-500 block">Puntuación total</span>
            <span>{sd.score_total ?? "N/A"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Patrón de uso</span>
            <span>{PATTERN_LABELS[sd.usage_pattern ?? ""] ?? sd.usage_pattern ?? "N/A"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Conciencia del impacto</span>
            <span>{AWARENESS_LABELS[sd.body_awareness_level ?? ""] ?? sd.body_awareness_level ?? "N/A"}</span>
          </div>
          {sd.transition_suggestion ? (
            <div>
              <span className="text-xs text-gray-500 block">Sugerencia de transición</span>
              <span>{TRANSITION_LABELS[sd.transition_suggestion] ?? sd.transition_suggestion}</span>
            </div>
          ) : null}
          {sd.sex_used ? (
            <div>
              <span className="text-xs text-gray-500 block">Umbral aplicado</span>
              <span>
                {sd.sex_used === "mujer" ? "Mujer (≥2 problemático)" : "Hombre (≥6 problemático)"}
              </span>
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
