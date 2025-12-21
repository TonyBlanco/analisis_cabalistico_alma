'use client';

import type { AISymbolicContext, SymbolicCrossAnalysis } from './types';
import Observations from './sections/Observations';
import Hypotheses from './sections/Hypotheses';
import SymbolicLinks from './sections/SymbolicLinks';
import Disclaimers from './sections/Disclaimers';

interface AISymbolicDraftViewProps {
  context: AISymbolicContext;
  analysis: SymbolicCrossAnalysis;
}

export default function AISymbolicDraftView({
  context,
  analysis,
}: AISymbolicDraftViewProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          AI - Hypothesis Draft
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="rounded-full bg-gray-100 px-2 py-1">
            Paciente: {context.patientId}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-1">
            Sistema: {context.system}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-1">
            Fecha: {new Date(context.timestamp).toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>
      <Observations context={context} />
      <SymbolicLinks analysis={analysis} />
      <Hypotheses analysis={analysis} />
      <Disclaimers />
    </div>
  );
}
