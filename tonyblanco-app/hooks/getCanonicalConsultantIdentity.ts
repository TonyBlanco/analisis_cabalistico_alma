export type CanonicalConsultantIdentity = {
  id: number;
  full_name: string;
  birth: {
    date: string; // yyyy-mm-dd
    time: string; // HH:mm:ss
    timezone: string; // IANA
  };
  location: {
    city: string;
    country: string;
    lat: number;
    lon: number;
  };
  snapshot_id?: string | null;
};

function isNonEmptyString(v: any): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isNumber(v: any): v is number {
  return typeof v === 'number' && !isNaN(v);
}

/**
 * Try to extract canonical identity from an input snapshot object.
 * Returns null if any required field is missing.
 */
export function identityFromSnapshot(snapshot: any): CanonicalConsultantIdentity | null {
  if (!snapshot) return null;

  const id = snapshot.id ?? snapshot.patient_id ?? snapshot.patientId ?? null;
  const full_name = snapshot.full_name ?? snapshot.name ?? snapshot.nombre ?? snapshot.legal_full_name ?? null;

  const birthDate = snapshot.birth_date ?? snapshot.fecha_nacimiento ?? snapshot.date_of_birth ?? null;
  const birthTime = snapshot.birth_time ?? snapshot.hora_nacimiento ?? snapshot.time_of_birth ?? null;
  const timezone = snapshot.birth_timezone ?? snapshot.timezone ?? snapshot.tz ?? null;

  const city = snapshot.birth_city ?? snapshot.ciudad ?? snapshot.city ?? null;
  const country = snapshot.birth_country ?? snapshot.pais ?? snapshot.country ?? null;
  const lat = snapshot.birth_latitude ?? snapshot.lat ?? snapshot.latitude ?? null;
  const lon = snapshot.birth_longitude ?? snapshot.lon ?? snapshot.longitude ?? null;

  if (
    id == null ||
    !isNonEmptyString(full_name) ||
    !isNonEmptyString(birthDate) ||
    !isNonEmptyString(birthTime) ||
    !isNonEmptyString(timezone) ||
    !isNonEmptyString(city) ||
    !isNonEmptyString(country) ||
    !isNumber(lat) ||
    !isNumber(lon)
  ) {
    return null;
  }

  return {
    id: Number(id),
    full_name: String(full_name),
    birth: {
      date: String(birthDate),
      time: String(birthTime),
      timezone: String(timezone),
    },
    location: {
      city: String(city),
      country: String(country),
      lat: Number(lat),
      lon: Number(lon),
    },
    snapshot_id: snapshot.snapshot_id ?? snapshot.snapshotId ?? null,
  };
}

/**
 * Build canonical identity from sources in priority order:
 * 1. chart.metadatos.input_snapshot
 * 2. consultante (ActiveConsultante-like) provided by hook
 * Returns null if no valid canonical identity.
 */
import type { NatalChartPayload } from './useNatalChart';
import type { ActiveConsultante } from '@/hooks/useActiveConsultante';

export function getCanonicalConsultantIdentity(chart?: NatalChartPayload | null, consultante?: ActiveConsultante | null): CanonicalConsultantIdentity | null {
  // 1) Try snapshot in chart metadata
  const snapshot = chart?.metadatos?.input_snapshot ?? null;
  const fromSnapshot = identityFromSnapshot(snapshot);
  if (fromSnapshot) return fromSnapshot;

  // 2) Try consultante provided by hook/local storage/profile
  if (consultante) {
    const snapLike = {
      id: consultante.id,
      full_name: consultante.nombre_completo,
      birth_date: consultante.fecha_nacimiento,
      birth_time: consultante.hora_nacimiento,
      birth_timezone: consultante.timezone ?? consultante.timezone,
      birth_city: consultante.ciudad,
      birth_country: consultante.pais,
      birth_latitude: consultante.lat,
      birth_longitude: consultante.long,
      snapshot_id: consultante.snapshot_id ?? null,
    };
    const fromConsult = identityFromSnapshot(snapLike);
    if (fromConsult) return fromConsult;
  }

  // No valid canonical identity
  return null;
}
