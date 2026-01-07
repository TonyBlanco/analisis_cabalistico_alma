'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTestResults } from '@/lib/test-api';
import type { TestResult } from '@/lib/test-types';

type StressRegulationComputed = {
  puntuaciones?: {
    indice_0_100?: number;
    nivel?: string;
    dominios?: Record<string, { avg_0_4?: number; percent_0_100?: number }>;
  };
  interpretacion?: {
    resumen?: string;
    fortalezas?: string[];
    areas_enfoque?: string[];
  };
  recomendaciones?: string[];
  alertas?: { nota?: string };
};

function getStressRegulationComputed(result: TestResult | null): StressRegulationComputed | null {
  const payload: any = result?.result_data;
  const computed = payload?.result ?? payload;
  return computed || null;
}

export default function StressRegulationResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: 'stress-regulation' });
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

  const computed = useMemo(() => getStressRegulationComputed(result), [result]);
  const index = computed?.puntuaciones?.indice_0_100 ?? null;
  const tier = computed?.puntuaciones?.nivel ?? null;

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
          <h1 className="text-xl font-semibold text-gray-900">Estrés — Carga y regulación</h1>
          <p className="text-sm text-gray-600 mt-2">Aún no hay resultados registrados.</p>
        </div>
      </div>
    );
  }

  const progressPercent = index !== null ? Math.max(0, Math.min(index, 100)) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Estrés — Resultado</h1>
        {computed?.interpretacion?.resumen && (
          <p className="text-sm text-gray-600 mt-2">{computed.interpretacion.resumen}</p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Índice (0–100)</p>
            <p className="text-3xl font-semibold text-gray-900">{index ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Nivel</p>
            <p className="text-lg font-medium text-gray-900">{tier ?? 'N/A'}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Progreso</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{ width: `${progressPercent}%`, backgroundColor: 'var(--accent-color)' }}
            />
          </div>
        </div>
      </div>

      {(computed?.interpretacion?.fortalezas?.length || computed?.interpretacion?.areas_enfoque?.length) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Mapa</h2>
          {computed?.interpretacion?.fortalezas?.length ? (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Fortalezas:</span> {computed.interpretacion.fortalezas.join(', ')}
            </p>
          ) : null}
          {computed?.interpretacion?.areas_enfoque?.length ? (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Áreas de enfoque:</span> {computed.interpretacion.areas_enfoque.join(', ')}
            </p>
          ) : null}
        </div>
      )}

      {computed?.recomendaciones?.length ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Siguientes pasos sugeridos</h2>
          <ul className="list-disc pl-5 space-y-1">
            {computed.recomendaciones.slice(0, 5).map((r) => (
              <li key={r} className="text-sm text-gray-700">
                {r}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {computed?.alertas?.nota ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-xs text-gray-500">{computed.alertas.nota}</p>
        </div>
      ) : null}
    </div>
  );
}

