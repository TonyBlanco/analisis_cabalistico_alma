'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getTestResults } from '@/lib/test-api';
import type { TestResult } from '@/lib/test-types';

type UnityIntrospectionComputed = {
  processed?: boolean;
  structured_data?: {
    score_total?: number;
    risk_level?: 'low' | 'medium' | 'high';
    usage_pattern?: 'exploratory' | 'habitual' | 'compulsive';
    body_awareness_level?: 'high' | 'medium' | 'low';
    transition_suggestion?: string | null;
  };
  summary_text?: string;
  message?: string;
};

function unwrap(payload: any): any {
  return payload?.result ?? payload;
}

function latest(results: TestResult[]): TestResult | null {
  if (!results?.length) return null;
  const sorted = [...results].sort((a: any, b: any) => {
    const ad = new Date((a as any).created_at || 0).getTime();
    const bd = new Date((b as any).created_at || 0).getTime();
    return bd - ad;
  });
  return sorted[0] || null;
}

function labelRisk(level?: string) {
  if (level === 'high') return 'Interferencia alta';
  if (level === 'medium') return 'Interferencia moderada';
  if (level === 'low') return 'Interferencia baja';
  return 'Sin dato';
}

function labelPattern(p?: string) {
  if (p === 'compulsive') return 'Patrón compulsivo';
  if (p === 'habitual') return 'Patrón habitual';
  if (p === 'exploratory') return 'Patrón exploratorio';
  return 'Sin dato';
}

function labelBody(a?: string) {
  if (a === 'high') return 'Presencia corporal alta';
  if (a === 'medium') return 'Presencia corporal media';
  if (a === 'low') return 'Presencia corporal baja';
  return 'Sin dato';
}

export default function UnityIntrospectionResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: 'dudit_spirit' });
        setResult(latest((all || []) as any));
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
    const payload: any = (result as any).result_data;
    return (unwrap(payload) || {}) as UnityIntrospectionComputed;
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
          <h1 className="text-xl font-semibold text-gray-900">Introspección de Unidad — Resultado</h1>
          <p className="text-sm text-gray-600 mt-2">Aún no hay resultados guardados para este test.</p>
        </div>
        <Link href="/dashboard/patient/tests" className="text-sm underline text-gray-700">
          Volver
        </Link>
      </div>
    );
  }

  const sd = computed.structured_data || {};

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Introspección de Unidad — Resultado</h1>
        {result.created_at && (
          <p className="text-xs text-gray-500 mt-1">
            Completado el{' '}
            {new Date(result.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
        {computed.summary_text ? <p className="text-sm text-gray-700 mt-3">{computed.summary_text}</p> : null}
        {computed.processed === false ? (
          <p className="text-sm text-amber-700 mt-3">
            Este resultado quedó marcado como incompleto. Vuelve a realizar el cuestionario.
          </p>
        ) : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Lectura orientativa</h2>
        <p className="text-sm text-gray-700">{labelRisk(sd.risk_level)}</p>
        <p className="text-sm text-gray-700">{labelPattern(sd.usage_pattern)}</p>
        <p className="text-sm text-gray-700">{labelBody(sd.body_awareness_level)}</p>
        {typeof sd.score_total === 'number' ? (
          <p className="text-xs text-gray-500">Índice interno (0–44): {sd.score_total}</p>
        ) : null}
        {sd.transition_suggestion ? (
          <p className="text-xs text-gray-500">Sugerencia de exploración: {sd.transition_suggestion}</p>
        ) : null}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <p className="text-xs text-gray-500">
          Nota: lectura simbólica/orientativa para acompañamiento. No constituye diagnóstico ni reemplaza ayuda profesional.
        </p>
      </div>

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
