'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchSession } from '@/lib/session';
import DisclaimerModal from '@/components/DisclaimerModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

export default function TherapistRegistrationPage() {
  const router = useRouter();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
  // Check if user is already authenticated - redirect to dashboard if so
  useEffect(() => {
    fetchSession().then((session) => {
      if (session.isAuthenticated && session.user) {
        // User is authenticated - redirect to dashboard (DO NOT logout)
        router.replace('/dashboard');
      }
    });
  }, [router]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    profession: '',
    specialization: '',
    license_number: '',
    years_of_experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.full_name.trim()) {
      errors.full_name = 'El nombre completo es requerido';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono es requerido';
    }

    if (!formData.profession.trim()) {
      errors.profession = 'La profesión es requerida';
    }

    if (!formData.years_of_experience) {
      errors.years_of_experience = 'Los años de experiencia son requeridos';
    } else if (isNaN(Number(formData.years_of_experience)) || Number(formData.years_of_experience) < 0) {
      errors.years_of_experience = 'Debe ser un número válido';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        profession: formData.profession.trim(),
        specialization: formData.specialization.trim() || '',
        license_number: formData.license_number.trim() || '',
        years_of_experience: parseInt(formData.years_of_experience, 10),
      };

      const response = await fetch(`${API_URL}/register/therapist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (response.status === 400 && data) {
          const backendErrors: Record<string, string> = {};
          Object.keys(data).forEach((key) => {
            if (Array.isArray(data[key])) {
              backendErrors[key] = data[key][0];
            } else {
              backendErrors[key] = data[key];
            }
          });
          setFieldErrors(backendErrors);
          setError('Por favor, corrige los errores en el formulario');
          return;
        }
        throw new Error(data.error || data.message || 'Error al registrar');
      }

      // Success - store token and redirect to login
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        // Redirect to dashboard (will handle role-based redirect)
        router.push('/dashboard');
      } else {
        // No auto-login, redirect to login with success
        router.push('/login?registered=therapist');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cuenta';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Show disclaimer first
  if (showDisclaimer) {
    return (
      <DisclaimerModal
        open={true}
        type="therapist_registration"
        onAccept={() => {
          setDisclaimerAccepted(true);
          setShowDisclaimer(false);
        }}
        onCancel={() => router.push('/login')}
        cancelable={true}
      />
    );
  }

  // STEP 2: Show form only after disclaimer accepted
  if (!disclaimerAccepted) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Registro Profesional
          </h1>
          <p className="text-sm text-gray-600">
            Crea una cuenta profesional para terapeutas
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Información Personal</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    fieldErrors.full_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.full_name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.full_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                    fieldErrors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Información de Cuenta</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de usuario <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                    fieldErrors.username ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.username && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                    fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                      fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                      fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-4">Información Profesional</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-2">
                  Profesión <span className="text-red-500">*</span>
                </label>
                <input
                  id="profession"
                  name="profession"
                  type="text"
                  value={formData.profession}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Psicólogo, Terapeuta, etc."
                  className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                    fieldErrors.profession ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.profession && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.profession}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                    Especialización
                  </label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="Opcional"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de colegiado/licencia
                  </label>
                  <input
                    id="license_number"
                    name="license_number"
                    type="text"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="Opcional"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700 mb-2">
                  Años de experiencia <span className="text-red-500">*</span>
                </label>
                <input
                  id="years_of_experience"
                  name="years_of_experience"
                  type="number"
                  min="0"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                    fieldErrors.years_of_experience ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.years_of_experience && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.years_of_experience}</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-md text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={{
                backgroundColor: loading ? undefined : 'var(--accent-color)',
              }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta profesional'}
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-gray-900 font-medium hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
