/**
 * PendingAssignmentsSection
 * 
 * Displays list of assignments for current patient
 * Fetches from /api/assignments/ (filtered by assigned_to_user_id)
 */

'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, Loader2, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Assignment {
  id: number;
  patient_id: number;
  test_type: string;
  assigned_by_user_id: number;
  assigned_to_user_id: number;
  questions_count: number;
  times_assigned: number;
  max_reassign: number;
  status: 'assigned' | 'in_progress' | 'pending_compute' | 'completed';
  locked: boolean;
  created_at: string;
  completed_at?: string;
}

function getTestDisplayName(testType: string): string {
  const names: Record<string, string> = {
    'mcmi4-signal': 'MCMI-4 Místico (Cribado Holístico)',
    'mcmi4-mystic': 'MCMI-4 Místico',
    'mcmi4': 'MCMI-4',
  };
  return names[testType] || testType;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export default function PendingAssignmentsSection() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('No autenticado. Por favor inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE}/assignments/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Acceso denegado. Verifica tus permisos.');
          return;
        }
        if (response.status === 404 || response.status === 401) {
          // Silently handle 404/401 - assignments may not exist or user not authenticated
          setAssignments([]);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const assignmentsList = Array.isArray(data) ? data : [];
      
      // Filter for pending assignments (assigned or in_progress)
      const pending = assignmentsList.filter(
        (a: Assignment) => a.status === 'assigned' || a.status === 'in_progress'
      );
      
      setAssignments(pending);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Error al cargar asignaciones.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssignment = (assignment: Assignment) => {
    // Navigate to correct test execution page based on test_type
    // mcmi4-signal → dedicated signal page
    // other tests → holistic assessment flow
    if (assignment.test_type === 'mcmi4-signal') {
      router.push('/dashboard/patient/tests/mcmi4-signal');
    } else {
      router.push(`/dashboard/patient/tests/holistic?assignment_id=${assignment.id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tests Pendientes</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tests Pendientes</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={fetchAssignments}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tests Pendientes</h2>
        </div>
        <p className="text-sm text-gray-600">
          No tienes tests pendientes en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Tests Pendientes ({assignments.length})
        </h2>
      </div>

      <div className="space-y-3">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="border border-gray-200 rounded-md p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium text-gray-900">
                    {getTestDisplayName(assignment.test_type)}
                  </h3>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Estado:</span>{' '}
                    {assignment.status === 'assigned' && 'Asignado (sin iniciar)'}
                    {assignment.status === 'in_progress' && 'En progreso'}
                  </p>
                  <p>
                    <span className="font-medium">Preguntas:</span> {assignment.questions_count}
                  </p>
                  <p>
                    <span className="font-medium">Asignado:</span>{' '}
                    {new Date(assignment.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleStartAssignment(assignment)}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                {assignment.status === 'assigned' ? 'Comenzar' : 'Continuar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
