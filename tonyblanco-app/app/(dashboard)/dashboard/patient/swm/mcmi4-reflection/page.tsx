'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, FileText, AlertCircle, Sparkles, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { fetchSession } from '@/lib/session';
import { getApiBaseUrl } from '@/lib/api-base';

const API_BASE = getApiBaseUrl();

/**
 * Patient Entrypoint for MCMI-4 Reflection
 * 
 * CRITICAL: Always works with the LATEST signal to avoid workspace reuse bugs.
 * 
 * Behavior:
 * 1. Get latest mcmi4-signal TestResult for user
 * 2. If no SIGNAL → show CTA to complete SIGNAL first
 * 3. Check if workspace exists for THAT specific signal_id (by-signal endpoint)
 * 4. If workspace exists for latest signal → redirect
 * 5. If no workspace for latest signal → auto-create with create-by-signal
 * 6. If user is not patient (e.g. therapist) → show permission notice
 */
export default function PatientReflectionEntrypoint() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSignal, setNeedsSignal] = useState(false);
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    checkAndCreateReflectionWorkspace();
  }, []);

  const getAuthHeaders = (): HeadersInit => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('authToken') || localStorage.getItem('token')
      : null;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    return headers;
  };

  const checkAndCreateReflectionWorkspace = async () => {
    try {
      // Get current user from session API
      const session = await fetchSession();
      
      if (!session.isAuthenticated || !session.user) {
        setError('Sesión no válida. Por favor inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      // Step 1: Get latest mcmi4-signal TestResult (source of truth)
      const signalResp = await fetch(
        `${API_BASE}/tests/results/?test_code=mcmi4-signal&user_id=${userId}`,
        { credentials: 'include', headers: getAuthHeaders() }
      );

      if (!signalResp.ok) {
        if (signalResp.status === 401) {
          setError('Sesión expirada. Por favor inicia sesión nuevamente.');
          setLoading(false);
          return;
        }
        if (signalResp.status === 403) {
          setPermissionDenied(true);
          setLoading(false);
          return;
        }
        throw new Error('Error al verificar tu evaluación MCMI-4.');
      }

      const signalData = await signalResp.json();
      const signals = Array.isArray(signalData) ? signalData : (signalData.results || []);

      if (signals.length === 0) {
        // No SIGNAL completed → show CTA
        setNeedsSignal(true);
        setLoading(false);
        return;
      }

      // Get latest signal (most recent created_at)
      const latestSignal = signals.sort((a: any, b: any) => {
        const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      })[0];

      const latestSignalId = String(latestSignal.id);

      // Step 2: Check if workspace exists for THIS specific signal (not by-user!)
      const bySignalResp = await fetch(
        `${API_BASE}/swm/mcmi4-reflection/by-signal/${latestSignalId}`,
        { credentials: 'include', headers: getAuthHeaders() }
      );

      if (bySignalResp.ok) {
        // Workspace exists for latest signal → redirect
        const workspace = await bySignalResp.json();
        router.replace(`/dashboard/patient/swm/mcmi4-reflection/${workspace.workspace_id}`);
        return;
      }

      // 404 = no workspace for this signal yet → create it
      if (bySignalResp.status === 404) {
        setCreatingWorkspace(true);
        const createResp = await fetch(
          `${API_BASE}/swm/mcmi4-reflection/create-by-signal`,
          {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              subject_user_id: userId,
              signal_id: latestSignalId,
            }),
          }
        );

        if (!createResp.ok) {
          const errData = await createResp.json().catch(() => ({}));
          throw new Error(errData.error || `Error al crear reflexión (HTTP ${createResp.status})`);
        }

        const newWorkspace = await createResp.json();
        router.replace(`/dashboard/patient/swm/mcmi4-reflection/${newWorkspace.workspace_id}`);
        return;
      }

      // Other error from by-signal
      throw new Error(`HTTP ${bySignalResp.status}`);
    } catch (err) {
      console.error('Error in reflection entrypoint:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar reflexión');
      setLoading(false);
    }
  };

  if (loading || creatingWorkspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {creatingWorkspace ? 'Preparando tu reflexión...' : 'Cargando...'}
          </h2>
          <p className="text-sm text-gray-600">
            {creatingWorkspace 
              ? 'Creando tu espacio de reflexión personal'
              : 'Verificando tu estado de reflexión'
            }
          </p>
        </div>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vista de Consultante
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Esta página es exclusiva para consultantes. Si eres terapeuta, usa el panel 
            de terapeuta para ver las reflexiones de tus consultantes.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard/therapist"
              className="block w-full px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-center"
            >
              Ir al Panel de Terapeuta
            </Link>
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Volver atrás
            </button>
          </div>
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

  if (needsSignal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Sparkles className="w-12 h-12 text-violet-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completa tu MCMI-4 primero
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Para acceder a la Reflexión Personal, primero debes completar la evaluación MCMI-4 Señal que te ha asignado tu terapeuta.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard/patient"
              className="block w-full px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 text-center"
            >
              Ver mis tests pendientes
            </Link>
            <button
              onClick={() => router.push('/dashboard/patient')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
