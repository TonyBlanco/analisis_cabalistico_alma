'use client';

import { useMemo, useState } from 'react';
import { useNatalChart } from '@/hooks/useNatalChart';
import { AlertCircle, Clipboard, ClipboardCheck, FileText, Loader2 } from 'lucide-react';
import AstrologyHolisticDisclaimer from './AstrologyHolisticDisclaimer';

function safeText(value: unknown): string {
  if (value == null) return '-';
  const s = String(value).trim();
  return s ? s : '-';
}

function formatDegrees(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${num.toFixed(1)}°`;
}

const PLANET_LABEL_ES: Record<string, string> = {
  sun: 'Sol',
  moon: 'Luna',
  mercury: 'Mercurio',
  venus: 'Venus',
  mars: 'Marte',
  jupiter: 'Júpiter',
  saturn: 'Saturno',
  uranus: 'Urano',
  neptune: 'Neptuno',
  pluto: 'Plutón',
};

export default function AstrologySynthesisTab({
  patientId,
  houseSystem,
  zodiacType,
}: {
  patientId: string;
  houseSystem?: string;
  zodiacType?: string;
}) {
  const { chart, loading, error } = useNatalChart(patientId);
  const [copied, setCopied] = useState(false);

  const template = useMemo(() => {
    const parts: string[] = [];
    parts.push('Síntesis (Formativo / Investigativo) — Uso educativo / no médico');
    parts.push('Interpretación asistida con fines formativos. No médica.');
    parts.push('');
    parts.push('Contexto técnico (observacional):');
    parts.push(`- Sistema de casas (selección UI): ${safeText(houseSystem)}`);
    parts.push(`- Zodiaco (selección UI): ${safeText(zodiacType)}`);
    parts.push(`- Fuente: ${safeText(chart?.metadatos?.fuente)}`);
    parts.push(`- Calculado: ${safeText(chart?.metadatos?.calculated_at)}`);
    parts.push('');
    parts.push('1) Panorama (2–4 líneas, descriptivo, no concluyente):');
    parts.push('- …');
    parts.push('');
    parts.push('2) Ejes de observación (elige 2–3):');
    parts.push('- Identidad / centro (Sol) — ¿cómo se expresa en contexto y rol?');
    parts.push('- Ritmo emocional (Luna) — ¿qué necesita para regularse?');
    parts.push('- Límites / estructura (Saturno) — ¿qué ordena y qué restringe?');
    parts.push('');
    parts.push('3) Correspondencias (solo como lenguaje simbólico tradicional):');
    parts.push('- Letra(s) / sendero(s) relevantes: …');
    parts.push('- Sefirá(s) asociadas: …');
    parts.push('- Referencias (si aplica): …');
    parts.push('');
    parts.push('4) Preguntas de exploración (no inductivas):');
    parts.push('- ¿Qué resuena de esta imagen simbólica en tu experiencia actual?');
    parts.push('- ¿Dónde notas tensión vs integración en este ciclo?');
    parts.push('- ¿Qué recursos aparecen cuando observas este patrón?');
    parts.push('');
    parts.push('5) Cierre:');
    parts.push('- Nota ética: sin evaluación médica, sin predicción, sin decisión automática. La síntesis es revisable.');
    parts.push('');
    parts.push('Aviso importante: análisis holístico y simbólico con fines de orientación personal.');
    parts.push('No es un sistema médico y no sustituye evaluación, tratamiento ni asesoramiento sanitario.');
    return parts.join('\n');
  }, [chart?.metadatos?.calculated_at, chart?.metadatos?.fuente, houseSystem, zodiacType]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-gray-600">Cargando síntesis…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-red-700 font-medium">No se pudo preparar la síntesis</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </section>
    );
  }

  if (!chart) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-4 text-center">
          <FileText className="h-10 w-10 text-gray-400" />
          <div>
            <p className="text-gray-900 font-semibold">No hay carta natal disponible</p>
            <p className="text-sm text-gray-600 mt-1">
              Calcula la carta en “Visual” y vuelve para construir una síntesis formativa.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const planets = Array.isArray(chart.planetas) ? chart.planetas : [];
  const keyPlanets = ['sun', 'moon', 'saturn'];
  const quickRows = keyPlanets
    .map((k) => planets.find((p) => String(p?.nombre || '').trim().toLowerCase() === k))
    .filter((p): p is (typeof planets)[number] => Boolean(p));

  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Síntesis (Formativo / Investigativo)</h3>
          <p className="text-xs text-gray-600 mt-1">
            Interpretación asistida con fines formativos. No médica. La síntesis final es del analista humano.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
            Uso educativo / no médico
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {copied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {copied ? 'Copiado' : 'Copiar plantilla'}
          </button>
        </div>
      </div>
      <AstrologyHolisticDisclaimer />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Anclas observacionales (rápido)</p>
          <div className="space-y-2 text-sm">
            <div className="text-gray-700">
              <span className="font-medium">Sistema de casas:</span> {safeText(houseSystem)}{' '}
              <span className="text-gray-400">·</span> <span className="font-medium">Zodiaco:</span> {safeText(zodiacType)}
            </div>
            <div className="text-gray-700">
              <span className="font-medium">Fuente:</span> {safeText(chart.metadatos?.fuente)}{' '}
              <span className="text-gray-400">·</span> <span className="font-medium">Calculado:</span>{' '}
              {safeText(chart.metadatos?.calculated_at)}
            </div>
          </div>

          <div className="mt-3 rounded-md bg-gray-50 border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 bg-white px-3 py-2 text-xs font-semibold text-gray-700 border-b border-gray-200">
              <div className="col-span-4">Planeta</div>
              <div className="col-span-4">Signo / Casa</div>
              <div className="col-span-4">Grados</div>
            </div>
            <div className="divide-y divide-gray-100">
              {quickRows.length > 0 ? (
                quickRows.map((p, idx) => {
                  const key = String(p?.nombre || '').trim().toLowerCase();
                  return (
                    <div key={`${key}-${idx}`} className="grid grid-cols-12 px-3 py-2 text-sm">
                      <div className="col-span-4 font-medium text-gray-900">{PLANET_LABEL_ES[key] || key}</div>
                      <div className="col-span-4 text-gray-700">
                        {safeText(p?.signo)} <span className="text-gray-400">·</span> Casa {safeText(p?.casa)}
                      </div>
                      <div className="col-span-4 text-gray-700">{formatDegrees(p?.grados)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-sm text-gray-500">No hay planetas clave disponibles en este payload.</div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-sm font-semibold text-gray-900">Plantilla estructurada</p>
            <span className="text-[11px] text-gray-500">Editable / revisable</span>
          </div>
          <textarea
            readOnly
            value={template}
            className="w-full min-h-[340px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-800"
          />
          <p className="mt-2 text-[11px] text-gray-500">
            La plantilla no concluye ni diagnostica. Es un apoyo de redacción para trabajo formativo/investigativo.
          </p>
        </div>
      </div>
    </section>
  );
}
