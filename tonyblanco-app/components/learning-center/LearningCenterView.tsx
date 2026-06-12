'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Lightbulb,
  Search,
  Sparkles,
} from 'lucide-react';

import {
  consumeTherapistLearningAutotour,
  markTherapistLearningLandingSeen,
} from '@/lib/therapistOnboarding';
import type { LearningCenterTourStep } from './learning-center-catalog';
import type { LearningCenterCatalog, LearningCenterGuideWithContent } from './learning-center-content';
import { MarkdownRenderer } from './MarkdownRenderer';

type LearningCenterViewProps = {
  catalog: LearningCenterCatalog;
};

type TourState = {
  status: 'idle' | 'running' | 'completed' | 'dismissed';
  step: number;
};

const TOUR_STORAGE_KEY = 'learning-center-tour-state';

function readTourState(): TourState {
  if (typeof window === 'undefined') {
    return { status: 'idle', step: 0 };
  }

  try {
    const raw = window.localStorage.getItem(TOUR_STORAGE_KEY);
    if (!raw) {
      return { status: 'idle', step: 0 };
    }

    const parsed = JSON.parse(raw) as Partial<TourState>;
    return {
      status: parsed.status ?? 'idle',
      step: typeof parsed.step === 'number' ? parsed.step : 0,
    };
  } catch {
    return { status: 'idle', step: 0 };
  }
}

function writeTourState(nextState: TourState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(nextState));
}

function getGuideAnchor(guide: LearningCenterGuideWithContent) {
  return guide.slug;
}

