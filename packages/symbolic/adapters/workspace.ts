import type { SymbolicContext, WorkspaceContextInput } from './types';

export function buildSymbolicContext(input: WorkspaceContextInput): SymbolicContext {
  return {
    patientId: input.patientId ?? null,
    workspaceId: input.workspaceId ?? null,
    sessionId: input.sessionId ?? null,
    source: input.source ?? null,
  };
}
