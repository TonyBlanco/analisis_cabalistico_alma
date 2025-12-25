'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTestResults } from '@/lib/test-api';
import type { TestResult } from '@/lib/test-types';

type ScreeningComputed = {
  puntuaciones?: {
    indice_malestar_0_100?: number;
    nivel?: string;
    dominios?: Record<string, { avg_0_3?: number; sum_0_3n?: number }>;
  };
  interpretacion?: {
    resumen?: string;
    areas_enfoque?: string[];
    nota?: string;
  };
  alertas?: {
    ideacion_autolesion?: boolean;
    nivel_item_s10?: number;
  };
  recomendaciones?: string[];
};

function getComputed(result: TestResult | null): ScreeningComputed | null {
  const payload: any = result?.result_data;
  const computed = payload?.result ?? payload;
  return computed || null;
}

export default function ScreeningGeneralResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: 'screening-general' });
        const sorted = [...(all || [])].sort((a: any, b: any) => {
          const ad = new Date(a.created_at || 0).getTime();
          const bd = new Date(b.created_at || 0).getTime();
          return bd - ad;
        });
        setResult(sorted[0] || null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al cargar el resultado.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const computed = useMemo(() => getComputed(result), [result]);
  const index = computed?.puntuaciones?.indice_malestar_0_100 ?? null;
  const tier = computed?.puntuaciones?.nivel ?? null;
  const safety = computed?.alertas?.ideacion_autolesion ?? false;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-600">Cargando resultado…</p>
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

  if (!result || !computed) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-gray-900">Screening Psicológico General</h1>
          <p className="text-sm text-gray-600 mt-2">Aún no hay resultados registrados.</p>
        </div>
      </div>
    );
  }

  const progressPercent = index !== null ? Math.max(0, Math.min(index, 100)) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Screening Psicológico General — Resultado</h1>
        <p className="text-sm text-gray-600 mt-2">Cuestionario orientativo. No constituye diagnóstico.</p>
      </div>

      {safety && (
        <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-800">Alerta importante</h2>
          <p className="text-sm text-red-700 mt-2">
            Si estás en riesgo o te sientes en peligro, busca ayuda inmediata (emergencias o una línea de crisis local)
            y contacta a tu terapeuta o a un profesional lo antes posible.
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Índice de malestar</p>
            <p className="text-3xl font-semibold text-gray-900">{index ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Nivel</p>
            <p className="text-lg font-medium text-gray-900">{tier ?? 'N/A'}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Progreso (0–100)</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{ width: `${progressPercent}%`, backgroundColor: 'var(--accent-color)' }}
            />
          </div>
        </div>

        {computed?.interpretacion?.resumen && (
          <p className="text-sm text-gray-700">{computed.interpretacion.resumen}</p>
        )}
        {computed?.interpretacion?.nota && (
          <p className="text-xs text-gray-500">{computed.interpretacion.nota}</p>
        )}
      </div>

      {computed?.interpretacion?.areas_enfoque?.length ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Áreas de enfoque</h2>
          <p className="text-sm text-gray-700">{computed.interpretacion.areas_enfoque.join(', ')}</p>
        </div>
      ) : null}

      {computed?.recomendaciones?.length ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Siguientes pasos sugeridos</h2>
          <ul className="list-disc pl-5 space-y-1">
            {computed.recomendaciones.map((r) => (
              <li key={r} className="text-sm text-gray-700">{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
