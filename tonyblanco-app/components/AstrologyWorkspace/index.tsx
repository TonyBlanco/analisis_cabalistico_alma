'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Telescope } from 'lucide-react';
import AstrologySidebar from './AstrologySidebar';
import AstrologyVisualCore from './AstrologyVisualCore';
import useActiveConsultante from '@/hooks/useActiveConsultante';

function subscribeToActivePatient(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler: EventListener = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('activePatientChanged', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('activePatientChanged', handler);
  };
}

export default function AstrologyWorkspace() {
  const [houseSystem, setHouseSystem] = useState<string>('P');
  const [zodiacType, setZodiacType] = useState<string>('tropical');

  const consultante = useActiveConsultante();

  const renderContent = () => {
    if (!consultante) {
      return (
        <section className="flex-1 bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-6">
              <Telescope className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Identidad no seleccionada</h2>
          <p className="text-gray-600 mb-6">
            Para ver la carta natal, primero seleccione una identidad válida desde el dashboard.
          </p>
          <Link
            href="/dashboard/therapist"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ir al Dashboard
          </Link>
        </section>
      );
    }

    return <AstrologyVisualCore patientId={consultante.id} houseSystem={houseSystem} zodiacType={zodiacType} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Telescope className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbólico</p>
            <h1 className="text-2xl font-semibold text-gray-900">Astrología — Visualización profesional del consultante</h1>
          </div>
        </div>
        <Link
          href="/dashboard/therapist"
          className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
        >
          Volver al espacio principal
        </Link>
      </header>

      <div className="flex">
        <AstrologySidebar
          houseSystem={houseSystem}
          setHouseSystem={setHouseSystem}
          zodiacType={zodiacType}
          setZodiacType={setZodiacType}
        />

        <main className="flex-1 px-6 py-6">
          <div className="flex gap-6 items-start">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
