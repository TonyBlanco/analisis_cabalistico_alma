"use client";

import { useEffect, useMemo, useState } from "react";
import { getTestResults } from "@/lib/test-api";
import type { TestResult } from "@/lib/test-types";

type SubscaleScores = {
  social_skill?: number;
  attention_switching?: number;
  attention_to_detail?: number;
  communication?: number;
  imagination?: number;
};

type AqStructured = {
  total_score?: number;
  subscale_scores?: SubscaleScores;
  screener_positive?: boolean;
  high_positive?: boolean;
  spectrum_label?: "equilibrio_relacional" | "umbral_sefirótico" | "alta_intensidad";
  kabbalistic_reading?: string;
  transition_suggestion?: "beriah" | "yetzirah" | null;
  referral_recommended?: boolean;
};

type AqPayload = {
  processed?: boolean;
  summary_text?: string;
  structured_data?: AqStructured | null;
};

const SPECTRUM_LABELS: Record<string, string> = {
  equilibrio_relacional: "Equilibrio relacional — Chesed-Gevurah en armonía",
  "umbral_sefirótico": "Umbral sefirótico — patrón singular en exploración",
  alta_intensidad: "Alta intensidad — singularidad profunda del árbol",
};

const SUBSCALE_META: { key: keyof SubscaleScores; label: string; sephirot: string }[] = [
  { key: "social_skill", label: "Habilidad Social", sephirot: "Netzach-Hod" },
  { key: "attention_switching", label: "Cambio de Atención", sephirot: "Tiferet-Yesod" },
  { key: "attention_to_detail", label: "Atención al Detalle", sephirot: "Binah-Hokhmah" },
  { key: "communication", label: "Comunicación", sephirot: "Chesed-Gevurah" },
  { key: "imagination", label: "Imaginación", sephirot: "Keter-Malkuth" },
];

const TRANSITION_LABELS: Record<string, string> = {
  beriah: "Mundo de Beriá — reestructuración cognitiva",
  yetzirah: "Mundo de Ietzirá — exploración emocional",
};

const DISCLAIMER = "Exploración simbólica no clínica. No constituye diagnóstico de TEA.";

export default function AqKabbalahResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: "aq_kabbalah" });
        const sorted = [...(all || [])].sort((a: TestResult, b: TestResult) => {
          const ad = new Date(a.created_at || 0).getTime();
          const bd = new Date(b.created_at || 0).getTime();
          return bd - ad;
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

  const computed = useMemo((): AqPayload | null => {
    const payload = result?.result_data as Record<string, unknown> | undefined;
    if (!payload) return null;
    return (payload.result ?? payload) as AqPayload;
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
          <h1 className="text-xl font-semibold text-gray-900">AQ-Kabbalah — Resultado</h1>
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
          AQ-Kabbalah — Espectro de Conciencia · Resultado
        </h1>
        {computed.summary_text ? (
          <p className="text-sm text-gray-600 mt-2">{computed.summary_text}</p>
        ) : null}
      </div>

      {/* Total score + spectrum */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-500">Puntuación total</p>
            <p className="text-4xl font-bold text-gray-900">
              {sd.total_score ?? "—"}<span className="text-base font-normal text-gray-400"> / 50</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Screener</p>
            <p className="text-lg font-semibold text-gray-800">
              {sd.screener_positive ? "Positivo" : "No screener"}
            </p>
          </div>
          {sd.high_positive ? (
            <div>
              <p className="text-xs text-gray-500">Alto positivo</p>
              <p className="text-lg font-semibold text-gray-800">Sí (≥32)</p>
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-xs text-gray-500">Espectro simbólico</p>
          <p className="text-base font-medium text-gray-800">
            {SPECTRUM_LABELS[sd.spectrum_label ?? ""] ?? sd.spectrum_label ?? "N/A"}
          </p>
        </div>

        {sd.kabbalistic_reading ? (
          <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3">
            {sd.kabbalistic_reading}
          </p>
        ) : null}
      </div>

      {/* Subscale breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Subescalas (0-10)</h2>
        <div className="space-y-3">
          {SUBSCALE_META.map(({ key, label, sephirot }) => {
            const score = sd.subscale_scores?.[key] ?? null;
            const pct = score !== null ? Math.round((score / 10) * 100) : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{label} <span className="text-gray-400">({sephirot})</span></span>
                  <span className="font-medium">{score ?? "—"} / 10</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: "var(--accent-color)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sd.transition_suggestion ? (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500">Sugerencia de transición</p>
          <p className="text-sm text-gray-700 mt-1">
            {TRANSITION_LABELS[sd.transition_suggestion] ?? sd.transition_suggestion}
          </p>
        </div>
      ) : null}

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
