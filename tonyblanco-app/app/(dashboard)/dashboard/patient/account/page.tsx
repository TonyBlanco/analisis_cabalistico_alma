'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/lib/session';
import { useRoleGuard } from '@/lib/role-guards';
import { clearAuthState } from '@/lib/auth-state';
import { getProfile, updateProfile, UserProfileData } from '@/lib/api';
import GeoLocationField from '@/components/GeoLocationField';
import NameVerificationModal from '@/components/NameVerificationModal';

/**
 * Patient Account Page (User Profile)
 * 
 * Route: /dashboard/patient/account
 * 
 * Patient-only access to edit their profile.
 */
export default function PatientAccountPage() {
  const router = useRouter();
  const { role, loading: roleLoading, authorized } = useRoleGuard({
    allowedRoles: ['patient'],
    redirectTo: '/login',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    legal_full_name: '',
    birth_date: '',
    birth_time: '',
    birth_city: '',
    birth_country: '',
    birth_latitude: null as number | null,
    birth_longitude: null as number | null,
    birth_timezone: '',
    email: '',
  });
  const [profileVersion, setProfileVersion] = useState<number>(0);
  const [nameChangeCount, setNameChangeCount] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [showNameVerificationModal, setShowNameVerificationModal] = useState(false);
  const [coordinatesUnlocked, setCoordinatesUnlocked] = useState(false);
  const [originalLegalFullName, setOriginalLegalFullName] = useState<string>('');
  const pendingSubmitRef = useRef<(() => void) | null>(null);
  
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
        // Load session for user context
        const session = await fetchSession();
        if (session.user) {
          setUser(session.user);
        }

        // Load profile from backend (source of truth)
        const profileResponse = await getProfile();
        
        if (profileResponse && typeof profileResponse === 'object' && 'error' in profileResponse && profileResponse.error) {
          console.warn('Error loading profile:', (profileResponse as any).message);
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
          email: profile.email || session.user?.email || '',
        });

        setOriginalLegalFullName(profile.legal_full_name || '');
        setNameChangeCount(profile.name_change_count || 0);
        setProfileVersion(profile.profile_version || 0);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []); // CRITICAL: Empty deps - run ONLY on mount

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
        newErrors.birth_city =
          'No se pudieron calcular las coordenadas. Verifica la ciudad o prueba otra variante.';
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
      // Build clean payload: only editable fields, no read-only fields
      const payload: Partial<UserProfileData> = {};

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

      // Birth timezone (optional - convert empty string to null)
      if (formData.birth_timezone && formData.birth_timezone.trim()) {
        payload.birth_timezone = formData.birth_timezone.trim();
      }

      // Coordinates: ONLY include if rewrite checkbox is active
      if (coordinatesUnlocked) {
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
      // If coordinatesUnlocked is false, do NOT send coordinates (let backend calculate)

      // Log payload for debugging
      console.log('PATCH /api/profile/me/ payload:', payload);

      const response = await updateProfile(payload);

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
        // The error body from backend is already included in the response object
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
              // If it's an object, stringify it
              backendErrors[key] = JSON.stringify(errorValue);
            } else {
              backendErrors[key] = String(errorValue);
            }
          }
        });

        // General error message
        const generalError = errorResponse.message || errorResponse.detail || errorResponse.error;
        if (generalError && typeof generalError === 'string') {
          // Only set as submit error if we don't have field-specific errors
          if (Object.keys(backendErrors).length === 0) {
            backendErrors.submit = generalError;
          } else {
            // If we have field errors, show general message as info
            backendErrors.submit = generalError;
          }
        } else if (Object.keys(backendErrors).length === 0) {
          // Fallback if no errors extracted
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

      setOriginalLegalFullName(updatedProfile.legal_full_name || '');
      setSuccess(true);
      
      // Refresh session for consistency
      await fetchSession();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar cambios';
      setErrors({ submit: errorMessage });
      console.error('Error updating profile:', err);
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

    // Only show name verification if legal_full_name is editable and is changing
    if (nameChangeCount < 2) {
      const isNameChanging = formData.legal_full_name.trim() !== originalLegalFullName.trim();
      const isFirstTime = !originalLegalFullName.trim();

      if (isNameChanging || isFirstTime) {
        setShowNameVerificationModal(true);
        pendingSubmitRef.current = performSubmit;
        return;
      }
    }

    await performSubmit();
  };

  const handleNameVerificationConfirm = async () => {
    setShowNameVerificationModal(false);
    if (pendingSubmitRef.current) {
      await pendingSubmitRef.current();
      pendingSubmitRef.current = null;
    }
  };

  const handleLogout = async () => {
    try {
      clearAuthState();
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      clearAuthState();
      router.replace('/login');
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authorized || role !== 'patient') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-red-500">No tienes acceso a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Mi Cuenta</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gestiona tu información personal y de nacimiento para los análisis cabalísticos
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre legal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo legal
              {nameChangeCount >= 2 && (
                <span className="ml-2 text-xs text-red-600 font-normal">
                  (Bloqueado - máximo alcanzado)
                </span>
              )}
            </label>
            <input
              type="text"
              value={formData.legal_full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, legal_full_name: e.target.value }))
              }
              disabled={nameChangeCount >= 2}
              className={`w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                nameChangeCount >= 2
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                  : errors.legal_full_name
                  ? 'bg-white border-red-300'
                  : 'bg-white border-gray-300'
              }`}
              placeholder="Nombre y apellidos tal como figuran en tus documentos"
            />
            {errors.legal_full_name && (
              <p className="mt-1 text-xs text-red-600">{errors.legal_full_name}</p>
            )}
            {nameChangeCount === 1 && (
              <p className="mt-1 text-xs text-amber-600">
                ⚠️ Has usado 1/2 cambios de nombre. Solo queda 1 cambio disponible.
              </p>
            )}
            {nameChangeCount >= 2 && (
              <p className="mt-1 text-xs text-red-600">
                Has alcanzado el máximo de 2 cambios de nombre. Para más cambios, contacta con
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, birth_date: e.target.value }))
                }
                className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                  errors.birth_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.birth_date && (
                <p className="mt-1 text-xs text-red-600">{errors.birth_date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de nacimiento (opcional)
              </label>
              <input
                type="time"
                value={formData.birth_time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, birth_time: e.target.value }))
                }
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
                placeholder="HH:MM"
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

          {/* Email (solo visual) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 cursor-not-allowed"
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
                Perfil actualizado correctamente. Tus próximos análisis usarán estos datos.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cerrar sesión
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

      {/* Name Verification Modal */}
      <NameVerificationModal
        open={showNameVerificationModal}
        onClose={() => {
          setShowNameVerificationModal(false);
          pendingSubmitRef.current = null;
        }}
        onConfirm={handleNameVerificationConfirm}
        fullName={formData.legal_full_name}
      />
    </div>
  );
}
