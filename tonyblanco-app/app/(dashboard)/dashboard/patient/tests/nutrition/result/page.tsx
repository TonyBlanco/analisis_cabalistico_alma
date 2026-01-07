'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTestResults } from '@/lib/test-api';
import type { TestResult } from '@/lib/test-types';

type NutritionResultContract = {
  index: number;
  level: 'bajo' | 'medio' | 'alto';
  map: {
    strengths: string[];
    focus_areas: string[];
  };
  summary_text: string;
  suggested_steps: string[];
  disclaimer: string;
  raw_inputs: Record<string, any>;
};

function getNutritionComputed(result: TestResult | null): NutritionResultContract | null {
  const payload: any = result?.result_data;
  const computed = payload?.result ?? payload;
  return computed || null;
}

function levelBadge(level: NutritionResultContract['level']) {
  if (level === 'alto') return 'bg-green-100 text-green-800 border-green-200';
  if (level === 'medio') return 'bg-amber-100 text-amber-900 border-amber-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

export default function NutritionResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: 'nutrition' });
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

  const computed = useMemo(() => getNutritionComputed(result), [result]);
  const index = computed?.index ?? null;
  const level = computed?.level ?? null;

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
          <h1 className="text-xl font-semibold text-gray-900">Alimentación — Relación y hábitos</h1>
          <p className="text-sm text-gray-600 mt-2">Aún no hay resultados registrados.</p>
        </div>
      </div>
    );
  }

  const progressPercent = index !== null ? Math.max(0, Math.min(index, 100)) : 0;
  const strengths = computed.map?.strengths || [];
  const focusAreas = computed.map?.focus_areas || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Alimentación — Resultado</h1>
        <p className="text-sm text-gray-600 mt-2">{computed.summary_text}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Índice (0–100)</p>
            <p className="text-3xl font-semibold text-gray-900">{index ?? 'N/A'}</p>
          </div>
          {level && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Nivel</p>
              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded border ${levelBadge(level)}`}>
                {level.toUpperCase()}
              </span>
            </div>
          )}
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

      {(strengths.length || focusAreas.length) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Mapa</h2>
          {strengths.length ? (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Fortalezas:</span> {strengths.join(', ')}
            </p>
          ) : null}
          {focusAreas.length ? (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Áreas de enfoque:</span> {focusAreas.join(', ')}
            </p>
          ) : null}
        </div>
      )}

      {computed.suggested_steps?.length ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Siguientes pasos sugeridos</h2>
          <ul className="list-disc pl-5 space-y-1">
            {computed.suggested_steps.slice(0, 5).map((r) => (
              <li key={r} className="text-sm text-gray-700">
                {r}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <p className="text-xs text-gray-500">{computed.disclaimer}</p>
      </div>
    </div>
  );
}

