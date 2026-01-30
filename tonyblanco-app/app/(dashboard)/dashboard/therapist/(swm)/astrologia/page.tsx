"use client";

import useActiveConsultante from '@/hooks/useActiveConsultante';
import { useEffect, useState } from 'react';
import AstrologyProfessionalView from '@/components/AstrologyWorkspace/AstrologyProfessionalView';
import { useNatalChart } from '@/hooks/useNatalChart';
import { getCanonicalConsultantIdentity } from '@/hooks/getCanonicalConsultantIdentity';
import TherapistBackLink from '@/components/TherapistBackLink';

function IdentidadNoDisponible() {
  return (
    <div className="min-h-[360px] bg-white border border-gray-200 rounded-xl p-6 text-center">
      <h2 className="text-xl font-semibold">Identidad no disponible</h2>
      <p className="mt-3 text-sm text-gray-600">No hay una identidad canónica válida. Seleccione una identidad completa para visualizar la astrología profesional.</p>
    </div>
  );
}

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

  if (!canonical) return (
    <div className="min-h-[360px] bg-white border border-gray-200 rounded-xl p-6 text-center">
      <h2 className="text-xl font-semibold">Identidad canónica no disponible</h2>
      <p className="mt-3 text-sm text-gray-600">Seleccione un consultante con fecha, hora y lugar de nacimiento completos.</p>
    </div>
  );

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

  return (
    <>
      <TherapistBackLink />
      <AstrologyProfessionalView consultante={canonicalActive} chart={chart} analysis_result={analysisResult} calculateChart={calculateChart} refetch={refetch} />
    </>
  );
}
