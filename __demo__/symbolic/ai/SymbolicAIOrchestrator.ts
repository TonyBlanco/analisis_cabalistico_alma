import type { PatientContext, VisualizationState } from '@/components/BodySoulVisualization/types';

export interface SymbolicAIInput {
  patientContext: PatientContext;
  symbolicState: VisualizationState;
}

export interface SymbolicAIInsight {
  label: string;
  summary: string;
  signals: string[];
  confidence: 'low' | 'medium' | 'high';
  disclaimer: string;
}

export default function SymbolicAIOrchestrator({
  patientContext,
  symbolicState,
}: SymbolicAIInput): SymbolicAIInsight {
  const activeLayers = symbolicState.activeLayers.join(', ') || 'none';
  const focus = symbolicState.selectedSefirahId || symbolicState.selectedBodyRegionId || 'none';

  return {
    label: 'DEMO SYMBOLIC INSIGHT',
    summary: `Observed layers: ${activeLayers}. Current focus: ${focus}.`,
    signals: [
      `Patient: ${patientContext.patientId}`,
      `Side: ${symbolicState.side}`,
      `Notes count: ${symbolicState.notes.length}`,
    ],
    confidence: 'low',
    disclaimer: 'DEMO / NON-CLINICAL: Symbolic exploration only. Not clinical.',
  };
}
