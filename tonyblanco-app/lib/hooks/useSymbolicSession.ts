/**
 * useSymbolicSession — React state wrapper over the deterministic session
 * orchestrator (packages/symbolic/session). Modo Interactivo Asistido (Híbrido).
 *
 * The orchestrator itself is pure and framework-agnostic; this hook holds the
 * SymbolicSessionState in React state and exposes ergonomic actions. Safety is
 * enforced by the orchestrator (consent gate + role-aware text validation) and,
 * for the AI interpretation, by the BFF route which resolves the role on the
 * server. The hook NEVER decides the clinical role on its own — it receives the
 * already-resolved role.
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  createSession,
  recordConsent,
  revokeConsent,
  attachStructuralState,
  attachInterpretation,
  canEnterAssistedInterpretation,
  addSessionNote,
  setSessionSummary,
  addExercise,
  markExerciseCompleted,
  closeSession,
  type GuardResult,
  type SafetyRole,
  type SymbolicSessionState,
} from '@holistica/symbolic/session';
import type {
  SymbolicInterpretation,
  SymbolicObservation,
  SymbolicSafetyLevel,
  TreeStructuralState,
} from '@holistica/symbolic/tree';

function authHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

export interface UseSymbolicSessionInput {
  /** Role resolved upstream (server/profile). Never decided by this hook. */
  role: SafetyRole;
  therapistId?: string;
  consultantRef?: string;
}

export interface TextActionResult {
  accepted: boolean;
  warnings: string[];
}

export interface GenerateInterpretationInput {
  treeState: TreeStructuralState;
  safetyLevel?: SymbolicSafetyLevel;
  correspondenceSystem?: string;
  focusAreas?: string[];
}

export function useSymbolicSession({
  role,
  therapistId,
  consultantRef,
}: UseSymbolicSessionInput) {
  const [session, setSession] = useState<SymbolicSessionState>(() =>
    createSession({ role, therapistId, consultantRef }),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gate: GuardResult = useMemo(
    () => canEnterAssistedInterpretation(session),
    [session],
  );

  const grantConsent = useCallback(
    (args: { grantedBy?: string; note?: string } = {}) => {
      setSession((s) => recordConsent(s, args));
    },
    [],
  );

  const revoke = useCallback(() => {
    setSession((s) => revokeConsent(s));
  }, []);

  const attachStructural = useCallback((treeState: TreeStructuralState) => {
    setSession((s) => attachStructuralState(s, treeState));
  }, []);

  const generateInterpretation = useCallback(
    async (input: GenerateInterpretationInput) => {
      const currentGate = canEnterAssistedInterpretation(session);
      if (!currentGate.allowed) {
        setError(currentGate.reasons.join(' '));
        return;
      }
      setIsGenerating(true);
      setError(null);
      try {
        const res = await fetch('/api/symbolic/v1/interpret', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            treeState: input.treeState,
            safetyLevel: input.safetyLevel ?? 'educational',
            swmV3Consent: true,
            correspondenceSystem: input.correspondenceSystem,
            focusAreas: input.focusAreas,
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(
            (errBody as { error?: string; message?: string }).error ||
              (errBody as { message?: string }).message ||
              `Error ${res.status} al generar la interpretación`,
          );
        }
        const payload = await res.json();
        const data = (payload?.data ?? payload) as {
          interpretation: SymbolicInterpretation;
        };
        setSession((s) => attachInterpretation(s, data.interpretation).state);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Error al generar la interpretación',
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [session],
  );

  const saveInterpretationEdits = useCallback(
    (observations: SymbolicObservation[]) => {
      setSession((s) => {
        if (!s.interpretation) return s;
        const updated: SymbolicInterpretation = {
          ...s.interpretation,
          observations,
        };
        return attachInterpretation(s, updated).state;
      });
    },
    [],
  );

  const addNote = useCallback(
    (args: { author: string; content: string }): TextActionResult => {
      const result = addSessionNote(session, args);
      setSession(result.state);
      return { accepted: result.accepted, warnings: result.warnings };
    },
    [session],
  );

  const setSummary = useCallback(
    (summary: string): TextActionResult => {
      const result = setSessionSummary(session, summary);
      setSession(result.state);
      return { accepted: result.accepted, warnings: result.warnings };
    },
    [session],
  );

  const addExerciseItem = useCallback(
    (args: { title: string; description: string }): TextActionResult => {
      const result = addExercise(session, args);
      setSession(result.state);
      return { accepted: result.accepted, warnings: result.warnings };
    },
    [session],
  );

  const completeExercise = useCallback((exerciseId: string) => {
    setSession((s) => markExerciseCompleted(s, exerciseId));
  }, []);

  const close = useCallback(() => {
    setSession((s) => closeSession(s));
  }, []);

  return {
    session,
    role,
    gate,
    isGenerating,
    error,
    grantConsent,
    revokeConsent: revoke,
    attachStructural,
    generateInterpretation,
    saveInterpretationEdits,
    addNote,
    setSummary,
    addExerciseItem,
    completeExercise,
    close,
  };
}
