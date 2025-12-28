"use client";

import { useEffect, useState } from 'react';
import { getActivePatient } from '@/lib/active-patient';
import { getPatient } from '@/lib/patient-storage';
import { getPatientProfileSummary } from '@/lib/patient-api';

export interface ActiveConsultante {
  id: string;
  nombre_completo: string;
  fecha_nacimiento: string; // ISO
  hora_nacimiento?: string;
  ciudad?: string;
  pais?: string;
  lat?: number;
  long?: number;
  timezone?: string;
  snapshot_id?: string;
}

function normalizeFromPatientRecord(p: any): ActiveConsultante | null {
  if (!p) return null;

  // Support both local `PatientInfo` shape and server `PatientProfileSummary` shape
  const id = p.id ?? p.patient_id ?? p.patientId ?? null;
  const name = p.name ?? p.full_name ?? p.legal_full_name ?? p.fullName ?? null;
  const birthDate = p.birthDate ?? p.birth_date ?? p.birthDateISO ?? null;

  if (!id || !name || !birthDate) return null;

  return {
    id: String(id),
    nombre_completo: name,
    fecha_nacimiento: birthDate,
    hora_nacimiento: p.birthTime ?? p.birth_time ?? undefined,
    ciudad: p.birthCity ?? p.birth_city ?? p.birth_city_name ?? undefined,
    pais: p.birthCountry ?? p.birth_country ?? undefined,
    lat: typeof p.birthLatitude === 'number' ? p.birthLatitude : typeof p.birth_latitude === 'number' ? p.birth_latitude : undefined,
    long: typeof p.birthLongitude === 'number' ? p.birthLongitude : typeof p.birth_longitude === 'number' ? p.birth_longitude : undefined,
    timezone: p.timezone ?? p.birth_timezone ?? undefined,
    snapshot_id: p.snapshotId ?? p.snapshot_id ?? undefined,
  };
}

export default function useActiveConsultante(): ActiveConsultante | null {
  const [consultante, setConsultante] = useState<ActiveConsultante | null>(null);

  const refresh = async () => {
    try {
      const active = getActivePatient();
      // prefer explicit patient record when available
      if (active && active.id) {
        const rec = getPatient(String(active.id));
        const normLocal = normalizeFromPatientRecord(rec);
        if (normLocal) {
          setConsultante(normLocal);
          return;
        }

        // If no local record, try fetching the therapist-facing profile from API
        try {
          const profile = await getPatientProfileSummary(Number(active.id));
          const normProfile = normalizeFromPatientRecord(profile);
          if (normProfile) {
            setConsultante(normProfile);
            return;
          }
        } catch (err) {
          // ignore - we'll fall through to null
          // console.warn('Could not fetch patient profile for consultante:', err);
        }
      }

      // If active patient helper provided a name but no full record, do not infer
      setConsultante(null);
    } catch (e) {
      setConsultante(null);
    }
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('activePatientChanged', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('activePatientChanged', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return consultante;
}
