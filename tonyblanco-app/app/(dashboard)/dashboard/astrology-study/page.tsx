'use client';

import Link from 'next/link';
import HelpButton from '@/components/AstrologyStudy/HelpButton';

export default function AstrologyStudyHome() {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Astrology Study / Lab</p>
        <h2 className="text-xl font-semibold text-gray-900">Espacio académico (sin consultantes reales)</h2>
        <p className="text-sm text-gray-600">
          Usa datasets simulados o research. No se pasa contexto de consultante ni snapshots reales. Motor sellado reutilizado sin cambios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Flujo rápido</h3>
          <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
            <li>
              <Link className="text-blue-700 underline" href="/dashboard/astrology-study/catalog">
                Configura cartas en Catálogo (sin backend nuevo)
              </Link>
            </li>
            <li>
              <Link className="text-blue-700 underline" href="/dashboard/astrology-study/visual">
                Visual Pro con sample
              </Link>
            </li>
            <li>
              <Link className="text-blue-700 underline" href="/dashboard/astrology-study/compare">
                Comparador estructural
              </Link>
            </li>
            <li>
              <Link className="text-blue-700 underline" href="/dashboard/astrology-study/research">
                Research Lab (dataset simulado)
              </Link>
            </li>
            <li>
              <Link className="text-blue-700 underline" href="/dashboard/astrology-study/sandbox">
                Sandbox predictivo simulado (scores didácticos)
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Avisos</h3>
          <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
            <li>Un solo motor astronómico (adapter sellado). No se duplica.</li>
            <li>Sin consultantes reales, sin endpoints nuevos, sin scoring médico.</li>
            <li>Sandbox funciona solo con datos simulados; se bloquea con datos reales.</li>
            <li>Export CSV/TXT y Print son frontend-only.</li>
          </ul>
          <div className="text-xs text-gray-500">
            <HelpButton contentId="sandbox" label="¿Qué es Sandbox?" /> ·{' '}
            <HelpButton contentId="research" label="¿Cómo investigar patrones?" />
          </div>
        </div>
      </div>
    </section>
  );
}
