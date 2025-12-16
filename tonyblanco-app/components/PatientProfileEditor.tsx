'use client';

import { useState, useEffect, useRef } from 'react';
import { getPatientProfile, updatePatientProfile, UserProfileData } from '@/lib/api';
import GeoLocationField from '@/components/GeoLocationField';
import Toast from '@/components/Toast';

interface PatientProfileEditorProps {
  patientId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Patient Profile Editor Component (Therapist View)
 * 
 * Allows therapist to edit patient profile for cabalistic, astrological and clinical accuracy.
 * - Editable fields: legal_full_name, birth_date, birth_time, birth_city, birth_country, timezone
 * - Coordinates disabled by default with "Reescribir coordenadas" checkbox
 * - Shows consent status read-only
 * - Therapist never sees consent modal
 */
export default function PatientProfileEditor({
  patientId,
  onClose,
  onSuccess,
}: PatientProfileEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    legal_full_name: '',
    birth_date: '',
    birth_time: '',
    birth_city: '',
    birth_country: '',
    birth_latitude: null as number | null,
    birth_longitude: null as number | null,
    birth_timezone: '',
  });
  const [profileVersion, setProfileVersion] = useState<number>(0);
  const [nameChangeCount, setNameChangeCount] = useState<number>(0);
  const [consentAcceptedAt, setConsentAcceptedAt] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [coordinatesUnlocked, setCoordinatesUnlocked] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // CRITICAL: useRef to ensure profile fetch runs ONLY ONCE on mount
  const hasFetchedProfileRef = useRef(false);

  // CRITICAL: Fetch profile ONLY ONCE on mount
  useEffect(() => {
    if (hasFetchedProfileRef.current) {
      return;
    }
    hasFetchedProfileRef.current = true;

    const loadProfile = async () => {
      try {
        const profileResponse = await getPatientProfile(patientId);
        
        if (profileResponse && typeof profileResponse === 'object' && 'error' in profileResponse && profileResponse.error) {
          console.warn('Error loading patient profile:', (profileResponse as any).message);
          setErrors({ submit: 'No se pudo cargar el perfil del paciente' });
          setLoading(false);
          return;
        }

        const profile = profileResponse as UserProfileData;
        
        // Set form data from profile
        setFormData({
          legal_full_name: profile.legal_full_name || '',
          birth_date: profile.birth_date || '',
          birth_time: profile.birth_time || '',
          birth_city: profile.birth_city || '',
          birth_country: profile.birth_country || '',
          birth_latitude: profile.birth_latitude ? Number(profile.birth_latitude) : null,
          birth_longitude: profile.birth_longitude ? Number(profile.birth_longitude) : null,
          birth_timezone: profile.birth_timezone || '',
        });

        setNameChangeCount(profile.name_change_count || 0);
        setProfileVersion(profile.profile_version || 0);
        setConsentAcceptedAt(profile.consent_accepted_at || null);
        
        // Check if profile is complete (has all critical fields)
        const isComplete = 
          profile.legal_full_name && 
          profile.birth_date && 
          profile.birth_city && 
          profile.birth_country;
        setProfileCompleted(isComplete);
      } catch (err) {
        console.error('Error loading patient profile:', err);
        setErrors({ submit: 'Error al cargar el perfil del paciente' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [patientId]); // CRITICAL: Only depend on patientId

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate legal_full_name only if editable
    if (nameChangeCount < 2) {
      if (!formData.legal_full_name.trim()) {
        newErrors.legal_full_name = 'El nombre completo legal es requerido';
      } else {
        const nameWords = formData.legal_full_name.trim().split(/\s+/).filter((w: string) => w.length > 0);
        if (nameWords.length < 2) {
          newErrors.legal_full_name = 'El nombre completo debe contener al menos 2 palabras';
        }
      }
    }

    if (!formData.birth_date) {
      newErrors.birth_date = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.birth_date = 'La fecha de nacimiento debe ser anterior a hoy';
      }
    }

    if (!formData.birth_city.trim()) {
      newErrors.birth_city = 'La ciudad de nacimiento es requerida';
    }

    if (!formData.birth_country.trim()) {
      newErrors.birth_country = 'El país de nacimiento es requerido';
    }

    if (formData.birth_city.trim() && formData.birth_country.trim()) {
      if (
        !formData.birth_latitude ||
        !formData.birth_longitude ||
        formData.birth_latitude === 0 ||
        formData.birth_longitude === 0 ||
        isNaN(formData.birth_latitude) ||
        isNaN(formData.birth_longitude)
      ) {
        // Only error if coordinates are required but not unlocked
        if (!coordinatesUnlocked) {
          // This is OK - backend will calculate coordinates
        } else {
          newErrors.birth_city =
            'No se pudieron calcular las coordenadas. Verifica la ciudad o prueba otra variante.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const performSubmit = async () => {
    setSaving(true);
    setSuccess(false);
    setErrors({});

    try {
      // Build clean payload: only editable fields
      const payload: Partial<UserProfileData> & { rewrite_coordinates?: boolean } = {};

      // Only include legal_full_name if editable (name_change_count < 2)
      if (nameChangeCount < 2 && formData.legal_full_name.trim()) {
        payload.legal_full_name = formData.legal_full_name.trim();
      }

      // Birth date (required)
      if (formData.birth_date) {
        payload.birth_date = formData.birth_date;
      }

      // Birth time (optional - convert empty string to null)
      if (formData.birth_time && formData.birth_time.trim()) {
        payload.birth_time = formData.birth_time.trim();
      }

      // Birth city (required)
      if (formData.birth_city.trim()) {
        payload.birth_city = formData.birth_city.trim();
      }

      // Birth country (required)
      if (formData.birth_country.trim()) {
        payload.birth_country = formData.birth_country.trim();
      }

      // Birth timezone (optional)
      if (formData.birth_timezone && formData.birth_timezone.trim()) {
        payload.birth_timezone = formData.birth_timezone.trim();
      }

      // Coordinates: ONLY include if rewrite checkbox is active
      if (coordinatesUnlocked) {
        payload.rewrite_coordinates = true;
        if (
          formData.birth_latitude !== null &&
          formData.birth_longitude !== null &&
          formData.birth_latitude !== 0 &&
          formData.birth_longitude !== 0 &&
          !isNaN(formData.birth_latitude) &&
          !isNaN(formData.birth_longitude)
        ) {
          payload.birth_latitude = formData.birth_latitude;
          payload.birth_longitude = formData.birth_longitude;
        }
      }

      // Log payload for debugging
      console.log('PATCH /api/therapist/patients/{id}/profile/ payload:', payload);

      const response = await updatePatientProfile(patientId, payload);

      // Check if response is an error object
      if (response && typeof response === 'object' && 'error' in response && response.error) {
        const errorResponse = response as any;
        
        // Log full backend error for debugging
        console.error('Backend validation error:', {
          status: errorResponse.status,
          message: errorResponse.message,
          networkError: errorResponse.networkError,
          fullResponse: JSON.stringify(errorResponse, null, 2),
        });

        const backendErrors: Record<string, string> = {};
        
        // Extract backend validation errors verbatim from the error response
        Object.keys(errorResponse).forEach((key) => {
          // Skip API wrapper fields
          if (key === 'error' || key === 'status' || key === 'networkError') {
            return;
          }
          
          const errorValue = errorResponse[key];
          
          // Skip if it's the general message (we'll handle it separately)
          if (key === 'message' || key === 'detail') {
            return;
          }
          
          // Extract field-specific validation errors
          if (errorValue !== undefined && errorValue !== null) {
            if (Array.isArray(errorValue)) {
              backendErrors[key] = errorValue.join(' ');
            } else if (typeof errorValue === 'object') {
              backendErrors[key] = JSON.stringify(errorValue);
            } else {
              backendErrors[key] = String(errorValue);
            }
          }
        });

        // General error message
        const generalError = errorResponse.message || errorResponse.detail || errorResponse.error;
        if (generalError && typeof generalError === 'string') {
          if (Object.keys(backendErrors).length === 0) {
            backendErrors.submit = generalError;
          } else {
            backendErrors.submit = generalError;
          }
        } else if (Object.keys(backendErrors).length === 0) {
          backendErrors.submit = `Error ${errorResponse.status || 'desconocido'} al actualizar perfil`;
        }

        // Check for name change lock (special handling)
        if (
          backendErrors.legal_full_name &&
          backendErrors.legal_full_name.toLowerCase().includes('bloquead')
        ) {
          backendErrors.submit =
            'Cambios de nombre bloqueados. Contacta support@tonyblanco.es';
        }

        console.log('Parsed backend errors for UI:', backendErrors);
        setErrors(backendErrors);
        return;
      }

      // Success - update local state
      const updatedProfile = response as UserProfileData;
      setFormData(prev => ({
        ...prev,
        legal_full_name: updatedProfile.legal_full_name || prev.legal_full_name,
        birth_date: updatedProfile.birth_date || prev.birth_date,
        birth_time: updatedProfile.birth_time || prev.birth_time,
        birth_city: updatedProfile.birth_city || prev.birth_city,
        birth_country: updatedProfile.birth_country || prev.birth_country,
        birth_latitude: updatedProfile.birth_latitude ? Number(updatedProfile.birth_latitude) : prev.birth_latitude,
        birth_longitude: updatedProfile.birth_longitude ? Number(updatedProfile.birth_longitude) : prev.birth_longitude,
        birth_timezone: updatedProfile.birth_timezone || prev.birth_timezone,
      }));

      if (typeof updatedProfile.name_change_count === 'number') {
        setNameChangeCount(updatedProfile.name_change_count);
      }

      if (typeof updatedProfile.profile_version === 'number') {
        setProfileVersion(updatedProfile.profile_version);
      }

      setSuccess(true);
      setProfileCompleted(true);
      setShowToast(true);
      
      // Auto-close after showing success toast (800-1200ms delay)
      setTimeout(() => {
        setShowToast(false);
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        // Auto-close the modal
        onClose();
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar cambios';
      setErrors({ submit: errorMessage });
      console.error('Error updating patient profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setErrors({});

    if (!validateForm()) {
      return;
    }

    await performSubmit();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <p className="text-sm text-gray-500">Cargando perfil del paciente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-2">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  Perfil del paciente
                  {profileCompleted && (
                    <span className="text-green-600" title="Perfil completo">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </h2>
                {profileCompleted && (
                  <p className="text-xs text-green-600 mt-1 font-medium">Perfil completo</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Actualiza los datos para precisión cabalística, astrológica y clínica
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Consent Status (Read-only) */}
          {consentAcceptedAt && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                <span className="font-medium">Consentimiento:</span> Aceptado el{' '}
                {new Date(consentAcceptedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}

          {!consentAcceptedAt && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Consentimiento:</span> Pendiente de aceptación por el paciente
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre legal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                Nombre completo legal
                {nameChangeCount >= 2 && (
                  <span className="ml-2 text-xs text-red-600 font-normal">
                    (Bloqueado - máximo alcanzado)
                  </span>
                )}
                <span className="text-xs text-blue-600 font-normal" title="Este dato se usa para análisis cabalísticos y astrológicos">
                  ⓘ
                </span>
              </label>
              <input
                type="text"
                value={formData.legal_full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, legal_full_name: e.target.value }))
                }
                disabled={nameChangeCount >= 2}
                className={`w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors ${
                  nameChangeCount >= 2
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                    : errors.legal_full_name
                    ? 'bg-white border-red-300'
                    : 'bg-blue-50 border-blue-200'
                }`}
                placeholder="Nombre y apellidos tal como figuran en los documentos"
              />
              <p className="mt-1 text-xs text-blue-600">Este dato se usa para análisis cabalísticos y astrológicos</p>
              {errors.legal_full_name && (
                <p className="mt-1 text-xs text-red-600">{errors.legal_full_name}</p>
              )}
              {nameChangeCount === 1 && (
                <p className="mt-1 text-xs text-amber-600">
                  ⚠️ Se ha usado 1/2 cambios de nombre. Solo queda 1 cambio disponible.
                </p>
              )}
              {nameChangeCount >= 2 && (
                <p className="mt-1 text-xs text-red-600">
                  Se alcanzó el máximo de 2 cambios de nombre. Para más cambios, contacta con
                  soporte.
                </p>
              )}
            </div>

            {/* Profile version (read-only) */}
            {profileVersion > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Versión del perfil
                </label>
                <input
                  type="text"
                  value={profileVersion}
                  disabled
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Versión interna del perfil (solo lectura)
                </p>
              </div>
            )}

            {/* Fecha y hora de nacimiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  Fecha de nacimiento
                  <span className="text-xs text-blue-600 font-normal" title="Este dato se usa para análisis cabalísticos y astrológicos">
                    ⓘ
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, birth_date: e.target.value }))
                  }
                  className={`w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors ${
                    errors.birth_date ? 'bg-white border-red-300' : 'bg-blue-50 border-blue-200'
                  }`}
                />
                {errors.birth_date && (
                  <p className="mt-1 text-xs text-red-600">{errors.birth_date}</p>
                )}
                <p className="mt-1 text-xs text-blue-600">Este dato se usa para análisis cabalísticos y astrológicos</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  Hora de nacimiento (opcional)
                  <span className="text-xs text-blue-600 font-normal" title="Este dato se usa para análisis cabalísticos y astrológicos">
                    ⓘ
                  </span>
                </label>
                <input
                  type="time"
                  value={formData.birth_time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, birth_time: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
                  placeholder="HH:MM"
                />
                <p className="mt-1 text-xs text-blue-600">Este dato se usa para análisis cabalísticos y astrológicos</p>
              </div>
            </div>

            {/* Ciudad / País / Coordenadas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Datos de lugar de nacimiento
                  <span className="text-xs text-blue-600 font-normal" title="Estos datos se usan para análisis cabalísticos y astrológicos">
                    ⓘ
                  </span>
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
              <p className="mb-2 text-xs text-blue-600">Estos datos se usan para análisis cabalísticos y astrológicos</p>
              <GeoLocationField
                city={formData.birth_city}
                country={formData.birth_country}
                latitude={formData.birth_latitude}
                longitude={formData.birth_longitude}
                allowManualCoordinates={coordinatesUnlocked}
                onCityChange={(city) =>
                  setFormData((prev) => ({ ...prev, birth_city: city }))
                }
                onCountryChange={(country) =>
                  setFormData((prev) => ({ ...prev, birth_country: country }))
                }
                onCoordinatesChange={(lat, lng) =>
                  setFormData((prev) => ({
                    ...prev,
                    birth_latitude: lat,
                    birth_longitude: lng,
                  }))
                }
                errors={{
                  city: errors.birth_city,
                  country: errors.birth_country,
                }}
              />
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zona horaria (opcional)
              </label>
              <input
                type="text"
                value={formData.birth_timezone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, birth_timezone: e.target.value }))
                }
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
                placeholder="Ej: Europe/Madrid, America/Mexico_City"
              />
            </div>

            {/* Mensajes de estado */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}
            {success && !errors.submit && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">
                  Perfil del paciente actualizado correctamente.
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: !saving ? 'var(--accent-color)' : undefined,
                }}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message="Perfil actualizado correctamente"
          type="success"
          duration={1000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
