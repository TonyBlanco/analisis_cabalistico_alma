'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { SystemId } from '@holistica/symbolic/tree/symbolic-interpreter.types';
import { CorrespondencesPanel } from './CorrespondencesPanel';

export default function CorrespondencesWorkspace() {
  const [systemId, setSystemId] = useState<SystemId>('jewish-traditional');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Referencia simbólica</p>
            <h1 className="text-2xl font-semibold text-gray-900">Correspondencias del Árbol</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/therapist/cabala-aplicada"
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cabala Aplicada
          </Link>
          <Link
            href="/dashboard/therapist"
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Volver al espacio clínico
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6">
        <div
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="note"
          aria-label="Aviso no clínico"
        >
          Tablas de referencia estructural-simbólica. Sin interpretación clínica ni consejo personal.
        </div>

        <section
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          aria-labelledby="correspondences-workspace-title"
        >
          <h2 id="correspondences-workspace-title" className="sr-only">
            Panel de correspondencias por sistema
          </h2>
          <CorrespondencesPanel systemId={systemId} onSystemChange={setSystemId} />
        </section>
      </main>
    </div>
  );
}