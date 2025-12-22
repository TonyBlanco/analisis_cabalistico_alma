export interface WorkspaceContextInput {
  patientId?: string | number | null;
  workspaceId?: string | null;
  sessionId?: string | null;
  source?: string | null;
}

export interface SymbolicContext {
  patientId: string | number | null;
  workspaceId: string | null;
  sessionId: string | null;
  source: string | null;
}

export type SymbolicContextAdapter = (
  input: WorkspaceContextInput
) => SymbolicContext;
