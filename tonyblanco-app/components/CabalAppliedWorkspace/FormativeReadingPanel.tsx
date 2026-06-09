'use client';

import { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Compass,
  GitBranch,
  HelpCircle,
  Layers,
  Lightbulb,
  Sparkles,
  Target,
  Waves,
} from 'lucide-react';
import type { FormativeBrief } from '@holistica/symbolic/tree';

function briefToMarkdown(brief: FormativeBrief): string {
  const lines = [
    `# Síntesis formativa — ${brief.methodId}`,
    brief.headline,
    '',
    '## Hipótesis de trabajo',
    brief.workingHypothesis,
    '',
    '## Arco de proceso',
    brief.processArc,
    '',
    '## Focos sefiróticos',
    ...brief.dominantSefirot.map(
      (s, i) =>
        `${i + 1}. **${s.displayName}** (${Math.round(s.activation * 100)}%)\n   - Luz: ${s.light}\n   - Sombra: ${s.shadowWatch}\n   - Tikkun: ${s.tikkun}`,
    ),
    '',
    '## Preguntas guía',
    ...brief.sessionQuestions.map((q, i) => `${i + 1}. ${q}`),
    '',
    brief.disclaimer,
  ];
  return lines.join('\n');
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
  const sectionId = `formative-section-${title.replace(/\s+/g, '-').toLowerCase()}`;
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

function AxisGrid({ axes }: { axes: FormativeBrief['pillarAxes'] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {axes.map((axis) => (
        <div key={axis.id} className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-xs font-semibold text-slate-700">{axis.label}</p>
          <p className="mt-1 text-[11px] text-indigo-700">{axis.reading}</p>
          <p className="mt-1 text-[10px] text-slate-500 leading-relaxed">{axis.therapeuticAngle}</p>
        </div>
      ))}
    </div>
  );
}

export default function FormativeReadingPanel({
  brief,
  loading,
}: {
  brief: FormativeBrief | null;
  loading?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!brief) return;
    try {
      await navigator.clipboard.writeText(briefToMarkdown(brief));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div
        className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-6 text-sm text-indigo-800"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        Generando síntesis formativa…
      </div>
    );
  }

  if (!brief) {
    return (
      <div
        className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500"
        role="status"
      >
        Ejecuta un método para generar la síntesis formativa avanzada.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-indigo-700">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-base font-bold text-indigo-950">Síntesis formativa avanzada</h3>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-800">{brief.headline}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{brief.structuralFocus}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-medium text-indigo-800">
              Solo lectura
            </span>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2 py-1 text-[10px] text-indigo-700 hover:bg-indigo-50"
            >
              <ClipboardCopy className="h-3 w-3" />
              {copied ? 'Copiado' : 'Copiar síntesis'}
            </button>
          </div>
        </div>
        <p className="mt-3 rounded-lg border border-violet-200 bg-violet-50/60 px-3 py-2 text-xs leading-relaxed text-violet-950">
          <span className="font-semibold">Hipótesis de trabajo:</span> {brief.workingHypothesis}
        </p>
        <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs text-slate-700 border border-indigo-100">
          <span className="font-semibold text-indigo-900">Arco de proceso:</span> {brief.processArc}
        </p>
        <p className="mt-2 text-[10px] text-slate-500">{brief.coherenceNote}</p>
      </div>

      <Section title="Focos sefiróticos (para sesión)" icon={<Target className="h-4 w-4 text-rose-600" />}>
        <div className="space-y-3">
          {brief.dominantSefirot.map((s, idx) => (
            <div
              key={s.id}
              className="rounded-lg border border-slate-100 bg-gradient-to-r from-slate-50 to-white p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {idx + 1}. {s.displayName}{' '}
                  <span className="text-slate-400 font-normal">{s.hebrewLabel}</span>
                </p>
                <span className="text-[10px] rounded-full bg-slate-200 px-2 py-0.5 text-slate-600">
                  {s.role} · {Math.round(s.activation * 100)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-emerald-800">
                <span className="font-medium">Luz:</span> {s.light}
              </p>
              <p className="mt-1 text-xs text-amber-800">
                <span className="font-medium">Vigilar (sombra):</span> {s.shadowWatch}
              </p>
              <p className="mt-1 text-xs text-indigo-800">
                <span className="font-medium">Tikkun:</span> {s.tikkun}
              </p>
              <p className="mt-2 text-[11px] italic text-slate-600">{s.therapistNote}</p>
              <p className="mt-1 text-[10px] text-slate-400">
                Pilar {s.pillar} · {s.triad} · {s.olam}
              </p>
            </div>
          ))}
        </div>
        {brief.latentGaps.length > 0 && (
          <div className="mt-3 rounded-lg border border-dashed border-slate-200 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Zonas poco habitadas</p>
            <ul className="mt-1 space-y-1 text-[11px] text-slate-600">
              {brief.latentGaps.map((g) => (
                <li key={g.id}>
                  <strong>{g.displayName}:</strong> {g.note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section title="Ejes estructurales" icon={<Layers className="h-4 w-4 text-violet-600" />} defaultOpen={false}>
        <p className="mb-2 text-[10px] font-semibold uppercase text-slate-500">Pilares</p>
        <AxisGrid axes={brief.pillarAxes} />
        <p className="mb-2 mt-4 text-[10px] font-semibold uppercase text-slate-500">Triadas</p>
        <AxisGrid axes={brief.triadAxes} />
        <p className="mb-2 mt-4 text-[10px] font-semibold uppercase text-slate-500">Olamot (mundos)</p>
        <AxisGrid axes={brief.olamAxes} />
        <p className="mt-3 text-xs text-slate-600">
          <span className="font-medium">Polaridades:</span> {brief.polarityReading}
        </p>
      </Section>

      {brief.pathProcesses.length > 0 && (
        <Section title="Senderos como proceso" icon={<GitBranch className="h-4 w-4 text-teal-600" />}>
          <div className="space-y-2">
            {brief.pathProcesses.map((p) => (
              <div key={p.pathId} className="flex gap-3 rounded-lg bg-teal-50/50 px-3 py-2">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                <div>
                  <p className="text-xs font-semibold text-teal-900">
                    {p.fromLabel} → {p.toLabel}
                    <span className="ml-2 font-normal text-teal-700">({p.processPhase})</span>
                  </p>
                  <p className="text-[11px] text-slate-600">{p.narrative}</p>
                  <p className="text-[10px] text-slate-400">
                    Intensidad {Math.round(p.intensity * 100)}% · {p.polarity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {brief.clinicalBridge.length > 0 && (
        <Section title="Puente clínico ↔ árbol" icon={<Waves className="h-4 w-4 text-cyan-600" />}>
          <ul className="space-y-1 text-xs text-slate-700">
            {brief.clinicalBridge.map((line) => (
              <li key={line} className="leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Ángulos de intervención simbólica" icon={<Lightbulb className="h-4 w-4 text-amber-500" />}>
        <ul className="space-y-2 text-xs text-slate-700">
          {brief.interventionAngles.map((angle) => (
            <li key={angle} className="rounded-md bg-amber-50/70 px-2 py-1.5 leading-relaxed">
              {angle}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Señales transferenciales (auto-observación)"
        icon={<Compass className="h-4 w-4 text-rose-500" />}
        defaultOpen={false}
      >
        <ul className="space-y-2 text-[11px] text-slate-600">
          {brief.transferentialCues.map((cue) => (
            <li key={cue} className="rounded-md bg-rose-50/50 px-2 py-1.5">
              {cue}
            </li>
          ))}
        </ul>
      </Section>

      {brief.methodBridge.length > 0 && (
        <Section title="Puente método ↔ árbol" icon={<BookOpen className="h-4 w-4 text-amber-600" />} defaultOpen={false}>
          <ul className="space-y-1 text-xs text-slate-700">
            {brief.methodBridge.map((line) => (
              <li key={line} className="leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Preguntas guía para sesión" icon={<HelpCircle className="h-4 w-4 text-blue-600" />}>
        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 leading-relaxed">
          {brief.sessionQuestions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </Section>

      <Section title="Supervisión / auto-observación del terapeuta" icon={<Compass className="h-4 w-4 text-slate-600" />} defaultOpen={false}>
        <ul className="space-y-2 text-[11px] text-slate-600">
          {brief.supervisionPrompts.map((p) => (
            <li key={p} className="rounded-md bg-slate-50 px-2 py-1.5">
              {p}
            </li>
          ))}
        </ul>
      </Section>

      <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
        {brief.disclaimer}
      </p>
    </div>
  );
}