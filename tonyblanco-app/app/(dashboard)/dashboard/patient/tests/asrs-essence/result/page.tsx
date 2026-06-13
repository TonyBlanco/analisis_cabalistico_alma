"use client";

import { useEffect, useMemo, useState } from "react";
import { getTestResults } from "@/lib/test-api";
import type { TestResult } from "@/lib/test-types";

type AsrsStructured = {
  zone_count?: number;
  items_in_zone?: string[];
  screener_positive?: boolean;
  tiferet_state?: "anchored" | "fluctuating" | "fragmented";
  kabbalistic_reading?: string;
  transition_suggestion?: "assiah" | "yetzirah" | null;
  referral_recommended?: boolean;
};

type AsrsPayload = {
  processed?: boolean;
  summary_text?: string;
  structured_data?: AsrsStructured | null;
};

const TIFERET_LABELS: Record<string, string> = {
  anchored: "Anclado — Tiferet en equilibrio",
  fluctuating: "Fluctuante — Tiferet en proceso de integración",
  fragmented: "Fragmentado — Tiferet bajo tensión",
};

const TRANSITION_LABELS: Record<string, string> = {
  assiah: "Mundo de Asiá — arraigo somático y conductual",
  yetzirah: "Mundo de Ietzirá — exploración emocional",
};

const DISCLAIMER = "Exploración simbólica no clínica. No constituye diagnóstico de TDAH.";

export default function AsrsEssenceResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: "asrs_essence" });
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

  const computed = useMemo((): AsrsPayload | null => {
    const payload = result?.result_data as Record<string, unknown> | undefined;
    if (!payload) return null;
    return (payload.result ?? payload) as AsrsPayload;
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
          <h1 className="text-xl font-semibold text-gray-900">ASRS-Essence — Resultado</h1>
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
          ASRS-Essence — Conciencia Esencial · Resultado
        </h1>
        {computed.summary_text ? (
          <p className="text-sm text-gray-600 mt-2">{computed.summary_text}</p>
        ) : null}
      </div>

      {/* Screener result */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-500">Resultado del screener</p>
            <p className="text-xl font-semibold text-gray-900">
              {sd.screener_positive ? "Positivo" : "No screener"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ítems en zona positiva</p>
            <p className="text-3xl font-bold text-gray-900">
              {sd.zone_count ?? "—"}<span className="text-base font-normal text-gray-400"> / 6</span>
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">Estado de Tiferet</p>
          <p className="text-base font-medium text-gray-800">
            {TIFERET_LABELS[sd.tiferet_state ?? ""] ?? sd.tiferet_state ?? "N/A"}
          </p>
        </div>

        {sd.kabbalistic_reading ? (
          <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3">
            {sd.kabbalistic_reading}
          </p>
        ) : null}

        {sd.transition_suggestion ? (
          <div>
            <p className="text-xs text-gray-500">Sugerencia de transición</p>
            <p className="text-sm text-gray-700">
              {TRANSITION_LABELS[sd.transition_suggestion] ?? sd.transition_suggestion}
            </p>
          </div>
        ) : null}
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
