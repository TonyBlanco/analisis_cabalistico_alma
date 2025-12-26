'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getActivePatientId } from '@/lib/active-patient';

import SCID5ClinicalModule from '@/components/clinical/SCID5ClinicalModule';

export default function Scid5Client() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const hasQueryPatient = Boolean(searchParams?.get('patient_id') || searchParams?.get('patientId'));
    if (hasQueryPatient) return;
    const active = getActivePatientId();
    if (!active) return;
    router.replace(`/dashboard/therapist/scid5?patient_id=${encodeURIComponent(String(active))}`);
  }, [router, searchParams]);

  return <SCID5ClinicalModule />;
}