'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Calendar, Lock, LogOut, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { clearAuthState } from '@/lib/auth-state';

interface PatientProfile {
  legal_full_name: string;
  full_name?: string;
  email: string;
  phone: string;
  birth_date: string;
  birth_time?: string;
  birth_city: string;
  birth_country: string;
  birth_latitude?: number | null;
  birth_longitude?: number | null;
  birth_timezone?: string;
  profile_version: number;
  name_change_count: number;
  consent_accepted_at?: string | null;
}

/**
 * Patient Account Page
 * 
 * Simplified account management for patients.
 * Uses /api/profile/me/ endpoint.
 */
export default function PatientAccountPage() {
  const router = useRouter();
  const fetchedRef = useRef(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [formData, setFormData] = useState({
    legal_full_name: '',
    phone: '',
  });

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  };

  // Fetch profile on mount
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const loadProfile = async () => {
      const token = getAuthToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        const response = await fetch(`${apiUrl}/profile/me/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            clearAuthState();
            router.push('/login');
            return;
          }
          throw new Error('No se pudo cargar el perfil');
        }

        const data = await response.json();
        setProfile(data);
        setFormData({
          legal_full_name: data.legal_full_name || '',
          phone: data.phone || '',
        });
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/profile/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          legal_full_name: formData.legal_full_name.trim(),
          phone: formData.phone.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al guardar');
      }

      const updated = await response.json();
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuthState();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            <span className="ml-3 text-gray-600">Cargando perfil...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const nameChangesRemaining = 2 - (profile?.name_change_count || 0);
  const canEditName = (profile?.name_change_count || 0) < 2;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Mi cuenta</h1>
        <p className="text-gray-600">
          Gestiona tu información personal
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">Perfil actualizado correctamente</p>
        </div>
      )}

      {/* Error Message */}
      {error && profile && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
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
              Nombre legal completo
            </label>
            <input
              type="text"
              value={formData.legal_full_name}
              onChange={(e) => setFormData({ ...formData, legal_full_name: e.target.value })}
              disabled={!canEditName}
              className={`w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                !canEditName ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {!canEditName && (
              <div className="flex items-center gap-2 mt-2 text-amber-700">
                <Lock className="w-4 h-4" />
                <p className="text-xs">Cambios de nombre bloqueados (2/2 usados)</p>
              </div>
            )}
            {canEditName && profile?.name_change_count === 1 && (
              <p className="text-xs text-amber-600 mt-1">
                Último cambio de nombre disponible
              </p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-gray-500 bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Birth Data (read-only for patients) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Datos de nacimiento</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-700">
            <Lock className="w-4 h-4 inline mr-1" />
            Estos datos son gestionados por tu terapeuta y no pueden ser modificados directamente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de nacimiento</label>
            <p className="text-gray-900">
              {profile?.birth_date 
                ? new Date(profile.birth_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'No especificada'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Hora de nacimiento</label>
            <p className="text-gray-900">{profile?.birth_time || 'No especificada'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Lugar de nacimiento</label>
            <p className="text-gray-900 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              {profile?.birth_city && profile?.birth_country 
                ? `${profile.birth_city}, ${profile.birth_country}`
                : 'No especificado'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Zona horaria</label>
            <p className="text-gray-900">{profile?.birth_timezone || 'No especificada'}</p>
          </div>
        </div>
      </div>

      {/* Consent Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile?.consent_accepted_at ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            <div>
              <h3 className="font-medium text-gray-900">Consentimiento terapéutico</h3>
              <p className="text-sm text-gray-600">
                {profile?.consent_accepted_at ? 'Aceptado y activo' : 'Pendiente de aceptación'}
              </p>
            </div>
          </div>
          {profile?.consent_accepted_at && (
            <span className="text-xs text-gray-500">
              Aceptado el {new Date(profile.consent_accepted_at).toLocaleDateString('es-ES')}
            </span>
          )}
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

      {/* Version Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500">
          Versión del perfil: {profile?.profile_version || 1}
        </p>
      </div>
    </div>
  );
}
