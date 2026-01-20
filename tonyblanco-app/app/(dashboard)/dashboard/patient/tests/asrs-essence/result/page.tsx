"use client";

import { useEffect, useMemo, useState } from "react";
import { getTestResults } from "@/lib/test-api";
import type { TestResult } from "@/lib/test-types";

type AsrsPayload = {
  processed?: boolean;
  summary_text?: string;
  structured_data?: {
    score_total?: number;
    rhythm_state?: "anchored" | "fluctuating" | "fragmented";
    atzilut_level?: "high" | "medium" | "low";
    transition_suggestion?: "beriah" | "integration" | "deepening";
  } | null;
};

const rhythmLabels: Record<string, string> = {
  anchored: "Anclado",
  fluctuating: "Fluctuante",
  fragmented: "Fragmentado",
};

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
        const sorted = [...(all || [])].sort((a: any, b: any) => {
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

  const computed = useMemo(() => {
    const payload: any = result?.result_data;
    return (payload?.result ?? payload) as AsrsPayload | null;
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
          <h1 className="text-xl font-semibold text-gray-900">ASRS-Essence</h1>
          <p className="text-sm text-gray-600 mt-2">Aun no hay resultados registrados.</p>
        </div>
      </div>
    );
  }

  const rhythmState = computed.structured_data.rhythm_state || "fragmented";
  const rhythmLabel = rhythmLabels[rhythmState] || rhythmState;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">ASRS-Essence — Resultado</h1>
        {computed.summary_text ? (
          <p className="text-sm text-gray-600 mt-2">{computed.summary_text}</p>
        ) : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
        <div>
          <p className="text-xs text-gray-500">Estado del Ritmo Esencial</p>
          <p className="text-xl font-semibold text-gray-900">{rhythmLabel}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div>
            <span className="text-xs text-gray-500 block">Score total</span>
            <span>{computed.structured_data.score_total ?? "N/A"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Nivel de Atzilut</span>
            <span>{computed.structured_data.atzilut_level ?? "N/A"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Sugerencia de transicion</span>
            <span>{computed.structured_data.transition_suggestion ?? "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 text-xs text-gray-500">
        Resultado orientativo y no diagnostico.
      </div>
    </div>
  );
}
