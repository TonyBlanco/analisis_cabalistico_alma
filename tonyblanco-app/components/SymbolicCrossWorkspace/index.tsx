'use client';

import SymbolicCrossView from './SymbolicCrossView';
import { mockCrossDataset } from './mock';

export default function SymbolicCrossWorkspace() {
  return (
    <section className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">
            Symbolic Cross Workspace
          </h1>
          <p className="text-sm text-gray-500">
            Cruce observacional entre Tarot, Arbol y Astrologia.
          </p>
        </header>
        <SymbolicCrossView dataset={mockCrossDataset} />
      </div>
    </section>
  );
}
