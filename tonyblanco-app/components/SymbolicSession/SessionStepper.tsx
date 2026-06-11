/**
 * SessionStepper — guided assisted-session flow (Modo Interactivo Asistido).
 *
 * Walks the therapist through the deterministic session lifecycle:
 *   intake → structural → assisted_interpretation → session_notes → exercises → closed
 *
 * Safety:
 *  - The assisted interpretation stage is BLOCKED until the consent gate and the
 *    structural state are satisfied (canEnterAssistedInterpretation).
 *  - The role is resolved from the server profile (display + UI gating); the
 *    authoritative clinical unlock is enforced server-side at the BFF.
 *  - Notes / summary / exercises are validated with the role-aware policy by the
 *    orchestrator; rejected text surfaces inline warnings and is not stored.
 *
 * Observability (D6):
 *  - The optional onEvent prop is a fire-and-forget hook for interaction events
 *    (session_started / interpretation_accepted / exercise_completed). It must
 *    never block or break the flow; the caller decides where to send them.
 */

'use client';

import { useEffect, useState, type ComponentType } from 'react';
import {
  ClipboardCheck,
  GitBranch,
  Sparkles,
  FileText,
  Activity,
  CheckCircle2,
  Lock,
  AlertCircle,
  Stethoscope,
  Eye,
} from 'lucide-react';
import {
  SESSION_STAGE_ORDER,
  type SafetyRole,
  type SessionStage,
} from '@holistica/symbolic/session';
import type { TreeStructuralState } from '@holistica/symbolic/tree';
import { resolveClientSafetyRole } from '@/lib/clinical-role';
import { useSymbolicSession } from '@/lib/hooks/useSymbolicSession';
import { SymbolicInterpretationPanel } from '@/components/SymbolicInterpretation/SymbolicInterpretationPanel';

/** Interaction events emitted by the stepper for D6 observability. */
export type SessionInteractionEvent =
  | 'session_started'
  | 'interpretation_accepted'
  | 'exercise_completed';

export interface SessionStepperProps {
  /** Structural state of the Tree, built elsewhere in the app. */
  treeState?: TreeStructuralState;
  therapistId?: string;
  consultantRef?: string;
  correspondenceSystem?: string;
  /**
   * Optional fire-and-forget emitter for D6 interaction events. The stepper
   * never awaits it; emission must not block or break the session flow.
   */
  onEvent?: (
    event: SessionInteractionEvent,
    metadata?: Record<string, string | number | boolean>,
  ) => void;
}

const STAGE_META: Record<
  SessionStage,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  intake: { label: 'Acogida y consentimiento', icon: ClipboardCheck },
  structural: { label: 'Estado estructural', icon: GitBranch },
  assisted_interpretation: { label: 'Lectura asistida (IA)', icon: Sparkles },
  session_notes: { label: 'Notas y resumen', icon: FileText },
  exercises: { label: 'Ejercicios', icon: Activity },
  closed: { label: 'Cierre', icon: CheckCircle2 },
};

export function SessionStepper(props: SessionStepperProps) {
  const [role, setRole] = useState<SafetyRole | null>(null);

  useEffect(() => {
    let active = true;
    resolveClientSafetyRole()
      .then((r) => {
        if (active) setRole(r);
      })
      .catch(() => {
        if (active) setRole('observational');
      });
    return () => {
      active = false;
    };
  }, []);

  if (role === null) {
    return (
      <div
        className="flex items-center justify-center py-10 text-sm text-slate-500"
        role="status"
        aria-busy="true"
      >
        <div
          className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-2"
          aria-hidden="true"
        />
        Cargando modo de sesión…
      </div>
    );
  }

  return <SessionStepperInner role={role} {...props} />;
}

