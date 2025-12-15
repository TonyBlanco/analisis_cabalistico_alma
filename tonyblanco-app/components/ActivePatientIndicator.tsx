'use client';

import { useState, useEffect } from 'react';
import { getActivePatient, clearActivePatientId } from '@/lib/active-patient';
import { getPatientProfileSummary, PatientProfileSummary } from '@/lib/patient-api';

interface ActivePatientIndicatorProps {
  onSelectPatient?: () => void;
}

/**
 * Determina si un perfil está completo basándose en los campos críticos para análisis cabalísticos
 */
function isProfileComplete(profile: PatientProfileSummary | null): boolean {
  if (!profile) return false;
  return !!(
    profile.legal_full_name &&
    profile.birth_date &&
    profile.birth_city &&
    profile.birth_country &&
    profile.birth_latitude !== null &&
    profile.birth_longitude !== null &&
    profile.birth_latitude !== 0 &&
    profile.birth_longitude !== 0
  );
}

/**
 * Active Patient Indicator Component
 *
 * Muestra el paciente activo y un resumen de identidad/consentimiento.
 * No abre modales directamente: el parent controla selección vía onSelectPatient.
 */
export default function ActivePatientIndicator({ onSelectPatient }: ActivePatientIndicatorProps) {
  const [activePatient, setActivePatient] = useState<{ id: number; name: string | null } | null>(
    null,
  );
  const [profile, setProfile] = useState<PatientProfileSummary | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async (patientId: number) => {
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const summary = await getPatientProfileSummary(patientId);
        setProfile(summary);
      } catch (error) {
        console.error('Error fetching patient profile summary:', error);
        setProfileError('No se pudo cargar el perfil del paciente.');
      } finally {
        setLoadingProfile(false);
      }
    };

    const loadActivePatient = () => {
      const patient = getActivePatient();
      setActivePatient(patient);
      setProfile(null);
      setProfileError(null);
      if (patient) {
        loadProfile(patient.id);
      }
    };

    loadActivePatient();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'therapist_active_patient_id' || e.key === 'therapist_active_patient_name') {
        loadActivePatient();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleCustomStorageChange = () => {
      loadActivePatient();
    };
    window.addEventListener('activePatientChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('activePatientChanged', handleCustomStorageChange);
    };
  }, []);

  const handleClear = () => {
    clearActivePatientId();
    window.dispatchEvent(new Event('activePatientChanged'));
    setActivePatient(null);
    setProfile(null);
    setProfileError(null);
  };

  if (!activePatient) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Paciente activo</p>
            <p className="text-sm text-gray-500">Selecciona un paciente para comenzar</p>
          </div>
          {onSelectPatient && (
            <button
              onClick={onSelectPatient}
              className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity shadow-sm"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              Seleccionar paciente
            </button>
          )}
        </div>
      </div>
    );
  }

  const displayName = activePatient.name || `Paciente #${activePatient.id}`;
  const consentText =
    profile && profile.consent_accepted_at
      ? `Consentimiento aceptado el ${new Date(
          profile.consent_accepted_at,
        ).toLocaleString('es-ES')}`
      : 'Consentimiento pendiente de aceptación';
  
  const profileComplete = isProfileComplete(profile);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Paciente activo</p>
          <div className="flex items-center gap-2">
            <p className="text-base text-gray-900 font-semibold">{displayName}</p>
            {profileComplete && (
              <span
                className="text-green-600 text-lg cursor-help"
                title="Perfil validado para análisis"
              >
                ✔
              </span>
            )}
          </div>
          <div className="mt-2 space-y-1">
            {loadingProfile && (
              <p className="text-xs text-gray-500">Cargando perfil del paciente...</p>
            )}
            {profileError && <p className="text-xs text-red-600">{profileError}</p>}
            {profile && (
              <>
                <p className="text-xs text-gray-600">
                  {profile.birth_date
                    ? `Nacimiento: ${new Date(profile.birth_date).toLocaleDateString('es-ES')}`
                    : 'Nacimiento: sin fecha registrada'}
                  {profile.birth_city && (
                    <>
                      {' '}
                      · {profile.birth_city}
                      {profile.birth_country ? `, ${profile.birth_country}` : ''}
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-600">{consentText}</p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onSelectPatient && (
            <button
              onClick={onSelectPatient}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cambiar
            </button>
          )}
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
