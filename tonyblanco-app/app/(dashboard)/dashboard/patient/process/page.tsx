'use client';

import { GuidedBlock } from '@/components/ui/guided-block';
import PatientProcessTimeline from '@/components/patient-process/PatientProcessTimeline';
import { usePatientProcess } from '@/lib/usePatientProcess';

export default function PatientProcessPage() {
  const { snapshot, loading, error, refresh } = usePatientProcess();
  const items = snapshot?.items ?? [];
  const stats = snapshot?.stats;

  return (
    <div className="max-w-3xl mx-auto space-y-8 px-4 sm:px-0">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Tu proceso terapéutico</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Aquí puedes seguir el camino que recorres con tu terapeuta: las exploraciones que te
          invita a completar, las que ya has cerrado y el trabajo simbólico que se va registrando
          a tu favor. Tienes derecho a ver cómo avanza tu proceso, sin detalles reservados para la
          sesión.
        </p>
      </header>

      {stats && stats.total > 0 ? (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-500">Completados</p>
            <p className="text-xl font-semibold text-emerald-700">{stats.completed}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-500">Pendientes</p>
            <p className="text-xl font-semibold text-blue-700">{stats.pending}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-500">Con tu terapeuta</p>
            <p className="text-xl font-semibold text-violet-700">{stats.therapistActivities}</p>
          </div>
        </div>
      ) : null}

      {error ? (
        <GuidedBlock
          variant="info"
          role="patient"
          title="No pudimos cargar tu proceso"
          description={error}
          actions={[{ label: 'Reintentar', onClick: refresh }]}
        />
      ) : null}

      {!error && !loading && items.length === 0 ? (
        <GuidedBlock
          variant="info"
          role="patient"
          title="Tu proceso está comenzando"
          description="Cuando tu terapeuta te asigne exploraciones o registre trabajo simbólico por ti, verás cada paso aquí en orden. Mientras tanto, puedes revisar tus exploraciones disponibles en la pestaña Tests."
          actions={[
            { label: 'Ver exploraciones', href: '/dashboard/patient/tests' },
          ]}
        />
      ) : null}

      <PatientProcessTimeline items={items} loading={loading && !snapshot} />
    </div>
  );
}