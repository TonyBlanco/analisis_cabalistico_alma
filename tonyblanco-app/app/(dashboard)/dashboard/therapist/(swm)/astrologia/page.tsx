"use client";

import useActiveConsultante from '@/hooks/useActiveConsultante';
import AstrologyProfessionalView from '@/components/AstrologyWorkspace/AstrologyProfessionalView';
import { useNatalChart } from '@/hooks/useNatalChart';
import { getCanonicalConsultantIdentity, getMissingCanonicalFields } from '@/hooks/getCanonicalConsultantIdentity';
import { GuidedBlock } from '@/components/ui/guided-block';

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

    if (!consultante) {
      return (
        <div className="max-w-lg mx-auto mt-10">
          <GuidedBlock
            variant="info"
            role="therapist"
            title="Selecciona un consultante"
            description="Para calcular la carta natal, selecciona primero un consultante activo desde el panel clínico."
            steps={[
              { label: 'Abre el selector de pacientes en la barra lateral' },
              { label: 'Elige el consultante' },
              { label: 'La carta natal calculará automáticamente' },
            ]}
            actions={[{ label: 'Ir a Pacientes', href: '/dashboard/therapist/patients' }]}
          />
        </div>
      );
    }

    const missingSteps = missingFields.map((label) => ({ label }));

    return (
      <div className="max-w-lg mx-auto mt-10">
        <GuidedBlock
          variant="missing"
          role="therapist"
          title="Datos de nacimiento incompletos"
          description={`${consultante.nombre_completo} no tiene todos los datos requeridos para calcular la carta natal.`}
          steps={missingSteps.length > 0 ? missingSteps : undefined}
          actions={[
            {
              label: 'Completar perfil del consultante',
              href: `/dashboard/therapist/patients/${consultante.id}`,
            },
          ]}
        />
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
