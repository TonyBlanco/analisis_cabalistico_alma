'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react';

import {
  queueLearningAutotourOnNavigate,
  type OnboardingStepState,
} from '@/hooks/useTherapistOnboarding';

export interface OnboardingChecklistProps {
  steps: OnboardingStepState[];
  pendingCount: number;
  onDismiss: () => void;
}

interface StepConfig {
  id: OnboardingStepState['id'];
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: React.ReactNode;
  onNavigate?: () => void;
}

const STEP_CONFIG: StepConfig[] = [
  {
    id: 'profile',
    title: 'Completa tu perfil',
    description: 'Añade tu nombre, profesión y teléfono para que tu espacio quede listo.',
    href: '/dashboard/account',
    cta: 'Ir a mi cuenta',
    icon: <UserRound className="h-5 w-5" aria-hidden="true" />,
  },
  {
    id: 'patient',
    title: 'Crea tu primer consultante',
    description: 'Registra a la persona con la que vas a trabajar en la plataforma.',
    href: '/dashboard/therapist/patients',
    cta: 'Crear consultante',
    icon: <UserPlus className="h-5 w-5" aria-hidden="true" />,
  },
  {
    id: 'tree_analysis',
    title: 'Genera tu primer análisis del Árbol de la Vida',
    description: 'Explora Cabalá Aplicada y guarda un análisis simbólico para un consultante.',
    href: '/dashboard/therapist/cabala-aplicada',
    cta: 'Abrir Cabalá Aplicada',
    icon: <Sparkles className="h-5 w-5" aria-hidden="true" />,
  },
  {
    id: 'learning',
    title: 'Explora el Centro de Aprendizaje',
    description: 'Recorre guías y tutoriales para sacar partido a la herramienta.',
    href: '/dashboard/therapist/learn',
    cta: 'Ir al centro',
    icon: <BookOpen className="h-5 w-5" aria-hidden="true" />,
    onNavigate: queueLearningAutotourOnNavigate,
  },
];

export default function OnboardingChecklist({
  steps,
  pendingCount,
  onDismiss,
}: OnboardingChecklistProps) {
  const stepMap = useMemo(
    () => new Map(steps.map((step) => [step.id, step.done])),
    [steps],
  );

  const completedCount = steps.filter((step) => step.done).length;

  return (
    <section
      aria-labelledby="onboarding-checklist-title"
      className="overflow-hidden rounded-2xl border border-[var(--ha-line)] bg-[var(--ha-bg)] shadow-[var(--ha-shadow)]"
      data-theme="oro"
    >
      <div className="flex flex-col gap-4 border-b border-[var(--ha-line-soft)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ha-acc)]">
            Primeros pasos
          </p>
          <h2
            id="onboarding-checklist-title"
            className="mt-1 font-[family-name:var(--ha-d-font)] text-xl font-semibold text-[var(--ha-ink)] sm:text-2xl"
          >
            Configura tu espacio de trabajo
          </h2>
          <p className="mt-1 text-sm text-[var(--ha-ink-2)]">
            {completedCount} de {steps.length} completados
            {pendingCount > 0 ? ` · ${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}` : ''}
          </p>
          <div
            className="mt-3 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-label="Progreso del onboarding"
          >
            <div
              className="h-full rounded-full bg-[var(--ha-grad)] transition-all duration-300"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-[var(--ha-line-soft)] px-3 py-1.5 text-sm text-[var(--ha-ink-2)] transition-colors hover:border-[var(--ha-line)] hover:bg-white/[0.04] hover:text-[var(--ha-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]"
          aria-label="Descartar checklist de primeros pasos"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Descartar
        </button>
      </div>

      <ol className="divide-y divide-[var(--ha-line-soft)]">
        {STEP_CONFIG.map((config, index) => {
          const done = stepMap.get(config.id) ?? false;

          return (
            <li
              key={config.id}
              className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                    done
                      ? 'border-[var(--ha-acc)]/40 bg-[var(--ha-glow)] text-[var(--ha-acc)]'
                      : 'border-[var(--ha-line-soft)] bg-white/[0.03] text-[var(--ha-ink-3)]'
                  }`}
                  aria-hidden="true"
                >
                  {config.icon}
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium tabular-nums text-[var(--ha-ink-3)]">
                      Paso {index + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        done
                          ? 'bg-[var(--ha-glow)] text-[var(--ha-acc)]'
                          : 'bg-white/[0.05] text-[var(--ha-ink-2)]'
                      }`}
                    >
                      {done ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Hecho
                        </>
                      ) : (
                        <>
                          <Circle className="h-3.5 w-3.5" aria-hidden="true" />
                          Pendiente
                        </>
                      )}
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-[var(--ha-ink)]">
                    {config.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-[var(--ha-ink-2)]">{config.description}</p>
                </div>
              </div>

              {!done && (
                <Link
                  href={config.href}
                  onClick={config.onNavigate}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--ha-grad)] px-4 py-2.5 text-sm font-semibold text-[var(--ha-acc-ink)] shadow-[0_0_0_1px_rgba(212,175,55,0.25)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)] sm:ml-4"
                >
                  {config.cta}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}