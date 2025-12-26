'use client';

// OBSOLETO (SWM workspaces cerrados).
// Se conserva como stub para evitar imports residuales en ramas antiguas.

export type CabalaAplicadaPanelState = {
  patientId: number | null;
  patientName: string | null;
  selectedMethodId: string | null;
  treeState: unknown | null;
  backendStructuralState: Record<string, unknown> | null;
  updatedAt: number;
};

export function setCabalaAplicadaPanelState(_: Partial<Omit<CabalaAplicadaPanelState, 'updatedAt'>>) {
  // no-op
}

export function getCabalaAplicadaPanelState(): CabalaAplicadaPanelState {
  return {
    patientId: null,
    patientName: null,
    selectedMethodId: null,
    treeState: null,
    backendStructuralState: null,
    updatedAt: Date.now(),
  };
}

export function useCabalaAplicadaPanelState(): CabalaAplicadaPanelState {
  return getCabalaAplicadaPanelState();
}
