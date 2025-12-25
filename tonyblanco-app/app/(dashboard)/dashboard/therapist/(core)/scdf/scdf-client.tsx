'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getActivePatientId } from '@/lib/active-patient';

import LegacySCDFPage from '../../../../../../_legacy_app_backup/(dashboard)/dashboard/tools/scdf/page';

export default function ScdfClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const hasQueryPatient = Boolean(searchParams?.get('patient_id') || searchParams?.get('patientId'));
    if (hasQueryPatient) return;
    const active = getActivePatientId();
    if (!active) return;
    router.replace(`/dashboard/therapist/scdf?patient_id=${encodeURIComponent(String(active))}`);
  }, [router, searchParams]);

  return <LegacySCDFPage />;
}
