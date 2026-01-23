'use client';

// ⛔ FROZEN: DO NOT ACTIVATE - See FROZEN.md
console.warn('[AISymbolicWorkspace] FROZEN: Este workspace está congelado hasta definir gobernanza IA');

import AISymbolicDraftView from './AISymbolicDraftView';
import { mockContext, mockCrossAnalysis } from './mock';

export default function AISymbolicWorkspace() {
  return (
    <section className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">
            AI - Hypothesis Draft
          </h1>
          <p className="text-sm text-gray-500">
            Espacio de reflejo simbolico (solo lectura).
          </p>
        </header>
        <AISymbolicDraftView context={mockContext} analysis={mockCrossAnalysis} />
      </div>
    </section>
  );
}
