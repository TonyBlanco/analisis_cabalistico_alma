'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTestResult } from '@/lib/test-api';
import type { TestResult } from '@/lib/test-types';

export const dynamic = 'force-dynamic';

type WellnessComputed = {
  puntuaciones?: {
    indice_bienestar_0_100?: number;
    nivel?: string;
  };
  interpretacion?: {
    resumen?: string;
    fortalezas?: string[];
    areas_enfoque?: string[];
  };
  recomendaciones?: string[];
};

type ScreeningComputed = {
  puntuaciones?: {
    indice_malestar_0_100?: number;
    nivel?: string;
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

type SimpleScoredComputed = {
  total_score?: number;
  severity_label?: string;
  flags?: {
    suicidal_ideation?: boolean;
  };
};

function unwrapComputed(result: TestResult | null): any {
  const payload: any = result?.result_data;
  return payload?.result ?? payload;
}

export default function TherapistTestResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const resolvedParams = use(params as any) as { id: string };
  const resultId = Number(resolvedParams.id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!resultId || Number.isNaN(resultId)) {
        setError('ID de resultado inválido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getTestResult(resultId);
        setResult(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al cargar el resultado.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [resultId]);

  const testCode = result?.test_module?.code || (result as any)?.test_module_code || '';
  const computed = useMemo(() => unwrapComputed(result), [result]);

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
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-3 text-sm text-red-700 underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-gray-900">Resultado</h1>
          <p className="text-sm text-gray-600 mt-2">No se encontró el resultado.</p>
        </div>
      </div>
    );
  }

  const created = result.created_at ? new Date(result.created_at).toLocaleString('es-ES') : '—';
  const title = result.test_module?.name || (result as any)?.test_module_name || 'Resultado de test';
  const clinicianNotes = (result.notes || '').trim();

  const NotesCard = clinicianNotes ? (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Notas del clínico</h2>
      <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{clinicianNotes}</p>
    </div>
  ) : null;

  const renderSimpleScore = (opts: {
    heading: string;
    note: string;
    maxScore: number;
    computed: SimpleScoredComputed;
    showSuicidalAlert?: boolean;
  }) => {
    const totalScore = opts.computed?.total_score ?? null;
    const severity = opts.computed?.severity_label ?? null;
    const progressPercent =
      totalScore !== null && totalScore !== undefined
        ? Math.max(0, Math.min(Math.round((totalScore / opts.maxScore) * 100), 100))
        : 0;
    const suicidal = opts.showSuicidalAlert && opts.computed?.flags?.suicidal_ideation === true;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{opts.heading}</h1>
              <p className="text-xs text-gray-500 mt-1">{created}</p>
            </div>
            <button type="button" onClick={() => router.back()} className="text-sm text-gray-600 underline">
              Volver
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">{opts.note}</p>
        </div>

        {NotesCard}

        {suicidal && (
          <div className="bg-white border border-amber-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-800">Alerta preventiva</h2>
            <p className="text-sm text-amber-700 mt-2">
              Se detectaron respuestas positivas en un ítem de seguridad. Recomienda seguimiento clínico acorde a protocolos locales.
            </p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500">Puntaje total</p>
              <p className="text-3xl font-semibold text-gray-900">{totalScore ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Severidad</p>
              <p className="text-lg font-medium text-gray-900">{severity ?? 'N/A'}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Progreso del puntaje (0–{opts.maxScore})</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gray-900" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <p className="text-xs text-gray-500">Este resultado es orientativo y no constituye diagnóstico.</p>
        </div>
      </div>
    );
  };

  if (testCode === 'wellness') {
    const c = computed as WellnessComputed;
    const index = c?.puntuaciones?.indice_bienestar_0_100 ?? null;
    const tier = c?.puntuaciones?.nivel ?? null;
    const progressPercent = index !== null ? Math.max(0, Math.min(index, 100)) : 0;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-500 mt-1">{created}</p>
            </div>
            <button type="button" onClick={() => router.back()} className="text-sm text-gray-600 underline">
              Volver
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">Cuestionario interno orientativo (no diagnóstico).</p>
        </div>

        {NotesCard}

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500">Índice de bienestar</p>
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
              <div className="h-2 rounded-full bg-gray-900" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {c?.interpretacion?.resumen && <p className="text-sm text-gray-700">{c.interpretacion.resumen}</p>}
        </div>

        {(c?.interpretacion?.fortalezas?.length || c?.interpretacion?.areas_enfoque?.length) ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Mapa</h2>
            {c?.interpretacion?.fortalezas?.length ? (
              <p className="text-sm text-gray-700"><span className="font-medium">Fortalezas:</span> {c.interpretacion.fortalezas.join(', ')}</p>
            ) : null}
            {c?.interpretacion?.areas_enfoque?.length ? (
              <p className="text-sm text-gray-700"><span className="font-medium">Áreas de enfoque:</span> {c.interpretacion.areas_enfoque.join(', ')}</p>
            ) : null}
          </div>
        ) : null}

        {c?.recomendaciones?.length ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Siguientes pasos sugeridos</h2>
            <ul className="list-disc pl-5 space-y-1">
              {c.recomendaciones.map((r) => (
                <li key={r} className="text-sm text-gray-700">{r}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  if (testCode === 'screening-general') {
    const c = computed as ScreeningComputed;
    const index = c?.puntuaciones?.indice_malestar_0_100 ?? null;
    const tier = c?.puntuaciones?.nivel ?? null;
    const safety = c?.alertas?.ideacion_autolesion ?? false;
    const progressPercent = index !== null ? Math.max(0, Math.min(index, 100)) : 0;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-500 mt-1">{created}</p>
            </div>
            <button type="button" onClick={() => router.back()} className="text-sm text-gray-600 underline">
              Volver
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">Cuestionario interno orientativo (no diagnóstico).</p>
        </div>

        {NotesCard}

        {safety && (
          <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-800">Alerta importante</h2>
            <p className="text-sm text-red-700 mt-2">
              Se detectó un indicador de riesgo. Recomienda contención y evaluación clínica acorde a protocolos locales.
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
              <div className="h-2 rounded-full bg-gray-900" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {c?.interpretacion?.resumen && <p className="text-sm text-gray-700">{c.interpretacion.resumen}</p>}
          {c?.interpretacion?.nota && <p className="text-xs text-gray-500">{c.interpretacion.nota}</p>}
        </div>

        {c?.interpretacion?.areas_enfoque?.length ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Áreas de enfoque</h2>
            <p className="text-sm text-gray-700">{c.interpretacion.areas_enfoque.join(', ')}</p>
          </div>
        ) : null}

        {c?.recomendaciones?.length ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Siguientes pasos sugeridos</h2>
            <ul className="list-disc pl-5 space-y-1">
              {c.recomendaciones.map((r) => (
                <li key={r} className="text-sm text-gray-700">{r}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  if (testCode === 'phq-9') {
    return renderSimpleScore({
      heading: 'PHQ-9 — Resultado',
      note: 'Cuestionario de cribado de depresión (orientativo, no diagnóstico).',
      maxScore: 27,
      computed: computed as SimpleScoredComputed,
      showSuicidalAlert: true,
    });
  }

  if (testCode === 'gad-7') {
    return renderSimpleScore({
      heading: 'GAD-7 — Resultado',
      note: 'Cuestionario de cribado de ansiedad generalizada (orientativo, no diagnóstico).',
      maxScore: 21,
      computed: computed as SimpleScoredComputed,
    });
  }

  if (testCode === 'bai') {
    return renderSimpleScore({
      heading: 'BAI — Resultado',
      note: 'Inventario de ansiedad (orientativo, no diagnóstico).',
      maxScore: 63,
      computed: computed as SimpleScoredComputed,
    });
  }

  if (testCode === 'bdi-ii') {
    return renderSimpleScore({
      heading: 'BDI-II — Resultado',
      note: 'Inventario de depresión (orientativo, no diagnóstico).',
      maxScore: 63,
      computed: computed as SimpleScoredComputed,
      showSuicidalAlert: true,
    });
  }

  if (testCode === 'isi') {
    return renderSimpleScore({
      heading: 'ISI — Resultado',
      note: 'Índice de severidad del insomnio (orientativo, no diagnóstico).',
      maxScore: 28,
      computed: computed as SimpleScoredComputed,
    });
  }

  // Fallback generic viewer
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-500 mt-1">{created}</p>
          </div>
          <button type="button" onClick={() => router.back()} className="text-sm text-gray-600 underline">
            Volver
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">Vista genérica (JSON).</p>
      </div>

      {NotesCard}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <pre className="text-xs whitespace-pre-wrap break-words text-gray-800">{JSON.stringify(result.result_data, null, 2)}</pre>
      </div>
    </div>
  );
}
