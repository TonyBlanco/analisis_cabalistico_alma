'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/lib/session';
import { useRoleGuard } from '@/lib/role-guards';
import { getUserRole } from '@/lib/getUserRole';
import { clearAuthState } from '@/lib/auth-state';
import GeoLocationField from '@/components/GeoLocationField';
import NameVerificationModal from '@/components/NameVerificationModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

/**
 * Account Page (User Profile)
 */
export default function AccountPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  
  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['admin', 'therapist', 'personal', 'patient'],
    redirectTo: '/login',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Get user role
  useEffect(() => {
    getUserRole().then((userRole) => {
      if (userRole) {
        setRole(userRole);
      }
    });
  }, []);
  const [formData, setFormData] = useState({
    full_name: '',
    legal_full_name: '',
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
  const [nameChangeCount, setNameChangeCount] = useState<number>(0);
  const [originalFullName, setOriginalFullName] = useState<string>('');
  const pendingSubmitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const session = await fetchSession();
      if (session.user) {
        setUser(session.user);
        const birthData = session.user.birth_data || {};
        const fullName =
          session.user.full_name || session.user.legal_full_name || birthData.full_name || '';
        setOriginalFullName(fullName);

        let baseForm = {
          full_name: fullName,
          legal_full_name: session.user.legal_full_name || fullName,
          birth_date: session.user.birth_date || birthData.birth_date || '',
          birth_time: birthData.birth_time || '',
          birth_city: session.user.birth_city || birthData.birth_city || '',
          birth_country: session.user.birth_country || birthData.birth_country || '',
          birth_latitude: session.user.birth_latitude || birthData.birth_latitude || null,
          birth_longitude: session.user.birth_longitude || birthData.birth_longitude || null,
          email: session.user.email || '',
        };

        try {
          const token =
            typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
          if (token) {
            const res = await fetch(`${API_URL}/profile/me/`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
              },
            });
            if (res.ok) {
              const profile = await res.json();
              baseForm = {
                ...baseForm,
                legal_full_name: profile.legal_full_name || baseForm.legal_full_name,
                birth_date: profile.birth_date || baseForm.birth_date,
                birth_time: profile.birth_time || baseForm.birth_time,
                birth_city: profile.birth_city || baseForm.birth_city,
                birth_country: profile.birth_country || baseForm.birth_country,
                birth_latitude:
                  profile.birth_latitude ?? baseForm.birth_latitude,
                birth_longitude:
                  profile.birth_longitude ?? baseForm.birth_longitude,
              };
              if (typeof profile.name_change_count === 'number') {
                setNameChangeCount(profile.name_change_count);
              }
            }
          }
        } catch (e) {
          console.warn('No se pudo cargar /profile/me/', e);
        }

        setFormData(baseForm);
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es requerido';
    } else {
      const nameWords = formData.full_name.trim().split(/\s+/).filter((w: string) => w.length > 0);
      if (nameWords.length < 2) {
        newErrors.full_name = 'El nombre completo debe contener al menos 2 palabras';
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

    try {
      const token = localStorage.getItem('authToken');
      const payload: Record<string, any> = {
        full_name: formData.full_name.trim(),
        legal_full_name: formData.legal_full_name.trim() || formData.full_name.trim(),
        birth_date: formData.birth_date,
        birth_city: formData.birth_city.trim(),
        birth_country: formData.birth_country.trim(),
      };

      if (formData.birth_time) {
        payload.birth_time = formData.birth_time;
      }

      if (
        formData.birth_latitude &&
        formData.birth_longitude &&
        formData.birth_latitude !== 0 &&
        formData.birth_longitude !== 0 &&
        !isNaN(formData.birth_latitude) &&
        !isNaN(formData.birth_longitude)
      ) {
        payload.birth_latitude = formData.birth_latitude;
        payload.birth_longitude = formData.birth_longitude;
      }

      const response = await fetch(`${API_URL}/profile/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const backendErrors: Record<string, string> = {};
        const legalError =
          responseData.legal_full_name ||
          responseData.error ||
          responseData.detail ||
          responseData.message;

        if (legalError) {
          backendErrors.legal_full_name = Array.isArray(legalError)
            ? legalError.join(' ')
            : String(legalError);
        }

        if (
          backendErrors.legal_full_name &&
          backendErrors.legal_full_name.toLowerCase().includes('bloquead')
        ) {
          backendErrors.submit =
            'Cambios de nombre bloqueados. Contacta support@tonyblanco.es';
        } else if (!backendErrors.submit) {
          backendErrors.submit =
            responseData.error || responseData.message || 'Error al actualizar perfil';
        }

        setErrors(backendErrors);
        throw new Error(backendErrors.submit);
      }

      if (typeof responseData.name_change_count === 'number') {
        setNameChangeCount(responseData.name_change_count);
      }

      setSuccess(true);
      const session = await fetchSession();
      if (session.user) {
        setUser(session.user);
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

    const isNameChanging = formData.full_name.trim() !== originalFullName.trim();
    const isFirstTime = !originalFullName.trim();

    if (isNameChanging || isFirstTime) {
      setShowNameVerificationModal(true);
      pendingSubmitRef.current = performSubmit;
      return;
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
          {/* Nombre legal y nombre para cálculos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo legal
              </label>
              <input
                type="text"
                value={formData.legal_full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, legal_full_name: e.target.value }))
                }
                className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                  errors.legal_full_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre y apellidos tal como figuran en tus documentos"
              />
              {errors.legal_full_name && (
                <p className="mt-1 text-xs text-red-600">{errors.legal_full_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre para cálculos cabalísticos
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
                className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                  errors.full_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre que usaremos para los análisis"
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>
              )}
              {nameChangeCount > 0 && nameChangeCount < 2 && (
                <p className="mt-1 text-xs text-amber-600">
                  Has cambiado tu nombre {nameChangeCount}/2 veces
                </p>
              )}
              {nameChangeCount >= 2 && (
                <p className="mt-1 text-xs text-red-600">
                  Has alcanzado el máximo de 2 cambios de nombre. Para más cambios, contacta con
                  soporte.
                </p>
              )}
            </div>
          </div>

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
        fullName={formData.full_name}
      />
    </div>
  );
}