function LearningCenterTour({
  tourSteps,
  tourState,
  setTourState,
}: {
  tourSteps: LearningCenterTourStep[];
  tourState: TourState;
  setTourState: React.Dispatch<React.SetStateAction<TourState>>;
}) {
  const isOpen = tourState.status === 'running';
  const activeStep = tourSteps[tourState.step] ?? tourSteps[0];

  useEffect(() => {
    if (!isOpen || !activeStep?.anchorId) {
      return;
    }

    const target = document.getElementById(activeStep.anchorId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeStep?.anchorId, isOpen]);

  if (!isOpen) {
    return null;
  }

  const isLastStep = tourState.step >= tourSteps.length - 1;

  const closeTour = (status: TourState['status']) => {
    const nextState: TourState = {
      status,
      step: status === 'completed' ? tourSteps.length - 1 : tourState.step,
    };
    setTourState(nextState);
    writeTourState(nextState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-sky-200">
              <Sparkles className="h-4 w-4" />
              Tour guiado
            </div>
            <h3 className="mt-2 text-xl font-semibold">{activeStep?.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">{activeStep?.description}</p>
          </div>
          <button
            type="button"
            onClick={() => closeTour('dismissed')}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
            <span>Paso {tourState.step + 1} de {tourSteps.length}</span>
            <span>{activeStep?.anchorId}</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">{activeStep?.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{activeStep?.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setTourState((current) => {
                  const nextStep = Math.max(0, current.step - 1);
                  const nextState = { ...current, status: 'running' as const, step: nextStep };
                  writeTourState(nextState);
                  return nextState;
                })
              }
              disabled={tourState.step === 0}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            <button
              type="button"
              onClick={() =>
                setTourState((current) => {
                  const nextStep = isLastStep ? current.step : current.step + 1;
                  const nextState: TourState = {
                    status: isLastStep ? 'completed' : 'running',
                    step: nextStep,
                  };
                  writeTourState(nextState);
                  return nextState;
                })
              }
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {isLastStep ? 'Terminar tour' : 'Siguiente'}
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => closeTour('dismissed')}
              className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4"
            >
              Guardar para después
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearningCenterIndexCard({
  catalog,
  onStartTour,
  tourState,
}: {
  catalog: LearningCenterCatalog;
  onStartTour: () => void;
  tourState: TourState;
}) {
  const buttonLabel =
    tourState.status === 'running'
      ? 'Reanudar tour'
      : tourState.status === 'completed'
        ? 'Reabrir tour'
        : tourState.status === 'dismissed'
          ? 'Abrir tour'
          : 'Empezar tour';

  return (
    <section
      id="learning-index"
      className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 p-6 text-white shadow-2xl shadow-slate-950/20"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-100">
            <Lightbulb className="h-3.5 w-3.5" />
            {catalog.hero.eyebrow}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/80">
            Tour guiado
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{catalog.hero.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">{catalog.hero.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onStartTour}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            <Sparkles className="h-4 w-4" />
            {buttonLabel}
          </button>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <p className="font-medium text-white">Estado del tour</p>
            <p className="mt-1">
              {tourState.status === 'idle' && 'Aún no se ha iniciado.'}
              {tourState.status === 'running' && 'Está activo y se puede reanudar.'}
              {tourState.status === 'completed' && 'Se completó y puedes abrirlo otra vez.'}
              {tourState.status === 'dismissed' && 'Se guardó para más tarde.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LearningCenterView({ catalog }: LearningCenterViewProps) {
  const [query, setQuery] = useState('');
  const [selectedGuideSlug, setSelectedGuideSlug] = useState(catalog.guides[0]?.slug ?? '');
  const [tourState, setTourState] = useState<TourState>({ status: 'idle', step: 0 });

  useEffect(() => {
    setTourState(readTourState());
    markTherapistLearningLandingSeen();
  }, []);

  useEffect(() => {
    if (!catalog.tourSteps.length) {
      return;
    }

    if (!consumeTherapistLearningAutotour()) {
      return;
    }

    const nextState: TourState = { status: 'running', step: 0 };
    setTourState(nextState);
    writeTourState(nextState);
  }, [catalog.tourSteps.length]);

  useEffect(() => {
    if (tourState.status === 'idle') {
      return;
    }

    writeTourState(tourState);
  }, [tourState]);

  const filteredGuides = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return catalog.guides;
    }

    return catalog.guides.filter((guide) =>
      [guide.title, guide.summary, guide.category].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [catalog.guides, query]);

  useEffect(() => {
    if (!filteredGuides.some((guide) => guide.slug === selectedGuideSlug)) {
      setSelectedGuideSlug(filteredGuides[0]?.slug ?? catalog.guides[0]?.slug ?? '');
    }
  }, [catalog.guides, filteredGuides, selectedGuideSlug]);

  const selectedGuide = filteredGuides.find((guide) => guide.slug === selectedGuideSlug) ?? filteredGuides[0];

  const openTour = () => {
    const nextState: TourState =
      tourState.status === 'running'
        ? tourState
        : {
            status: 'running',
            step: tourState.status === 'completed' ? catalog.tourSteps.length - 1 : tourState.step,
          };
    setTourState(nextState);
    writeTourState(nextState);
  };

  return (
    <div className="space-y-8">
      <LearningCenterIndexCard catalog={catalog} onStartTour={openTour} tourState={tourState} />
      <LearningCenterTour tourSteps={catalog.tourSteps} tourState={tourState} setTourState={setTourState} />

      <section id="learning-guides" className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                <BookOpen className="h-4 w-4" />
                Biblioteca
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Guías por módulo</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Filtra por nombre o categoría y abre la guía canónica correspondiente.
              </p>
            </div>

            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="sr-only">Buscar en el centro de aprendizaje</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-48 bg-transparent outline-none placeholder:text-slate-400"
                placeholder="Buscar guía"
                aria-label="Buscar en el centro de aprendizaje"
              />
            </label>
          </div>

          <div className="grid gap-3">
            {filteredGuides.map((guide) => {
              const isSelected = guide.slug === selectedGuide?.slug;
              return (
                <button
                  key={guide.slug}
                  type="button"
                  onClick={() => setSelectedGuideSlug(guide.slug)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-sky-300 bg-sky-50 shadow-[0_0_0_1px_rgba(14,165,233,0.18)]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {guide.category}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">{guide.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{guide.summary}</p>
                    </div>
                    <FileText className={`h-5 w-5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                  </div>
                </button>
              );
            })}
            {!filteredGuides.length && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                No encontramos guías con ese filtro. Prueba con otro término.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                <Filter className="h-4 w-4" />
                Guía seleccionada
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {selectedGuide?.title ?? 'Sin guía seleccionada'}
              </h2>
            </div>
            {selectedGuide && (
              <Link
                href={`#${getGuideAnchor(selectedGuide)}`}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Ir al contenido
              </Link>
            )}
          </div>

          {selectedGuide ? (
            <article id={getGuideAnchor(selectedGuide)} className="rounded-2xl bg-slate-50 p-4">
              <MarkdownRenderer markdown={selectedGuide.content} className="space-y-4" />
            </article>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              Selecciona una guía para leer el documento canonico.
            </div>
          )}
        </div>
      </section>

      <section id="learning-reference" className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            <FileText className="h-4 w-4" />
            {catalog.faq.title}
          </div>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{catalog.faq.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{catalog.faq.summary}</p>
          <div className="mt-4">
            <MarkdownRenderer markdown={catalog.faq.content} />
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            <BookOpen className="h-4 w-4" />
            {catalog.glossary.title}
          </div>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{catalog.glossary.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{catalog.glossary.summary}</p>
          <div className="mt-4">
            <MarkdownRenderer markdown={catalog.glossary.content} />
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            <Sparkles className="h-4 w-4" />
            {catalog.news.title}
          </div>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{catalog.news.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{catalog.news.summary}</p>
          <div className="mt-4">
            <MarkdownRenderer markdown={catalog.news.content} />
          </div>
        </article>
      </section>

      <section id="learning-help" className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              <Lightbulb className="h-4 w-4" />
              Ayuda
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Asistente de ayuda de uso</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Este panel describe el fallback visible en la interfaz. La ayuda flotante usa documentación canónica,
              responde solo sobre uso del producto y sugiere una guía cuando el grounding no es suficiente.
            </p>
          </div>
          <p className="text-sm text-slate-500">Usa el botón flotante para abrir el panel rápido.</p>
        </div>
      </section>
    </div>
  );
}
