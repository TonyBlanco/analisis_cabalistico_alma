'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getActivePatientId } from '@/lib/active-patient';
import FederationHubFeedBlock from '@/components/federation/FederationHubFeedBlock';

import SCID5ClinicalModule from '@/components/clinical/SCID5ClinicalModule';

export default function Scid5Client() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const patientId = useMemo(() => {
    const qp = searchParams?.get('patient_id') || searchParams?.get('patientId');
    if (qp) return Number(qp);
    const active = getActivePatientId();
    return active ? Number(active) : null;
  }, [searchParams]);

  useEffect(() => {
    const hasQueryPatient = Boolean(searchParams?.get('patient_id') || searchParams?.get('patientId'));
    if (hasQueryPatient) return;
    const active = getActivePatientId();
    if (!active) return;
    router.replace(`/dashboard/therapist/scid5?patient_id=${encodeURIComponent(String(active))}`);
  }, [router, searchParams]);

  return (
    <div className="space-y-4">
      <FederationHubFeedBlock hub="SCID5" patientId={patientId} />
      <SCID5ClinicalModule />
    </div>
  );
}