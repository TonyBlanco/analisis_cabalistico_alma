'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleGuard } from '@/lib/role-guards';
import { getUserRole } from '@/lib/getUserRole';
import { getUserProfile, updateUserProfile, UserProfileData } from '@/lib/api';
import { clearAuthState } from '@/lib/auth-state';
import { User, MapPin, Calendar, Lock, LogOut, AlertTriangle, CheckCircle, AlertCircle as AlertIcon } from 'lucide-react';
import { PasskeyManager } from '@/components/auth/PasskeyManager';
import { getApiBaseUrl } from '@/lib/api-base';

/**
 * Account Page (User Profile)
 * 
 * REQUIREMENTS:
 * - Fetch GET /api/profile/me/ on mount (once)
 * - legal_full_name editable ONLY if name_change_count < 2
 * - Coordinates read-only by default, checkbox to unlock
 * - PATCH /api/profile/me/ to save
 * - Show backend validation errors verbatim
 * - NO page reload on save
 * - NO infinite loops
 */
export default function AccountPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const fetchedRef = useRef(false);
  const redirectedRef = useRef(false);
  const [roleLoaded, setRoleLoaded] = useState(false);
  
  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['admin', 'therapist', 'personal', 'patient'],
    redirectTo: '/login',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<UserProfileData>>({
    legal_full_name: '',
    birth_date: '',
    birth_time: '',
    birth_city: '',
    birth_country: '',
    birth_latitude: null,
    birth_longitude: null,
    birth_timezone: '',
    email: '',
    phone: '',
  });
  
  const [metadata, setMetadata] = useState({
    name_change_count: 0,
    profile_version: 0,
  });
  
  const [coordinatesUnlocked, setCoordinatesUnlocked] = useState(false);

  // Helper to get auth token (for patient-only account endpoints)
  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  };

  // Patient-only endpoints
  const fetchPatientAccountProfile = async (): Promise<UserProfileData> => {
    const token = getAuthToken();
    const response = await fetch(`${getApiBaseUrl()}/profile/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const err = new Error(error.detail || error.message || 'No se pudo cargar el perfil');
      (err as any).status = response.status;
      throw err;
    }
    return response.json();
  };

  const patchPatientAccountProfile = async (data: Partial<UserProfileData>): Promise<UserProfileData> => {
    const token = getAuthToken();
    const response = await fetch(`${getApiBaseUrl()}/profile/me/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const err = new Error(error.detail || error.message || 'No se pudo guardar el perfil');
      (err as any).status = response.status;
      (err as any).response = error;
      throw err;
    }
    return response.json();
  };

  // Get user role (once)
  useEffect(() => {
    if (fetchedRef.current) return;
    
    getUserRole().then((userRole) => {
      if (userRole) {
        setRole(userRole);
        setRoleLoaded(true);
      }
    });
  }, []);

  // Load profile (once when role is loaded)
  useEffect(() => {
    // Patients should use the dedicated patient account page to avoid conflicting forms.
    if (!redirectedRef.current && roleLoaded && role === 'patient') {
      redirectedRef.current = true;
      router.replace('/dashboard/patient/account');
      return;
    }

    if (fetchedRef.current) return;
    if (!roleLoaded || !role) return;
    fetchedRef.current = true;
    
    const loadProfile = async () => {
      try {
        console.log('📋 Loading profile for role:', role);
        const profile = role === 'patient' ? await fetchPatientAccountProfile() : await getUserProfile();
        console.log('📋 Profile loaded:', profile);
        
        setFormData({
          legal_full_name: profile.legal_full_name || '',
          birth_date: profile.birth_date || '',
          birth_time: profile.birth_time || '',
          birth_city: profile.birth_city || '',
          birth_country: profile.birth_country || '',
          birth_latitude: profile.birth_latitude ?? null,
          birth_longitude: profile.birth_longitude ?? null,
          birth_timezone: profile.birth_timezone || '',
          email: profile.email || '',
          phone: profile.phone || '',
        });
        
        setMetadata({
          name_change_count: profile.name_change_count || 0,
          profile_version: profile.profile_version || 0,
        });
      } catch (error: any) {
        console.error('Error loading profile:', error);
        
        // Handle 401 - redirect to login
        if (error.status === 401) {
          setErrors({ load: 'Tu sesión ha expirado. Redirigiendo al login...' });
          setTimeout(() => {
            clearAuthState();
            router.replace('/login');
          }, 2000);
        } else {
          setErrors({ load: error.message || 'No se pudo cargar el perfil. Por favor, recarga la página.' });
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router, roleLoaded, role]);

  if (roleLoaded && role === 'patient') {
    return null;
  }

  const handleSave = async () => {
    setErrors({});
    setSuccess(false);
    setSaving(true);

    try {
      // Basic validation
      if (!formData.legal_full_name?.trim()) {
        setErrors({ legal_full_name: 'El nombre legal completo es requerido' });
        setSaving(false);
        return;
      }

      if (!formData.birth_date) {
        setErrors({ birth_date: 'La fecha de nacimiento es requerida' });
        setSaving(false);
        return;
      }

      // Prepare payload
      const payload: Partial<UserProfileData> = {
        legal_full_name: formData.legal_full_name.trim(),
        birth_date: formData.birth_date,
      };

      if (formData.birth_time) payload.birth_time = formData.birth_time;
      if (formData.birth_city) payload.birth_city = formData.birth_city.trim();
      if (formData.birth_country) payload.birth_country = formData.birth_country.trim();
      if (formData.birth_timezone) payload.birth_timezone = formData.birth_timezone;
      if (formData.email) payload.email = formData.email;
      if (formData.phone) payload.phone = formData.phone;

      // Only send coordinates if unlocked
      if (coordinatesUnlocked) {
        payload.birth_latitude = formData.birth_latitude;
        payload.birth_longitude = formData.birth_longitude;
      }

      // Save to backend (role-aware)
      const updated = role === 'patient'
        ? await patchPatientAccountProfile(payload)
        : await updateUserProfile(payload);

      // Update local state
      setFormData({
        ...formData,
        ...updated,
      });

      setMetadata({
        name_change_count: updated.name_change_count || 0,
        profile_version: updated.profile_version || 0,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      // Handle 401 - redirect to login
      if (error.status === 401) {
        setErrors({ general: 'Tu sesión ha expirado. Redirigiendo al login...' });
        setTimeout(() => {
          clearAuthState();
          router.replace('/login');
        }, 2000);
        return;
      }

      // Show backend validation errors verbatim
      if (error.response) {
        const backendErrors: Record<string, string> = {};
        
        // Handle different error formats
        if (typeof error.response === 'object') {
          Object.keys(error.response).forEach((key) => {
            const value = error.response[key];
            backendErrors[key] = Array.isArray(value) ? value.join(' ') : String(value);
          });
        } else if (typeof error.response === 'string') {
          backendErrors.general = error.response;
        }
        
        setErrors(backendErrors);
      } else {
        setErrors({ general: error.message || 'Error al guardar cambios' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuthState();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  const nameChangesRemaining = 2 - metadata.name_change_count;
  const canEditName = metadata.name_change_count < 2;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Mi cuenta</h1>
        <p className="text-gray-600">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Error loading */}
      {errors.load && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{errors.load}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">Perfil actualizado correctamente</p>
        </div>
      )}

      {/* General error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{errors.general}</p>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Información personal</h2>
        </div>

        <div className="space-y-4">
          {/* Legal Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre legal completo *
            </label>
            <input
              type="text"
              value={formData.legal_full_name || ''}
              onChange={(e) => setFormData({ ...formData, legal_full_name: e.target.value })}
              disabled={!canEditName}
              className={`w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                !canEditName ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {errors.legal_full_name && (
              <p className="text-xs text-red-600 mt-1">{errors.legal_full_name}</p>
            )}
            {canEditName && metadata.name_change_count === 1 && (
              <div className="flex items-center gap-2 mt-2 text-amber-700">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-xs">
                  Advertencia: 1/2 cambios de nombre usados. Último cambio disponible.
                </p>
              </div>
            )}
            {!canEditName && (
              <div className="flex items-center gap-2 mt-2 text-red-700">
                <Lock className="w-4 h-4" />
                <p className="text-xs">
                  Cambios de nombre bloqueados (2/2 usados). Contacta soporte si necesitas modificarlo.
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Este nombre se usa para cálculos cabalísticos. Los cambios afectan solo a futuros análisis.
            </p>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Birth Data */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Datos de nacimiento</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de nacimiento *
              </label>
              <input
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              {errors.birth_date && (
                <p className="text-xs text-red-600 mt-1">{errors.birth_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de nacimiento
              </label>
              <input
                type="time"
                value={formData.birth_time || ''}
                onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              {errors.birth_time && (
                <p className="text-xs text-red-600 mt-1">{errors.birth_time}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad de nacimiento
              </label>
              <input
                type="text"
                value={formData.birth_city || ''}
                onChange={(e) => setFormData({ ...formData, birth_city: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              {errors.birth_city && (
                <p className="text-xs text-red-600 mt-1">{errors.birth_city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País de nacimiento
              </label>
              <input
                type="text"
                value={formData.birth_country || ''}
                onChange={(e) => setFormData({ ...formData, birth_country: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              {errors.birth_country && (
                <p className="text-xs text-red-600 mt-1">{errors.birth_country}</p>
              )}
            </div>
          </div>

          {/* Coordinates */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">Coordenadas geográficas</h3>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="unlock-coords"
                checked={coordinatesUnlocked}
                onChange={(e) => setCoordinatesUnlocked(e.target.checked)}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <label htmlFor="unlock-coords" className="text-sm text-gray-700">
                Reescribir coordenadas
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitud
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.birth_latitude ?? ''}
                  onChange={(e) => setFormData({ ...formData, birth_latitude: parseFloat(e.target.value) || null })}
                  disabled={!coordinatesUnlocked}
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                    !coordinatesUnlocked ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
                {errors.birth_latitude && (
                  <p className="text-xs text-red-600 mt-1">{errors.birth_latitude}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.birth_longitude ?? ''}
                  onChange={(e) => setFormData({ ...formData, birth_longitude: parseFloat(e.target.value) || null })}
                  disabled={!coordinatesUnlocked}
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                    !coordinatesUnlocked ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
                {errors.birth_longitude && (
                  <p className="text-xs text-red-600 mt-1">{errors.birth_longitude}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Las coordenadas son esenciales para análisis astrológicos precisos
            </p>

            {/* Botón para recalcular coordenadas desde ciudad */}
            {formData.birth_city && (
              <button
                type="button"
                onClick={async () => {
                  setErrors({});
                  setSaving(true);
                  try {
                    const payload: any = {
                      birth_city: formData.birth_city?.trim(),
                      birth_country: formData.birth_country?.trim(),
                      force_geocode: true,
                    };
                    const updated = role === 'patient'
                      ? await patchPatientAccountProfile(payload)
                      : await updateUserProfile(payload);
                    setFormData({
                      ...formData,
                      birth_latitude: updated.birth_latitude,
                      birth_longitude: updated.birth_longitude,
                      birth_timezone: updated.birth_timezone,
                    });
                    setSuccess(true);
                    setTimeout(() => setSuccess(false), 3000);
                  } catch (error: any) {
                    if (error.response) {
                      setErrors({ general: error.response.message || 'Error al actualizar coordenadas' });
                    } else {
                      setErrors({ general: error.message || 'Error al actualizar coordenadas' });
                    }
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="mt-3 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                🔄 Recalcular coordenadas desde ciudad
              </button>
            )}
          </div>
        </div>
      </div>

      <PasskeyManager />

      {/* Metadata (read-only) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Información del perfil</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Cambios de nombre:</span>
            <span className="ml-2 font-medium text-gray-900">
              {metadata.name_change_count} / 2
            </span>
          </div>
          <div>
            <span className="text-gray-600">Versión del perfil:</span>
            <span className="ml-2 font-medium text-gray-900">
              {metadata.profile_version}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            saving
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-violet-600 text-white hover:bg-violet-700'
          }`}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      {/* Versioning notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> Los cambios en tus datos personales se versionan automáticamente. 
          Los análisis anteriores conservan los datos con los que fueron creados.
        </p>
      </div>
    </div>
  );
}
