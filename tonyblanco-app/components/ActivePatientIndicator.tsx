'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getActivePatient, clearActivePatientId } from '@/lib/active-patient';
import {
  getPatientProfileSummary,
  PatientProfileSummary,
  updatePatientStatus,
  archivePatient,
} from '@/lib/patient-api';
import { updatePatientProfile } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ActivePatientIndicatorProps {
  onSelectPatient?: () => void;
}

/**
 * Active Patient Indicator Component
 *
 * Muestra el paciente activo y un resumen de identidad/consentimiento.
 * No abre modales directamente: el parent controla selección vía onSelectPatient.
 */
export default function ActivePatientIndicator({ onSelectPatient }: ActivePatientIndicatorProps) {
  const router = useRouter();
  const [activePatient, setActivePatient] = useState<{ id: number; name: string | null } | null>(
    null,
  );
  const [profile, setProfile] = useState<PatientProfileSummary | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    { type: 'paused' | 'inactive' | 'archive'; requireReason?: boolean } | null
  >(null);
  const [formName, setFormName] = useState('');
  const [formBirthDate, setFormBirthDate] = useState<string | null>(null);
  const [formBirthCity, setFormBirthCity] = useState('');
  const [formBirthCountry, setFormBirthCountry] = useState('');
  const [formBiologicalSex, setFormBiologicalSex] = useState<
    'male' | 'female' | 'intersex' | 'unknown' | 'not_recorded'
  >('not_recorded');
  const [formGenderIdentity, setFormGenderIdentity] = useState<
    'woman' | 'man' | 'non_binary' | 'other' | 'prefer_not_to_say' | 'not_recorded'
  >('not_recorded');
  const [formReason, setFormReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadProfile = useCallback(async (patientId: number) => {
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
  }, []);

  const loadActivePatient = useCallback(() => {
    const patient = getActivePatient();
    setActivePatient(patient);
    setProfile(null);
    setProfileError(null);
    if (patient) {
      loadProfile(patient.id);
    }
  }, [loadProfile]);

  useEffect(() => {
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
  }, [loadActivePatient]);

  const handleClear = () => {
    clearActivePatientId();
    window.dispatchEvent(new Event('activePatientChanged'));
    setActivePatient(null);
    setProfile(null);
    setProfileError(null);
  };

  const handleEditProfile = () => {
    if (!activePatient) return;
    setFormName(profile?.legal_full_name || activePatient.name || '');
    setFormBirthDate(profile?.birth_date || null);
    setFormBirthCity(profile?.birth_city || '');
    setFormBirthCountry(profile?.birth_country || '');
    setFormBiologicalSex(profile?.biologicalSex ?? 'not_recorded');
    setFormGenderIdentity(profile?.genderIdentity ?? 'not_recorded');
    setFormError(null);
    setFeedback(null);
    setEditOpen(true);
  };

  const handleStatusPrompt = (type: 'paused' | 'inactive' | 'archive', requireReason = false) => {
    setPendingAction({ type, requireReason });
    setFormReason('');
    setConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!activePatient || !pendingAction) return;
    const { type, requireReason } = pendingAction;
    try {
      setActionLoading(true);
      setFeedback(null);
      if (type === 'archive') {
        await archivePatient(activePatient.id);
        setFeedback('Paciente archivado.');
      } else {
        await updatePatientStatus(activePatient.id, {
          therapy_status: type,
          pause_reason: requireReason ? formReason : undefined,
        });
        setFeedback('Estado del paciente actualizado.');
      }
      window.dispatchEvent(new Event('activePatientChanged'));
      loadActivePatient();
    } catch (error: any) {
      setFeedback(error?.message || 'No se pudo actualizar el estado del paciente.');
    } finally {
      setActionLoading(false);
      setConfirmOpen(false);
      setPendingAction(null);
    }
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

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Paciente activo</p>
            <p className="text-base text-gray-900 font-semibold">{displayName}</p>
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
              {feedback && <p className="text-xs text-green-700">{feedback}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
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
            <div className="flex items-center gap-1">
              <button
                onClick={handleEditProfile}
                disabled={actionLoading}
                className="px-3 py-1.5 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                Editar perfil
              </button>
              <button
                onClick={() => handleStatusPrompt('paused', true)}
                disabled={actionLoading}
                className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 border border-amber-200 rounded-md hover:bg-amber-200 transition-colors disabled:opacity-60"
                title="Pausar (requiere motivo)"
              >
                Pausar
              </button>
              <button
                onClick={() => handleStatusPrompt('inactive')}
                disabled={actionLoading}
                className="px-3 py-1.5 text-xs font-medium text-gray-800 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-60"
                title="Marcar inactivo"
              >
                Inactivar
              </button>
              <button
                onClick={() => handleStatusPrompt('archive')}
                disabled={actionLoading}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-60"
                title="Archivar (soft delete)"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Editar perfil */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar perfil del paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nombre completo *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Nombre y apellidos"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
              <input
                type="date"
                value={formBirthDate || ''}
                onChange={(e) => setFormBirthDate(e.target.value || null)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Ciudad de nacimiento</label>
              <input
                type="text"
                value={formBirthCity}
                onChange={(e) => setFormBirthCity(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Ciudad"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">País de nacimiento</label>
              <input
                type="text"
                value={formBirthCountry}
                onChange={(e) => setFormBirthCountry(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="País"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Sexo biologico</label>
              <select
                value={formBiologicalSex}
                onChange={(e) =>
                  setFormBiologicalSex(
                    e.target.value as 'male' | 'female' | 'intersex' | 'unknown' | 'not_recorded',
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
              >
                <option value="not_recorded">Sin registro</option>
                <option value="female">Femenino</option>
                <option value="male">Masculino</option>
                <option value="intersex">Intersexual</option>
                <option value="unknown">Desconocido</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Identidad de genero</label>
              <select
                value={formGenderIdentity}
                onChange={(e) =>
                  setFormGenderIdentity(
                    e.target.value as
                      | 'woman'
                      | 'man'
                      | 'non_binary'
                      | 'other'
                      | 'prefer_not_to_say'
                      | 'not_recorded',
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
              >
                <option value="not_recorded">Sin registro</option>
                <option value="woman">Mujer</option>
                <option value="man">Hombre</option>
                <option value="non_binary">No binaria</option>
                <option value="other">Otra</option>
                <option value="prefer_not_to_say">Prefiere no decirlo</option>
              </select>
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            {feedback && <p className="text-sm text-green-700">{feedback}</p>}
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                if (!activePatient) return;
                if (!formName.trim()) {
                  setFormError('El nombre completo es obligatorio.');
                  return;
                }
                setFormError(null);
                setFeedback(null);
                try {
                  setFormSaving(true);
                  await updatePatientProfile(activePatient.id, {
                    legal_full_name: formName.trim(),
                    birth_date: formBirthDate || undefined,
                    birth_city: formBirthCity || undefined,
                    birth_country: formBirthCountry || undefined,
                    biologicalSex: formBiologicalSex || 'not_recorded',
                    genderIdentity: formGenderIdentity || 'not_recorded',
                  });
                  setFeedback('Perfil actualizado correctamente.');
                  window.dispatchEvent(new Event('activePatientChanged'));
                  loadActivePatient();
                  setEditOpen(false);
                } catch (error: any) {
                  setFormError(error?.message || 'No se pudo actualizar el perfil.');
                } finally {
                  setFormSaving(false);
                }
              }}
              disabled={formSaving}
              className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {formSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmación de estado */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar acción</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {pendingAction?.type === 'paused' && (
              <>
                <p className="text-sm text-gray-700">
                  Este paciente será <span className="font-semibold">pausado</span>. No podrá ejecutar
                  tests hasta reanudar.
                </p>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Motivo de la pausa</label>
                  <textarea
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Describe brevemente el motivo"
                  />
                </div>
              </>
            )}
            {pendingAction?.type === 'inactive' && (
              <p className="text-sm text-gray-700">
                Este paciente será marcado como <span className="font-semibold">inactivo</span>. Se
                limitarán las acciones clínicas y asignación de tests.
              </p>
            )}
            {pendingAction?.type === 'archive' && (
              <p className="text-sm text-gray-700">
                Este paciente será <span className="font-semibold text-red-600">archivado</span> (soft
                delete). Podrás restaurarlo más adelante cambiando el estado a activo.
              </p>
            )}
            {feedback && <p className="text-sm text-red-600">{feedback}</p>}
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmStatusChange}
              disabled={actionLoading || (pendingAction?.requireReason && !formReason.trim())}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-opacity shadow-sm disabled:opacity-60 ${
                pendingAction?.type === 'archive' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {actionLoading ? 'Aplicando...' : 'Confirmar'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
