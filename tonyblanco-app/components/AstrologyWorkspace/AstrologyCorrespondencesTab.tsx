'use client';

import { useNatalChart } from '@/hooks/useNatalChart';
import { getHebrewLetterForSign } from '@/lib/kabbalah-sign-letters';
import { AlertCircle, BookOpen, Loader2 } from 'lucide-react';
import AstrologyHolisticDisclaimer from './AstrologyHolisticDisclaimer';

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
  northnode: 'Nodo Norte',
  southnode: 'Nodo Sur',
  ascendant: 'Ascendente',
  midheaven: 'Medio Cielo',
};

function formatDegrees(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${num.toFixed(1)}°`;
}

export default function AstrologyCorrespondencesTab({ patientId }: { patientId: string }) {
  const { chart, loading, error } = useNatalChart(patientId);

  if (loading) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-gray-600">Cargando correspondencias…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-red-700 font-medium">No se pudieron cargar las correspondencias</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </section>
    );
  }

  if (!chart) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-4 text-center">
          <BookOpen className="h-10 w-10 text-gray-400" />
          <div>
            <p className="text-gray-900 font-semibold">No hay carta natal disponible</p>
            <p className="text-sm text-gray-600 mt-1">
              Calcula la carta en la pestaña “Visual” y vuelve aquí para ver correspondencias simbólicas.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const planets = Array.isArray(chart.planetas) ? chart.planetas : [];

  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Correspondencias (Training / Investigativo)</h3>
          <p className="text-xs text-gray-600 mt-1">
            Correspondencias tradicionales explicativas. Uso educativo / no médico. No implica causalidad ni conclusiones.
          </p>
        </div>
        <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
          Uso educativo / no médico
        </span>
      </div>
      <AstrologyHolisticDisclaimer />

      <div className="rounded-lg border border-gray-200 overflow-hidden mt-4">
        <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-700 px-3 py-2">
          <div className="col-span-3">Factor</div>
          <div className="col-span-3">Signo / Casa</div>
          <div className="col-span-2">Grados</div>
          <div className="col-span-2">Letra / Sendero</div>
          <div className="col-span-2">Sefirá</div>
        </div>
        <div className="divide-y divide-gray-100">
          {planets.map((p, idx) => {
            const key = String(p?.nombre || '').trim().toLowerCase();
            const label = PLANET_LABEL_ES[key] || (key ? key : '—');
            const letter = getHebrewLetterForSign(p?.signo);
            const cabalistic = chart.cabalistic_data?.planets?.[key];
            const sefira = cabalistic?.sefira?.sefira_name || cabalistic?.planet_info?.sefira || null;

            return (
              <div key={`${key}-${idx}`} className="grid grid-cols-12 px-3 py-2 text-sm">
                <div className="col-span-3 font-medium text-gray-900">{label}</div>
                <div className="col-span-3 text-gray-700">
                  <span className="inline-block">{String(p?.signo || '-')}</span>
                  <span className="text-gray-400"> · </span>
                  <span className="inline-block">Casa {String(p?.casa ?? '-')}</span>
                </div>
                <div className="col-span-2 text-gray-700">{formatDegrees(p?.grados)}</div>
                <div className="col-span-2 text-gray-700">
                  {letter ? (
                    <span>
                      {letter.hebrewLetter} <span className="text-gray-400">·</span> {letter.pathNumber}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
                <div className="col-span-2 text-gray-700">{sefira || <span className="text-gray-400">—</span>}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-700">
        <p className="font-semibold text-gray-900 mb-1">Guía de uso (Training)</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Lee “factor → correspondencia” como mapa simbólico, no como afirmación médica.</li>
          <li>La síntesis final siempre es del analista humano; la UI solo organiza material.</li>
          <li>Evita lenguaje determinista (p. ej. “esto significa que…”). Prefiere “podría sugerir…” o “invita a explorar…”.</li>
        </ul>
      </div>
    </section>
  );
}
