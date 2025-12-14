'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/lib/session';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

/**
 * Profile Page
 * 
 * Per-role profile form (same base form for all roles).
 * Editable fields: full_name, birth_date, birth_city, birth_country
 * Read-only: email, real role
 */
export default function ProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    birth_city: '',
    birth_country: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      setLoading(false);
    });

    fetchSession().then((session) => {
      if (session.user) {
        setUser(session.user);
        
        // Initialize form data from user session
        const birthData = session.user.birth_data || {};
        setFormData({
          full_name: session.user.full_name || session.user.profile?.full_name || '',
          birth_date: session.user.birth_date || birthData.birth_date || '',
          birth_city: birthData.birth_city || '',
          birth_country: birthData.birth_country || '',
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
      const nameWords = formData.full_name.trim().split(/\s+/).filter((w) => w.length > 0);
      if (nameWords.length < 2) {
        newErrors.full_name = 'El nombre completo debe contener al menos 2 palabras';
      }
    }

    // Birth date required
    if (!formData.birth_date) {
      newErrors.birth_date = 'La fecha de nacimiento es requerida para análisis precisos';
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.birth_date = 'La fecha de nacimiento debe ser anterior a hoy';
      }
    }

    // Birth city required
    if (!formData.birth_city.trim()) {
      newErrors.birth_city = 'La ciudad de nacimiento es requerida para análisis precisos';
    }

    // Birth country required
    if (!formData.birth_country.trim()) {
      newErrors.birth_country = 'El país de nacimiento es requerido para análisis precisos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear success message when user makes changes
    if (success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        full_name: formData.full_name.trim(),
        birth_date: formData.birth_date,
        birth_city: formData.birth_city.trim(),
        birth_country: formData.birth_country.trim(),
      };

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
        throw new Error(errorData.error || errorData.message || 'Error al actualizar perfil');
      }

      // Success - refresh session and show success message
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
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Mi Perfil
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Completa tu información personal para garantizar la precisión de los análisis
        </p>
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
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
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

            <div>
              <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de nacimiento <span className="text-red-500">*</span>
              </label>
              <input
                id="birth_date"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                  errors.birth_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.birth_date && (
                <p className="mt-1 text-xs text-red-600">{errors.birth_date}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Requerida para análisis astrológicos y cabalísticos precisos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="birth_city" className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad de nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  id="birth_city"
                  name="birth_city"
                  type="text"
                  value={formData.birth_city}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                    errors.birth_city ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.birth_city && (
                  <p className="mt-1 text-xs text-red-600">{errors.birth_city}</p>
                )}
              </div>

              <div>
                <label htmlFor="birth_country" className="block text-sm font-medium text-gray-700 mb-2">
                  País de nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  id="birth_country"
                  name="birth_country"
                  type="text"
                  value={formData.birth_country}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                    errors.birth_country ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.birth_country && (
                  <p className="mt-1 text-xs text-red-600">{errors.birth_country}</p>
                )}
              </div>
            </div>
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
    </div>
  );
}
