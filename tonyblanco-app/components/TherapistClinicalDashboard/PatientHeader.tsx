'use client';

import { useEffect, useMemo, useState } from 'react';
import { getActivePatient } from '@/lib/active-patient';
import { getPatientProfileSummary, PatientProfileSummary } from '@/lib/patient-api';

interface PatientHeaderProps {
  onAddNote: () => void;
  onNewSession: () => void;
  onViewHistory: () => void;
  onChangePatient: () => void;
}

const formatAge = (birthDate: string | null) => {
  if (!birthDate) return 'Edad: sin registro';
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 'Edad: sin registro';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return `Edad: ${age}`;
};

const initialsFromName = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const biologicalSexLabels: Record<
  NonNullable<PatientProfileSummary['biologicalSex']>,
  string
> = {
  female: 'Femenino',
  male: 'Masculino',
  intersex: 'Intersexual',
  unknown: 'Desconocido',
  not_recorded: 'Sin registro',
};

const genderIdentityLabels: Record<
  NonNullable<PatientProfileSummary['genderIdentity']>,
  string
> = {
  woman: 'Mujer',
  man: 'Hombre',
  non_binary: 'No binaria',
  other: 'Otra',
  prefer_not_to_say: 'Prefiere no decirlo',
  not_recorded: 'Sin registro',
};

export default function PatientHeader({
  onAddNote,
  onNewSession,
  onViewHistory,
  onChangePatient,
}: PatientHeaderProps) {
  const [activePatient, setActivePatient] = useState<{ id: number; name: string | null } | null>(
    null,
  );
  const [profile, setProfile] = useState<PatientProfileSummary | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const syncPatient = () => {
      const patient = getActivePatient();
      setActivePatient(patient);
      setProfile(null);
      if (patient) {
        setLoadingProfile(true);
        getPatientProfileSummary(patient.id)
          .then((data) => setProfile(data))
          .catch(() => setProfile(null))
          .finally(() => setLoadingProfile(false));
      }
    };

    syncPatient();
    window.addEventListener('activePatientChanged', syncPatient);
    window.addEventListener('storage', syncPatient);
    return () => {
      window.removeEventListener('activePatientChanged', syncPatient);
      window.removeEventListener('storage', syncPatient);
    };
  }, []);

  const displayName = activePatient?.name || (activePatient ? `Paciente #${activePatient.id}` : '');
  const patientIdLabel = activePatient ? `ID ${activePatient.id}` : 'Sin paciente activo';

  const avatarLabel = useMemo(() => {
    if (!activePatient) return 'NA';
    return initialsFromName(activePatient.name || `P ${activePatient.id}`);
  }, [activePatient]);

  const consentLabel =
    profile && profile.consent_accepted_at
      ? 'Consentimiento: registrado'
      : 'Consentimiento: pendiente';

  return (
    <div className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-lg font-semibold">
            {avatarLabel}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {displayName || 'Selecciona un paciente'}
              </h1>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {patientIdLabel}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-3">
              <span>{formatAge(profile?.birth_date || null)}</span>
              <span>
                Sexo biologico:{' '}
                {profile?.biologicalSex
                  ? biologicalSexLabels[profile.biologicalSex]
                  : biologicalSexLabels.not_recorded}
              </span>
              <span>
                Identidad de genero:{' '}
                {profile?.genderIdentity
                  ? genderIdentityLabels[profile.genderIdentity]
                  : genderIdentityLabels.not_recorded}
              </span>
              {loadingProfile && <span>Cargando perfil...</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-600">
              <span className="px-2 py-1 rounded-full bg-gray-100">Estado: sin registro</span>
              <span className="px-2 py-1 rounded-full bg-gray-100">{consentLabel}</span>
              <span className="px-2 py-1 rounded-full bg-gray-100">Alertas: sin registro</span>
              <span className="px-2 py-1 rounded-full bg-gray-100">Tratamientos: sin registro</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddNote}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Anadir nota
          </button>
          <button
            type="button"
            onClick={onNewSession}
            className="px-3 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Nueva sesion
          </button>
          <button
            type="button"
            onClick={onViewHistory}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Ver historial
          </button>
          <button
            type="button"
            onClick={onChangePatient}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cambiar paciente
          </button>
        </div>
      </div>
    </div>
  );
}
