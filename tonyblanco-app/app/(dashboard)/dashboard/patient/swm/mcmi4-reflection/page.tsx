'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, FileText, AlertCircle } from 'lucide-react';

/**
 * Patient Entrypoint for MCMI-4 Reflection
 * Checks if patient has a reflection workspace and redirects
 */
export default function PatientReflectionEntrypoint() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notAvailable, setNotAvailable] = useState(false);

  useEffect(() => {
    checkReflectionWorkspace();
  }, []);

  const checkReflectionWorkspace = async () => {
    try {
      // Get user_id from localStorage (same pattern as patient dashboard)
      const userIdStr = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;

      if (!userId) {
        setError('No se pudo obtener tu información de usuario');
        setLoading(false);
        return;
      }

      // Check if reflection workspace exists for this user
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/swm/mcmi4-reflection/by-user/${userId}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 404) {
        // No reflection workspace yet
        setNotAvailable(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const workspace = await response.json();
      
      // Redirect to workspace
      router.replace(`/dashboard/patient/swm/mcmi4-reflection/${workspace.workspace_id}`);
    } catch (err) {
      console.error('Error checking reflection workspace:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar reflexión');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando reflexión...
          </h2>
          <p className="text-sm text-gray-600">
            Verificando tu espacio de reflexión
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error al cargar
          </h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/patient')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (notAvailable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Reflexión no disponible
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Aún no tienes una reflexión asignada. Tu terapeuta te notificará cuando esté disponible.
          </p>
          <button
            onClick={() => router.push('/dashboard/patient')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return null;
}
