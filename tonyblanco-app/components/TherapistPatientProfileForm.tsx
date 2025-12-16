'use client';

import { useEffect, useState } from 'react';
import GeoLocationField from '@/components/GeoLocationField';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import {
  getPatientProfileSummary,
  updatePatientProfile,
  PatientProfileSummary,
  PatientProfileUpdatePayload,
} from '@/lib/patient-api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

interface FormState {
  legal_full_name: string;
  birth_date: string;
  birth_time: string;
  birth_city: string;
  birth_country: string;
  birth_latitude: number | null;
  birth_longitude: number | null;
  birth_timezone: string;
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

export default function TherapistPatientProfileForm() {
  const [activePatientId, setActivePatientIdState] = useState<number | null>(null);
  const [activePatientName, setActivePatientNameState] = useState<string | null>(null);
  const [profile, setProfile] = useState<PatientProfileSummary | null>(null);
  const [form, setForm] = useState<FormState>({
    legal_full_name: '',
    birth_date: '',
    birth_time: '',
    birth_city: '',
    birth_country: '',
    birth_latitude: null,
    birth_longitude: null,
    birth_timezone: '',
  });
  const [coordinatesUnlocked, setCoordinatesUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const id = getActivePatientId();
    const name = getActivePatientName();
    setActivePatientIdState(id);
    setActivePatientNameState(name);
    setProfile(null);
    setError(null);
    setSuccess(null);
    setProfileCompleted(false);
    setIsCollapsed(false);

    if (!id) {
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const summary = await getPatientProfileSummary(id);
        setProfile(summary);
        setProfileCompleted(isProfileComplete(summary));
        setForm({
          legal_full_name: summary.legal_full_name || '',
          birth_date: summary.birth_date || '',
          birth_time: summary.birth_date ? '' : '', // horario no viene en summary, se puede ampliar más adelante
          birth_city: summary.birth_city || '',
          birth_country: summary.birth_country || '',
          birth_latitude: summary.birth_latitude ?? null,
          birth_longitude: summary.birth_longitude ?? null,
          birth_timezone: summary.birth_timezone || '',
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al cargar el perfil del paciente';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.legal_full_name.trim()) {
      errors.legal_full_name = 'El nombre legal completo es requerido.';
    } else {
      const parts = form.legal_full_name.trim().split(/\s+/);
      if (parts.length < 2) {
        errors.legal_full_name = 'El nombre legal debe contener al menos 2 palabras.';
      }
    }

    if (!form.birth_date) {
      errors.birth_date = 'La fecha de nacimiento es requerida.';
    }

    if (!form.birth_city.trim()) {
      errors.birth_city = 'La ciudad de nacimiento es requerida.';
    }
    if (!form.birth_country.trim()) {
      errors.birth_country = 'El país de nacimiento es requerido.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!activePatientId) return;
    setSuccess(null);
    setError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const payload: PatientProfileUpdatePayload = {
        legal_full_name: form.legal_full_name.trim(),
        birth_date: form.birth_date || null,
        birth_time: form.birth_time || null,
        birth_city: form.birth_city.trim() || null,
        birth_country: form.birth_country.trim() || null,
      };

      if (
        form.birth_latitude !== null &&
        form.birth_longitude !== null &&
        !Number.isNaN(form.birth_latitude) &&
        !Number.isNaN(form.birth_longitude)
      ) {
        payload.birth_latitude = form.birth_latitude;
        payload.birth_longitude = form.birth_longitude;
      }

      const updated = await updatePatientProfile(activePatientId, payload);
      setProfile(updated);
      const isComplete = isProfileComplete(updated);
      setProfileCompleted(isComplete);
      setSuccess('Perfil del paciente actualizado correctamente.');
      setFieldErrors({});
      
      // Mostrar toast y auto-cerrar después de 800-1200ms
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setIsCollapsed(true);
      }, 1000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al guardar el perfil del paciente';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!activePatientId) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-600">
          Selecciona primero un paciente para poder editar su perfil.
        </p>
      </div>
    );
  }

  // Si está colapsado, mostrar solo el header con opción de expandir
  if (isCollapsed) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-gray-900">Perfil del paciente</h2>
            {profileCompleted && (
              <>
                <span className="text-green-600 text-lg">✔</span>
                <span className="text-xs text-green-600">Perfil completo</span>
              </>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-xs text-gray-600 hover:text-gray-900 underline"
          >
            Expandir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm space-y-4">
      {/* Toast de éxito */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg z-50 flex items-center gap-2 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2">
          <span className="text-lg">✔</span>
          <span className="text-sm font-medium">Perfil actualizado correctamente</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-900">Perfil del paciente</h2>
          {profileCompleted && (
            <>
              <span className="text-green-600 text-lg" title="Perfil completo">✔</span>
              <span className="text-xs text-green-600 font-medium">Perfil completo</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {profile?.consent_accepted_at && (
            <span className="text-xs text-gray-600">
              Consentimiento aceptado el{' '}
              {new Date(profile.consent_accepted_at).toLocaleString('es-ES')}
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-xs text-gray-500 hover:text-gray-700"
            title="Colapsar sección"
          >
            ▲
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-xs text-gray-500">Cargando datos de perfil del paciente...</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {/* Nombre legal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <span>Nombre completo legal</span>
              <span
                className="text-xs text-blue-600 cursor-help"
                title="Este dato se usa para análisis cabalísticos y astrológicos"
              >
                ⓘ
              </span>
            </label>
            <input
              type="text"
              value={form.legal_full_name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  legal_full_name: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-md text-sm bg-blue-50 ${
                fieldErrors.legal_full_name ? 'border-red-300' : 'border-blue-200'
              }`}
              placeholder="Nombre y apellidos tal como figuran en sus documentos"
            />
            {fieldErrors.legal_full_name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.legal_full_name}</p>
            )}
            {typeof profile?.name_change_count === 'number' && profile.name_change_count > 0 && (
              <p
                className={`mt-1 text-xs ${
                  profile.name_change_count >= 2 ? 'text-red-600' : 'text-amber-600'
                }`}
              >
                Has cambiado el nombre legal {profile.name_change_count}/2 veces.
              </p>
            )}
          </div>

          {/* Fecha y hora de nacimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <span>Fecha de nacimiento</span>
                <span
                  className="text-xs text-blue-600 cursor-help"
                  title="Este dato se usa para análisis cabalísticos y astrológicos"
                >
                  ⓘ
                </span>
              </label>
              <input
                type="date"
                value={form.birth_date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    birth_date: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-md text-sm bg-blue-50 ${
                  fieldErrors.birth_date ? 'border-red-300' : 'border-blue-200'
                }`}
              />
              {fieldErrors.birth_date && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.birth_date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <span>Hora de nacimiento (opcional)</span>
                <span
                  className="text-xs text-blue-600 cursor-help"
                  title="Este dato se usa para análisis cabalísticos y astrológicos"
                >
                  ⓘ
                </span>
              </label>
              <input
                type="time"
                value={form.birth_time}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    birth_time: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm bg-blue-50"
              />
            </div>
          </div>

          {/* Ciudad / País / Coordenadas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Datos de lugar de nacimiento
              </span>
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={coordinatesUnlocked}
                  onChange={(e) => setCoordinatesUnlocked(e.target.checked)}
                  className="rounded border-gray-300 text-gray-700 focus:ring-gray-400"
                />
                <span>Reescribir coordenadas</span>
              </label>
            </div>
            <GeoLocationField
              city={form.birth_city}
              country={form.birth_country}
              latitude={form.birth_latitude}
              longitude={form.birth_longitude}
              allowManualCoordinates={coordinatesUnlocked}
              highlightCriticalFields={true}
              onCityChange={(city) =>
                setForm((prev) => ({
                  ...prev,
                  birth_city: city,
                }))
              }
              onCountryChange={(country) =>
                setForm((prev) => ({
                  ...prev,
                  birth_country: country,
                }))
              }
              onCoordinatesChange={(lat, lng) =>
                setForm((prev) => ({
                  ...prev,
                  birth_latitude: lat,
                  birth_longitude: lng,
                }))
              }
              errors={{
                city: fieldErrors.birth_city,
                country: fieldErrors.birth_country,
              }}
            />
            {fieldErrors.birth_city && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.birth_city}</p>
            )}
            {fieldErrors.birth_country && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.birth_country}</p>
            )}
          </div>

          {/* Timezone (solo lectura) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <span>Zona horaria</span>
              <span
                className="text-xs text-blue-600 cursor-help"
                title="Este dato se usa para análisis cabalísticos y astrológicos"
              >
                ⓘ
              </span>
            </label>
            <input
              type="text"
              value={form.birth_timezone || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Mensajes de estado */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-xs text-green-800">{success}</p>
            </div>
          )}

          {/* Botón guardar */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={{ backgroundColor: !saving ? 'var(--accent-color)' : undefined }}
            >
              {saving ? 'Guardando...' : 'Guardar perfil'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

