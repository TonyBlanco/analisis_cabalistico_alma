"use client";

import Link from 'next/link';
import useActiveConsultante from '@/hooks/useActiveConsultante';
import AstrologyProfessionalView from '@/components/AstrologyWorkspace/AstrologyProfessionalView';
import { useNatalChart } from '@/hooks/useNatalChart';
import { getCanonicalConsultantIdentity, getMissingCanonicalFields } from '@/hooks/getCanonicalConsultantIdentity';

const FIELD_LABELS: Record<string, string> = {
  birth_time: 'Hora de nacimiento',
  timezone: 'Zona horaria',
  city: 'Ciudad de nacimiento',
  country: 'País de nacimiento',
  lat: 'Latitud (coordenadas)',
  lon: 'Longitud (coordenadas)',
};

/**
 * Therapist astrology page: uses a professional, read-only visual.
 * - Does not import or render training/study providers or mode contexts.
 * - Visual component receives data and never calls backend itself.
 */
export default function AstrologyPage() {
  const consultante = useActiveConsultante();

  // Call natal hook unconditionally to keep hook order stable
  const { chart, analysisResult, calculateChart, refetch } = useNatalChart(consultante?.id ?? undefined);

  // Derive canonical identity using prioritized sources (snapshot -> consultante)
  const canonical = getCanonicalConsultantIdentity(chart ?? analysisResult?.natal ?? null, consultante ?? null);

  if (!canonical) {
    const snapLike = consultante
      ? {
          birth_time: consultante.hora_nacimiento,
          birth_timezone: consultante.timezone,
          birth_city: consultante.ciudad,
          birth_country: consultante.pais,
          birth_latitude: consultante.lat,
          birth_longitude: consultante.long,
        }
      : null;
    const missing = getMissingCanonicalFields(snapLike);
    const missingFields = Object.entries(missing)
      .filter(([, absent]) => absent)
      .map(([key]) => FIELD_LABELS[key] ?? key);

    return (
      <div className="min-h-90 bg-white border border-gray-200 rounded-xl p-6 max-w-md mx-auto mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Datos de nacimiento incompletos</h2>
        {!consultante ? (
          <p className="mt-2 text-sm text-gray-600">
            No hay un consultante activo seleccionado.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{consultante.nombre_completo}</span> no tiene todos los datos
              requeridos para el cálculo de carta natal.
            </p>
            {missingFields.length > 0 && (
              <ul className="mt-3 space-y-1">
                {missingFields.map((label) => (
                  <li key={label} className="flex items-center gap-2 text-sm text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/dashboard/therapist/patients/${consultante.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Completar perfil del consultante
            </Link>
          </>
        )}
      </div>
    );
  }

  // Build a minimal ActiveConsultante-like object for downstream components
  const canonicalActive = {
    id: String(canonical.id),
    nombre_completo: canonical.full_name,
    fecha_nacimiento: canonical.birth.date,
    hora_nacimiento: canonical.birth.time,
    ciudad: canonical.location.city,
    pais: canonical.location.country,
    lat: canonical.location.lat,
    long: canonical.location.lon,
    timezone: canonical.birth.timezone,
    snapshot_id: canonical.snapshot_id ?? undefined,
  };

  return <AstrologyProfessionalView consultante={canonicalActive} chart={chart} analysis_result={analysisResult} calculateChart={calculateChart} refetch={refetch} />;
}
