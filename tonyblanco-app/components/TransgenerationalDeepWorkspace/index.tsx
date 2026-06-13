'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { GitBranch } from 'lucide-react';
import TransgenerationalSidebar from './TransgenerationalSidebar';
import TransgenerationalVisualCore from './TransgenerationalVisualCore';
import GenealogyPersonPanel from './GenealogyPersonPanel';
import GenealogyEventPanel from './GenealogyEventPanel';
import type { TransgenerationalSectionId } from './types';
import type { GenealogyOverview } from '@/lib/api/genealogy-api';
import { getGenealogyOverview } from '@/lib/api/genealogy-api';
import { getActivePatientId } from '@/lib/active-patient';
import { GuidedBlock } from '@/components/ui/guided-block';

export default function TransgenerationalDeepWorkspace() {
  const [activeSection, setActiveSection] = useState<TransgenerationalSectionId>('tree');
  const [patientId, setPatientId] = useState<number | null>(null);
  const [overview, setOverview] = useState<GenealogyOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async (pid: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getGenealogyOverview(pid);
      setOverview(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Error al cargar datos del árbol.');
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      const pid = getActivePatientId();
      setPatientId(pid);
      if (pid) {
        load(pid);
      } else {
        setOverview(null);
      }
    };

    sync();
    window.addEventListener('activePatientChanged', sync);
    return () => window.removeEventListener('activePatientChanged', sync);
  }, [load]);

  const handleChanged = useCallback(() => {
    if (patientId) load(patientId);
  }, [patientId, load]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <GitBranch className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace relacional</p>
            <h1 className="text-2xl font-semibold text-gray-900">Transgeneracional Profundo</h1>
          </div>
        </div>
        <Link
          href="/dashboard/therapist"
          className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
        >
          Volver al espacio clinico
        </Link>
      </header>

      <div className="flex">
        <TransgenerationalSidebar activeSection={activeSection} onChange={setActiveSection} />
        <main className="flex-1 px-6 py-6">
          <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            Observacional. Sin inferencia ni generacion automatica.
          </div>

          {loadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {!patientId ? (
            <GuidedBlock
              variant="info"
              role="therapist"
              title="Sin consultante activo"
              description="Selecciona un consultante para ver y editar el árbol genealógico transgeneracional."
              steps={[
                { label: 'Selecciona un consultante en el indicador superior' },
                { label: 'El árbol y los eventos se cargarán automáticamente' },
              ]}
              actions={[{ label: 'Elegir consultante', href: '/dashboard/therapist/patients' }]}
            />
          ) : activeSection === 'events' ? (
            <GenealogyEventPanel
              patientId={patientId}
              events={overview?.events ?? []}
              people={overview?.people ?? []}
              onChanged={handleChanged}
            />
          ) : (
            <div className="flex gap-6 items-start">
              <TransgenerationalVisualCore activeSection={activeSection} />
              <aside className="w-72 space-y-4">
                {activeSection === 'tree' ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    {loading ? (
                      <p className="text-xs text-gray-500">Cargando árbol…</p>
                    ) : (
                      <GenealogyPersonPanel
                        patientId={patientId}
                        people={overview?.people ?? []}
                        onChanged={handleChanged}
                      />
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900">Síntesis</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Disponible en F5 (notas humanas de integración).
                    </p>
                  </div>
                )}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    {overview?.people.length ?? 0}
                  </span>{' '}
                  persona{overview?.people.length !== 1 ? 's' : ''} ·{' '}
                  <span className="font-medium text-gray-700">
                    {overview?.events.length ?? 0}
                  </span>{' '}
                  evento{overview?.events.length !== 1 ? 's' : ''}
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
