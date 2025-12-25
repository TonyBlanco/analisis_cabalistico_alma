'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Telescope } from 'lucide-react';
import AstrologySidebar from './AstrologySidebar';
import AstrologyVisualCore from './AstrologyVisualCore';
import type { AstrologyViewMode } from './types';
import { getActivePatientId } from '@/lib/active-patient';

export default function AstrologyWorkspace() {
  const [activeView, setActiveView] = useState<AstrologyViewMode>('visual');
  const [houseSystem, setHouseSystem] = useState<string>('P'); // P=Placidus default
  const [zodiacType, setZodiacType] = useState<string>('tropical');
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Leer paciente activo usando la función correcta
    const patientId = getActivePatientId();
    console.log('AstrologyWorkspace - activePatientId from getActivePatientId():', patientId);
    setActivePatientId(patientId);
    setIsLoading(false);

    // Listener para cambios en el paciente activo
    const handleStorageChange = () => {
      const newPatientId = getActivePatientId();
      console.log('AstrologyWorkspace - patient changed:', newPatientId);
      setActivePatientId(newPatientId);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('activePatientChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('activePatientChanged', handleStorageChange);
    };
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="flex-1 bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </section>
      );
    }

    if (!activePatientId) {
      return (
        <section className="flex-1 bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-6">
              <Telescope className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Selecciona un paciente
          </h2>
          <p className="text-gray-600 mb-6">
            Para ver la carta natal, primero selecciona un paciente activo desde el dashboard
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

    switch (activeView) {
      case 'visual':
        return <AstrologyVisualCore patientId={activePatientId} houseSystem={houseSystem} zodiacType={zodiacType} />;
      case 'correspondences':
        return (
          <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-gray-500">Correspondencias - Deshabilitado</p>
          </section>
        );
      case 'synthesis':
        return (
          <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-gray-500">Síntesis - Deshabilitado</p>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Telescope className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbolico</p>
            <h1 className="text-2xl font-semibold text-gray-900">Astrologia</h1>
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
        <AstrologySidebar
          activeView={activeView}
          onViewChange={setActiveView}
          houseSystem={houseSystem}
          setHouseSystem={setHouseSystem}
          zodiacType={zodiacType}
          setZodiacType={setZodiacType}
        />
        <main className="flex-1 px-6 py-6">
          <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            Observacional. Con interpretación asistida, sin predicción clínica, sin automatización decisoria.
          </div>
          <div className="flex gap-6 items-start">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
