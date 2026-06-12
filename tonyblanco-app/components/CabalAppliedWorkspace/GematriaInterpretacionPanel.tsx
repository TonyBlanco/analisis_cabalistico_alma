'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Hash,
  Layers,
  Link2,
  Sparkles,
} from 'lucide-react';
import type { InterpretacionGematrica, LecturaNumero } from '@holistica/symbolic/cabala/interpretacion';

function isInterpretacionGematrica(value: unknown): value is InterpretacionGematrica {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.metodo === 'string' &&
    typeof v.nombreMetodo === 'string' &&
    Array.isArray(v.avisos) &&
    typeof v.sintesis === 'string' &&
    v.lecturaNumeros !== null &&
    typeof v.lecturaNumeros === 'object'
  );
}

export function extractGematriaInterpretacion(
  methodState: Record<string, unknown> | null,
): InterpretacionGematrica | null {
  if (!methodState) return null;
  const raw = methodState.rawData;
  if (!raw || typeof raw !== 'object') return null;
  const interpretacion = (raw as Record<string, unknown>).interpretacion;
  return isInterpretacionGematrica(interpretacion) ? interpretacion : null;
}

function Section({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionId = `gematria-section-${title.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={sectionId}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span aria-hidden="true">{icon}</span>
          {title}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div id={sectionId} className="border-t border-slate-100 px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}

function NumeroCard({ lectura }: { lectura: LecturaNumero }) {
  return (
    <div className="rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
            {lectura.titulo}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">{lectura.cualidad}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-indigo-900 shadow-inner">
          {lectura.valor}
          {lectura.esMaestro && (
            <span className="sr-only"> (número maestro)</span>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-700">{lectura.descripcion}</p>
      {lectura.arquetipos.length > 0 && (
        <p className="mt-2 text-[10px] text-slate-500">
          Arquetipos: {lectura.arquetipos.join(', ')}
        </p>
      )}
    </div>
  );
}

interface GematriaInterpretacionPanelProps {
  interpretacion: InterpretacionGematrica;
  className?: string;
}

export default function GematriaInterpretacionPanel({
  interpretacion,
  className = '',
}: GematriaInterpretacionPanelProps) {
  const { lecturaNumeros, lecturaCasas, equivalencias, avisos } = interpretacion;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Avisos — siempre visibles */}
      <div
        role="note"
        aria-label="Avisos legales y de alcance"
        className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 shadow-sm"
      >
        <div className="mb-2 flex items-center gap-2 text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold">Avisos importantes</span>
        </div>
        <ul className="space-y-1.5 text-xs leading-relaxed text-amber-900/90">
          {avisos.map((aviso) => (
            <li key={aviso} className="flex gap-2">
              <span className="text-amber-600" aria-hidden="true">
                •
              </span>
              <span>{aviso}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cabecera del método */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-slate-50 to-indigo-50/40 p-5 shadow-sm">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">{interpretacion.nombreMetodo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{interpretacion.queEs}</p>
            {interpretacion.comoSeCalcula && (
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                <span className="font-semibold text-gray-700">Cómo se calcula: </span>
                {interpretacion.comoSeCalcula}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lectura numérica */}
      <Section title="Lectura numérica" icon={<Hash className="h-4 w-4 text-indigo-500" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumeroCard lectura={lecturaNumeros.esencia} />
          <NumeroCard lectura={lecturaNumeros.expresion} />
          <NumeroCard lectura={lecturaNumeros.herencia} />
          <NumeroCard lectura={lecturaNumeros.caminoVida} />
        </div>
      </Section>

      {/* Casas */}
      <Section title="Casas de inclusión" icon={<Layers className="h-4 w-4 text-violet-500" />} defaultOpen={false}>
        <div className="space-y-2 text-sm leading-relaxed text-slate-700">
          <p>{lecturaCasas.dominantes}</p>
          <p>{lecturaCasas.ausencias}</p>
          {lecturaCasas.detalle && (
            <p className="text-xs text-slate-500">
              <span className="font-medium">Detalle: </span>
              {lecturaCasas.detalle}
            </p>
          )}
        </div>
      </Section>

      {/* Equivalencias */}
      {equivalencias.length > 0 && (
        <Section
          title="Equivalencias gemátricas"
          icon={<Link2 className="h-4 w-4 text-emerald-500" />}
          defaultOpen={false}
        >
          <ul className="space-y-2">
            {equivalencias.map((eq, idx) => (
              <li
                key={`${eq.contexto}-${eq.palabra}-${idx}`}
                className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-emerald-900" dir="rtl">
                  {eq.palabra}
                </span>
                <span className="text-emerald-700">
                  {' '}
                  ({eq.transliteracion}, valor {eq.valor})
                </span>
                <span className="block text-xs text-emerald-800/80">
                  {eq.contexto}: {eq.significado}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Síntesis */}
      <Section title="Síntesis" icon={<BookOpen className="h-4 w-4 text-slate-500" />}>
        <p className="text-sm leading-relaxed text-slate-700">{interpretacion.sintesis}</p>
      </Section>
    </div>
  );
}