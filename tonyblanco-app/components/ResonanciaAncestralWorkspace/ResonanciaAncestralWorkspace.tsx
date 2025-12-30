'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import useActiveConsultante from '@/hooks/useActiveConsultante';

export default function ResonanciaAncestralWorkspace() {
  const consultante = useActiveConsultante();

  const identityLabel = useMemo(() => {
    if (!consultante) return null;
    const birth = consultante.fecha_nacimiento
      ? new Date(consultante.fecha_nacimiento).toLocaleDateString('es-ES')
      : '-';
    return `ID ${consultante.id} · ${birth}`;
  }, [consultante]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbólico</p>
            <h1 className="text-2xl font-semibold text-gray-900">Resonancia Ancestral</h1>
            <p className="text-sm text-gray-600">Cartografía simbólica — no clínica.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {consultante ? (
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-900">{consultante.nombre_completo}</div>
              <div className="text-xs text-gray-500">{identityLabel}</div>
            </div>
          ) : null}
          <Link
            href="/dashboard/therapist"
            className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
          >
            Volver al espacio clínico
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {!consultante ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Sin consultante activo</h2>
            <p className="mt-2 text-sm text-gray-600">
              Seleccione un consultante para visualizar la Resonancia Ancestral.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Este workspace es observacional y simbólico. No realiza inferencias ni cálculos automáticos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
              Este espacio permite observar patrones simbólicos y relacionales del sistema. No realiza inferencias
              automáticas ni sustituye la lectura profesional del terapeuta.
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">T1</div>
                <h3 className="mt-1 text-base font-semibold text-gray-900">Mapa de resonancia</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Representación visual de las resonancias relacionales observadas en el sistema. Funciona como marco
                  simbólico de referencia para orientar la lectura, sin cálculos ni interpretaciones automáticas.
                </p>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">T2</div>
                <h3 className="mt-1 text-base font-semibold text-gray-900">Ejes ancestrales</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Visualización de ejes simbólicos recurrentes dentro del sistema relacional. Permite observar
                  direcciones de repetición o continuidad sin establecer conclusiones.
                </p>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">T3</div>
                <h3 className="mt-1 text-base font-semibold text-gray-900">Resonancias</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Listado de resonancias identificadas por observación directa del terapeuta. Opera como registro
                  simbólico, sin jerarquizar ni automatizar significados.
                </p>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">T4</div>
                <h3 className="mt-1 text-base font-semibold text-gray-900">Registro</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Espacio de registro manual para notas simbólicas del proceso. No genera conclusiones automáticas ni
                  recomendaciones.
                </p>
              </section>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Cuando algunos datos del consultante no están disponibles, el workspace permanece accesible, aunque
              ciertas visualizaciones pueden mostrarse de forma limitada.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