function SessionStepperInner({
  role,
  treeState,
  therapistId,
  consultantRef,
  correspondenceSystem,
  onEvent,
}: SessionStepperProps & { role: SafetyRole }) {
  const s = useSymbolicSession({ role, therapistId, consultantRef });
  const state = s.session;
  const reachedIndex = SESSION_STAGE_ORDER.indexOf(state.stage);

  const [activeStage, setActiveStage] = useState<SessionStage>('intake');
  const [consentChecked, setConsentChecked] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [exTitle, setExTitle] = useState('');
  const [exDesc, setExDesc] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  const consentState = state.consent.granted
    ? {
        mode: 'store_with_consent',
        acceptedAt: state.consent.grantedAt ?? new Date().toISOString(),
        version: 'swm-v3',
      }
    : undefined;

  function handleGrantConsent() {
    if (state.consent.granted) return;
    s.grantConsent({ grantedBy: therapistId ?? 'terapeuta' });
    onEvent?.('session_started');
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    const res = s.addNote({ author: therapistId ?? 'terapeuta', content: noteText });
    if (res.accepted) {
      setNoteText('');
      setWarnings([]);
    } else {
      setWarnings(res.warnings);
    }
  }

  function handleSaveSummary() {
    if (!summaryText.trim()) return;
    const res = s.setSummary(summaryText);
    setWarnings(res.accepted ? [] : res.warnings);
  }

  function handleAddExercise() {
    if (!exTitle.trim()) return;
    const res = s.addExerciseItem({ title: exTitle, description: exDesc });
    if (res.accepted) {
      setExTitle('');
      setExDesc('');
      setWarnings([]);
    } else {
      setWarnings(res.warnings);
    }
  }

  function handleCompleteExercise(ex: { id: string; completed?: boolean }) {
    if (ex.completed) return;
    s.completeExercise(ex.id);
    onEvent?.('exercise_completed');
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Sesión asistida</h3>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            role === 'clinical'
              ? 'bg-teal-100 text-teal-800'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {role === 'clinical' ? (
            <Stethoscope className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
          {role === 'clinical' ? 'Modo clínico' : 'Modo observacional'}
        </span>
      </div>

      {/* Stepper header */}
      <ol className="flex flex-wrap items-center gap-2 mb-5">
        {SESSION_STAGE_ORDER.map((stage, idx) => {
          const Meta = STAGE_META[stage];
          const Icon = Meta.icon;
          const isActive = stage === activeStage;
          const isDone = idx < reachedIndex;
          return (
            <li key={stage}>
              <button
                type="button"
                onClick={() => setActiveStage(stage)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-purple-500 bg-purple-50 text-purple-800'
                    : isDone
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span className="hidden sm:inline">{idx + 1}. {Meta.label}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Stage body */}
      <div className="min-h-[140px]">
        {activeStage === 'intake' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Registra el consentimiento informado del consultante antes de
              habilitar cualquier lectura asistida por IA.
            </p>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-700">
                Confirmo que cuento con el consentimiento informado del
                consultante para esta sesión asistida (SWM v3).
              </span>
            </label>
            <button
              type="button"
              disabled={!consentChecked || state.consent.granted}
              onClick={handleGrantConsent}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Registrar consentimiento
            </button>
            {state.consent.granted && (
              <p className="flex items-center gap-1 text-xs text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Consentimiento registrado
                {state.consent.grantedAt
                  ? ` · ${new Date(state.consent.grantedAt).toLocaleString('es-ES')}`
                  : ''}
              </p>
            )}
          </div>
        )}

        {activeStage === 'structural' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Adjunta el estado estructural del Árbol. Es requisito para la
              lectura asistida.
            </p>
            {!treeState ? (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Aún no hay un Árbol disponible. Constrúyelo primero para poder
                  adjuntar su estado estructural.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => s.attachStructural(treeState)}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
              >
                Adjuntar estado estructural
              </button>
            )}
            {state.treeState && (
              <p className="flex items-center gap-1 text-xs text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Estructura adjunta
              </p>
            )}
          </div>
        )}

        {activeStage === 'assisted_interpretation' && (
          <div className="space-y-3">
            {!s.gate.allowed ? (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-3">
                <p className="flex items-center gap-1 text-sm font-medium text-slate-700 mb-1">
                  <Lock className="h-4 w-4" /> Lectura asistida bloqueada
                </p>
                <ul className="ml-5 list-disc text-xs text-slate-600 space-y-0.5">
                  {s.gate.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <SymbolicInterpretationPanel
                interpretation={state.interpretation ?? null}
                isLoading={s.isGenerating}
                onRequestInterpretation={() =>
                  treeState &&
                  s.generateInterpretation({ treeState, correspondenceSystem })
                }
                role={role}
                editable
                onSaveEdits={(observations) => {
                  s.saveInterpretationEdits(observations);
                  onEvent?.('interpretation_accepted', {
                    observations: observations.length,
                  });
                }}
                consentState={consentState}
              />
            )}
            {s.error && (
              <p className="text-xs text-red-600" role="alert">
                {s.error}
              </p>
            )}
          </div>
        )}

        {activeStage === 'session_notes' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Nueva nota
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-purple-400 focus:outline-none"
                placeholder="Observaciones del terapeuta…"
              />
              <button
                type="button"
                onClick={handleAddNote}
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
              >
                Añadir nota
              </button>
            </div>

            {state.notes.length > 0 && (
              <ul className="space-y-1">
                {state.notes.map((n) => (
                  <li
                    key={n.id}
                    className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {n.content}
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-medium text-slate-700">
                Resumen de la sesión
              </label>
              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                rows={3}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-purple-400 focus:outline-none"
                placeholder="Síntesis de cierre…"
              />
              <button
                type="button"
                onClick={handleSaveSummary}
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
              >
                Guardar resumen
              </button>
              {state.summary && (
                <p className="flex items-center gap-1 text-xs text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Resumen guardado
                </p>
              )}
            </div>
          </div>
        )}

        {activeStage === 'exercises' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                value={exTitle}
                onChange={(e) => setExTitle(e.target.value)}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-purple-400 focus:outline-none"
                placeholder="Título del ejercicio"
              />
              <textarea
                value={exDesc}
                onChange={(e) => setExDesc(e.target.value)}
                rows={2}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-purple-400 focus:outline-none"
                placeholder="Descripción / consigna"
              />
              <button
                type="button"
                onClick={handleAddExercise}
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
              >
                Añadir ejercicio
              </button>
            </div>

            {state.exercises.length > 0 && (
              <ul className="space-y-1">
                {state.exercises.map((ex) => (
                  <li
                    key={ex.id}
                    className="flex items-start justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {ex.title}
                      </p>
                      {ex.description && (
                        <p className="text-xs text-slate-600">{ex.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCompleteExercise(ex)}
                      className={`shrink-0 rounded px-2 py-1 text-[10px] font-medium ${
                        ex.completed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {ex.completed ? 'Completado' : 'Marcar hecho'}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => {
                s.close();
                setActiveStage('closed');
              }}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
            >
              Cerrar sesión
            </button>
          </div>
        )}

        {activeStage === 'closed' && (
          <div className="space-y-2 text-sm text-slate-700">
            <p className="flex items-center gap-1 font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Sesión cerrada
            </p>
            <ul className="ml-5 list-disc text-xs text-slate-600 space-y-0.5">
              <li>Notas registradas: {state.notes.length}</li>
              <li>Ejercicios: {state.exercises.length}</li>
              <li>Resumen: {state.summary ? 'sí' : 'no'}</li>
              <li>Eventos de seguridad: {state.safetyLog.length}</li>
            </ul>
          </div>
        )}
      </div>

      {/* Inline safety warnings (notes / summary / exercises) */}
      {warnings.length > 0 && (
        <div
          className="mt-4 rounded-lg bg-red-50 border border-red-300 px-3 py-2"
          role="alert"
        >
          <p className="flex items-center gap-1 text-xs font-medium text-red-800 mb-1">
            <AlertCircle className="h-3 w-3" /> Texto bloqueado por seguridad (no
            se guardó):
          </p>
          <ul className="ml-4 list-disc text-xs text-red-700 space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
