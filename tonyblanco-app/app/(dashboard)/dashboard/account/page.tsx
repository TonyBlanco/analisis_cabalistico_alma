'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/lib/session';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import { clearAuthState } from '@/lib/auth-state';
import GeoLocationField from '@/components/GeoLocationField';
import NameVerificationModal from '@/components/NameVerificationModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

/**
 * Account Page (User Profile)
 * 
 * Comprehensive account management with:
 * - Full legal name (required, validated)
 * - Date of birth
 * - Time of birth
 * - City of birth (with geocoding)
 * - Country of birth
 * - Logout button
 * - Current role display
 */
export default function AccountPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    birth_time: '',
    birth_city: '',
    birth_country: '',
    birth_latitude: null as number | null,
    birth_longitude: null as number | null,
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [showNameVerificationModal, setShowNameVerificationModal] = useState(false);
  const [coordinatesUnlocked, setCoordinatesUnlocked] = useState(false);
  const [originalFullName, setOriginalFullName] = useState<string>('');
  const pendingSubmitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      setLoading(false);
    });

    fetchSession().then((session) => {
      if (session.user) {
        setUser(session.user);
        const birthData = session.user.birth_data || {};
        const fullName = session.user.full_name || session.user.profile?.full_name || birthData.full_name || '';
        setOriginalFullName(fullName);
        setFormData({
          full_name: fullName,
          birth_date: session.user.birth_date || birthData.birth_date || '',
          birth_time: birthData.birth_time || '',
          birth_city: birthData.birth_city || '',
          birth_country: birthData.birth_country || '',
          birth_latitude: birthData.birth_latitude || null,
          birth_longitude: birthData.birth_longitude || null,
          email: session.user.email || '',
        });
      }
    });
  }, []);

  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['admin', 'therapist', 'personal', 'patient'],
    redirectTo: '/login',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Full name must contain at least 2 words
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es requerido';
    } else {
      const nameWords = formData.full_name.trim().split(/\s+/).filter((w: string) => w.length > 0);
      if (nameWords.length < 2) {
        newErrors.full_name = 'El nombre completo debe contener al menos 2 palabras';
      }
    }

    // Birth date
    if (!formData.birth_date) {
      newErrors.birth_date = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.birth_date = 'La fecha de nacimiento debe ser anterior a hoy';
      }
    }

    // Birth city required
    if (!formData.birth_city.trim()) {
      newErrors.birth_city = 'La ciudad de nacimiento es requerida';
    }

    // Birth country required
    if (!formData.birth_country.trim()) {
      newErrors.birth_country = 'El país de nacimiento es requerido';
    }

    // Geo coordinates validation (ONLY on save)
    // If city/country are filled AND coordinates are missing/invalid → block save
    if (formData.birth_city.trim() && formData.birth_country.trim()) {
      if (!formData.birth_latitude || 
          !formData.birth_longitude || 
          formData.birth_latitude === 0 || 
          formData.birth_longitude === 0 ||
          isNaN(formData.birth_latitude) ||
          isNaN(formData.birth_longitude)) {
        newErrors.birth_city = 'No se pudieron calcular las coordenadas. Verifica la ciudad o prueba otra variante.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const performSubmit = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      const payload: Record<string, any> = {
        full_name: formData.full_name.trim(),
        birth_date: formData.birth_date,
        birth_city: formData.birth_city.trim(),
        birth_country: formData.birth_country.trim(),
      };

      // Add optional fields if provided
      if (formData.birth_time) {
        payload.birth_time = formData.birth_time;
      }
      
      // ONLY include coordinates if they are valid (not 0, not null, not NaN)
      if (formData.birth_latitude && 
          formData.birth_longitude && 
          formData.birth_latitude !== 0 && 
          formData.birth_longitude !== 0 &&
          !isNaN(formData.birth_latitude) &&
          !isNaN(formData.birth_longitude)) {
        payload.birth_latitude = formData.birth_latitude;
        payload.birth_longitude = formData.birth_longitude;
      }

      const response = await fetch(`${API_URL}/me/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || 'Error al actualizar perfil';
        
        // Check if it's a name lock error
        if (response.status === 403 && (errorMessage.includes('Name changes locked') || errorMessage.includes('bloqueados'))) {
          setErrors({ 
            full_name: 'Cambios de nombre bloqueados. Contacta support@tonyblanco.es',
            submit: 'Cambios de nombre bloqueados. Contacta support@tonyblanco.es'
          });
          throw new Error(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      // Success - refresh session and show success message
      setSuccess(true);
      const session = await fetchSession();
      if (session.user) {
        setUser(session.user);
        // Update form data with new session data
        const birthData = session.user.birth_data || {};
        const user = session.user;
        setFormData((prev) => ({
          ...prev,
          birth_date: user.birth_date || birthData.birth_date || prev.birth_date,
          birth_time: birthData.birth_time || prev.birth_time,
          birth_city: birthData.birth_city || prev.birth_city,
          birth_country: birthData.birth_country || prev.birth_country,
          birth_latitude: birthData.birth_latitude || prev.birth_latitude,
          birth_longitude: birthData.birth_longitude || prev.birth_longitude,
        }));
      }
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

    // Check if full_name is being set for the first time or changed
    const isNameChanging = formData.full_name.trim() !== originalFullName.trim();
    const isFirstTime = !originalFullName.trim();
    
    if (isNameChanging || isFirstTime) {
      // Show verification modal
      setShowNameVerificationModal(true);
      pendingSubmitRef.current = performSubmit;
      return;
    }

    // No name change, proceed directly
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
      // Hard reset: Clear ALL authentication state
      clearAuthState();
      
      // Redirect to login
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, clear everything and redirect
      clearAuthState();
      router.replace('/login');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    therapist: 'Terapeuta',
    personal: 'Usuario Personal',
    patient: 'Paciente',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Mi Cuenta
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gestiona tu información personal y preferencias
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
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">
                ✓ Perfil actualizado exitosamente
              </p>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                El email no se puede cambiar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <input
                type="text"
                value={roleLabels[role] || role}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Tu rol no se puede cambiar
              </p>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo legal <span className="text-red-500">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }));
                  if (errors.full_name) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.full_name;
                      return newErrors;
                    });
                  }
                  if (success) setSuccess(false);
                }}
                required
                className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                  errors.full_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Debe contener al menos 2 palabras (nombre y apellido)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, birth_date: e.target.value }));
                    if (errors.birth_date) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.birth_date;
                        return newErrors;
                      });
                    }
                    if (success) setSuccess(false);
                  }}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                    errors.birth_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.birth_date && (
                  <p className="mt-1 text-xs text-red-600">{errors.birth_date}</p>
                )}
              </div>

              <div>
                <label htmlFor="birth_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de nacimiento (opcional)
                </label>
                <input
                  id="birth_time"
                  name="birth_time"
                  type="time"
                  value={formData.birth_time}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, birth_time: e.target.value }));
                    if (success) setSuccess(false);
                  }}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Formato 24h (ej: 20:00 para 8:00 PM)
                </p>
              </div>
            </div>

            {/* GeoLocation Field */}
            <GeoLocationField
              city={formData.birth_city}
              country={formData.birth_country}
              latitude={formData.birth_latitude}
              longitude={formData.birth_longitude}
              onCityChange={(city) => {
                setFormData((prev) => ({ ...prev, birth_city: city }));
                if (errors.birth_city) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.birth_city;
                    return newErrors;
                  });
                }
                if (success) setSuccess(false);
              }}
              onCountryChange={(country) => {
                setFormData((prev) => ({ ...prev, birth_country: country }));
                if (errors.birth_country) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.birth_country;
                    return newErrors;
                  });
                }
                if (success) setSuccess(false);
              }}
              onCoordinatesChange={(lat, lng) => {
                setFormData((prev) => ({
                  ...prev,
                  birth_latitude: lat,
                  birth_longitude: lng,
                }));
              }}
              errors={{
                city: errors.birth_city,
                country: errors.birth_country,
              }}
            />

            {/* Coordinates Unlock Checkbox */}
            {(formData.birth_latitude && formData.birth_longitude) && (
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coordinatesUnlocked}
                    onChange={(e) => {
                      setCoordinatesUnlocked(e.target.checked);
                      if (!e.target.checked) {
                        // Reset to saved coordinates when unchecked
                        const birthData = user?.birth_data || {};
                        setFormData((prev) => ({
                          ...prev,
                          birth_latitude: birthData.birth_latitude || prev.birth_latitude,
                          birth_longitude: birthData.birth_longitude || prev.birth_longitude,
                        }));
                      }
                    }}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    Editar coordenadas manualmente
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2 ml-6">
                  Por defecto, las coordenadas se calculan automáticamente. Activa esta opción solo si necesitas ajustarlas manualmente.
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent-color)' }}
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
        fullName={formData.full_name}
      />
    </div>
  );
}
