'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTestResults } from '@/lib/test-api';
import type { TestResult } from '@/lib/test-types';

type ConditionedResult = {
  puntuaciones?: {
    indice_0_100?: number;
    regulacion?: string;
    nivel?: string;
    dominios?: Record<string, { avg_0_4?: number; percent_0_100?: number }>;
  };
  processed?: boolean;
  message?: string;
  interpretacion?: {
    resumen?: string;
    fortalezas?: string[];
    areas_enfoque?: string[];
  };
  recomendaciones?: string[];
};

function getAnxietyComputed(result: TestResult | null): ConditionedResult | null {
  const payload: any = result?.result_data;
  const computed = payload?.result ?? payload;
  return computed || null;
}

export default function AnxietyStateTraitResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: 'anxiety-state-trait' });
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

  const computed = useMemo(() => getAnxietyComputed(result), [result]);
  const index = computed?.puntuaciones?.indice_0_100 ?? null;
  const regulacion = computed?.puntuaciones?.regulacion ?? computed?.puntuaciones?.nivel ?? null;
  const dominios = computed?.puntuaciones?.dominios;

  const statePercent = dominios?.estado?.percent_0_100 ?? null;
  const traitPercent = dominios?.rasgo?.percent_0_100 ?? null;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-600">Cargando resultado.</p>
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

  if (computed?.processed === false) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-amber-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-gray-900">Ansiedad — Estado y rasgo</h1>
          <p className="text-sm text-amber-800 mt-2">
            {computed.message || 'No se pudo calcular el resultado. Vuelve a completar el cuestionario.'}
          </p>
        </div>
      </div>
    );
  }

  if (!result || !computed) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-gray-900">Ansiedad — Estado y rasgo</h1>
          <p className="text-sm text-gray-600 mt-2">Aún no hay resultados registrados.</p>
        </div>
      </div>
    );
  }

  const progressPercent = index !== null ? Math.max(0, Math.min(index, 100)) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Ansiedad — Estado y rasgo</h1>
        <p className="text-sm text-gray-600 mt-2">Lectura wellness orientativa sobre tu ansiedad actual y tu estilo general.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
          <p className="text-xs text-gray-500">Índice global 0-100</p>
          <p className="text-3xl font-semibold text-gray-900">{index ?? 'N/A'}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
          <p className="text-xs text-gray-500">Regulación emocional</p>
          <p className="text-lg font-medium text-gray-900">{regulacion ?? 'N/A'}</p>
          <p className="text-[11px] text-gray-500 mt-1">Índice de regulación (no nivel clínico de ansiedad)</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-xs text-gray-500">Progreso general</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{ width: `${progressPercent}%`, backgroundColor: 'var(--accent-color)' }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">{progressPercent}%</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Subíndices</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Estado (hoy)</span>
            <span className="text-sm text-gray-900">{statePercent !== null ? `${statePercent}%` : 'N/A'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{ width: `${statePercent ?? 0}%`, backgroundColor: 'var(--accent-color)' }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Rasgo (en general)</span>
            <span className="text-sm text-gray-900">{traitPercent !== null ? `${traitPercent}%` : 'N/A'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{ width: `${traitPercent ?? 0}%`, backgroundColor: 'var(--accent-color)' }}
            />
          </div>
        </div>
      </div>

      {computed?.interpretacion?.resumen && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Interpretación</h2>
          <p className="text-sm text-gray-700 mt-2">{computed.interpretacion.resumen}</p>
        </div>
      )}

      {(computed?.interpretacion?.fortalezas?.length || computed?.interpretacion?.areas_enfoque?.length) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Fortalezas y focos</h2>
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
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-2">
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
