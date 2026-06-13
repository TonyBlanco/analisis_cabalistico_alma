'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGoogleSection } from '@/components/AuthGoogleSection';
import { loginWithGoogle } from '@/lib/api';
import { clearAuthState } from '@/lib/auth-state';
import { completeAuthFromToken } from '@/lib/finishAuthSession';
import { fetchSession } from '@/lib/session';
import Link from 'next/link';
import { getApiBaseUrl } from '@/lib/api-base';
import { TurnstileField, type TurnstileFieldHandle } from '@/components/TurnstileField';
import { turnstileApiErrorMessage } from '@/lib/turnstile-messages';

const API_URL = getApiBaseUrl();

export default function PersonalRegistrationPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    birth_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [googleSignInKey, setGoogleSignInKey] = useState(0);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);

  useEffect(() => {
    fetchSession().then((session) => {
      if (session.isAuthenticated && session.user) {
        router.replace('/dashboard');
      } else {
        clearAuthState();
        setGoogleSignInKey((k) => k + 1);
      }
    });
  }, [router]);

  const handleGoogleCredential = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle(credential, 'personal');
      const path = await completeAuthFromToken(
        res.token,
        res.user?.user_type ?? res.role
      );
      router.replace(path);
    } catch (err: unknown) {
      const response = (err as { response?: { message?: string; error?: string } })?.response;
      setError(
        response?.message ||
          (response?.error === 'google_auth_disabled'
            ? 'Inicio con Google aún no está configurado en el servidor'
            : 'No se pudo continuar con Google')
      );
      setLoading(false);
    }
  };

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

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.full_name.trim()) {
      errors.full_name = 'El nombre completo es requerido';
    }

    if (!formData.birth_date) {
      errors.birth_date = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate >= today) {
        errors.birth_date = 'La fecha de nacimiento debe ser anterior a hoy';
      }
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

    const ts = turnstileRef.current;
    if (ts?.isEnforced() && !ts.getToken()) {
      setError('Completa la verificación de seguridad antes de continuar.');
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim() || '',
        birth_date: formData.birth_date,
      };
      const turnstileToken = ts?.getToken();
      if (turnstileToken) payload.turnstile_token = turnstileToken;

      const response = await fetch(`${API_URL}/register/personal/`, {
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
          if (data.error?.startsWith?.('turnstile_')) {
            setError(turnstileApiErrorMessage(data.error, data.message));
            turnstileRef.current?.reset();
            return;
          }
          const backendErrors: Record<string, string> = {};
          Object.keys(data).forEach((key) => {
            if (key === 'error' || key === 'message') return;
            if (Array.isArray(data[key])) {
              backendErrors[key] = data[key][0];
            } else if (typeof data[key] === 'string') {
              backendErrors[key] = data[key];
            }
          });
          setFieldErrors(backendErrors);
          setError(data.message || 'Por favor, corrige los errores en el formulario');
          return;
        }
        throw new Error(data.error || data.message || 'Error al registrar');
      }

      // Success - store token and redirect
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        router.push('/dashboard');
      } else {
        router.push('/login?registered=personal');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cuenta';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Registro Personal
          </h1>
          <p className="text-sm text-gray-600">
            Crea una cuenta personal para acceder a los tests
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Personal Information */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-4">Información Personal</h2>
            
            <div className="space-y-4">
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
                    fieldErrors.birth_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.birth_date && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.birth_date}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Opcional"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="border-t border-gray-200 pt-4">
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

          <AuthGoogleSection
            googleKey={googleSignInKey}
            disabled={loading}
            onCredential={handleGoogleCredential}
            onError={(msg) => setError(msg)}
          />

          <TurnstileField
            ref={turnstileRef}
            theme="light"
            onError={(msg) => setError(msg)}
          />

          <div className="pt-4">
            {error && (
              <div role="alert" className="mb-3 bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {Object.keys(fieldErrors).length > 0 && (
              <p role="alert" className="mb-3 text-sm text-red-700">
                Revisa los campos obligatorios marcados antes de crear la cuenta.
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-md text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={{
                backgroundColor: loading ? undefined : 'var(--accent-color)',
              }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta personal'}
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
