import type { PatientContext, VisualizationState } from '@/components/BodySoulVisualization/types';

export interface SymbolicAIInput {
  patientContext: PatientContext;
  symbolicState: VisualizationState;
  astrologyState?: {
    focus?: string;
    notes?: string[];
  };
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
  astrologyState,
}: SymbolicAIInput): SymbolicAIInsight {
  const activeLayers = symbolicState.activeLayers.join(', ') || 'none';
  const focus = symbolicState.selectedSefirahId || symbolicState.selectedBodyRegionId || 'none';
  const astrologyFocus = astrologyState?.focus || 'none';
  const astrologyNotes = astrologyState?.notes?.length ?? 0;

  return {
    label: 'DEMO SYMBOLIC INSIGHT',
    summary: `Observed layers: ${activeLayers}. Current focus: ${focus}. Astrology focus: ${astrologyFocus}.`,
    signals: [
      `Patient: ${patientContext.patientId}`,
      `Side: ${symbolicState.side}`,
      `Notes count: ${symbolicState.notes.length}`,
      `Astrology notes: ${astrologyNotes}`,
    ],
    confidence: 'low',
    disclaimer: 'DEMO / NON-CLINICAL: Symbolic exploration only. Not clinical.',
  };
}
