'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getTestResults } from '@/lib/test-api';
import type { TestResult } from '@/lib/test-types';

type PastLivesResultData = {
  symbolic_resonance_level?: 'low' | 'medium' | 'high';
  dominant_themes?: string[];
  reflection_axes?: string[];
  summary_text?: string;
};

function latestResultForCode(results: TestResult[], code: string): TestResult | null {
  const filtered = results.filter((r) => r.test_module?.code === code);
  if (filtered.length === 0) return null;
  const sorted = [...filtered].sort((a: any, b: any) => {
    const ad = new Date((a as any).created_at || 0).getTime();
    const bd = new Date((b as any).created_at || 0).getTime();
    return bd - ad;
  });
  return sorted[0] || null;
}

function unwrapResultData(payload: any): any {
  return payload?.result ?? payload;
}

export default function PastLivesResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: 'past-lives' });
        setResult(latestResultForCode(all as any, 'past-lives'));
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error cargando resultado.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const computed = useMemo(() => {
    if (!result) return null;
    const rd = (unwrapResultData((result as any).result_data) || {}) as PastLivesResultData;
    return {
      level: rd.symbolic_resonance_level || 'medium',
      themes: rd.dominant_themes || [],
      axes: rd.reflection_axes || [],
      summary: rd.summary_text || '',
    };
  }, [result]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando resultado…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="bg-white border border-red-200 rounded-lg p-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <Link href="/dashboard/patient/tests" className="text-sm underline text-gray-700">
          Volver
        </Link>
      </div>
    );
  }

  if (!result || !computed) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-700">Aún no hay resultados guardados para este test.</p>
        </div>
        <Link href="/dashboard/patient/tests" className="text-sm underline text-gray-700">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Vidas Pasadas — Resultado</h1>
        <p className="text-sm text-gray-600 mt-2">Nivel de resonancia simbólica: {computed.level}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Resumen</h2>
        <p className="text-sm text-gray-700 whitespace-pre-line">{computed.summary}</p>
      </div>

      {(computed.themes.length > 0 || computed.axes.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          {computed.themes.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Temas dominantes</h2>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                {computed.themes.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {computed.axes.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Ejes de reflexión</h2>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                {computed.axes.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/dashboard/patient/tests"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Volver a tests
        </Link>
      </div>
    </div>
  );
}
