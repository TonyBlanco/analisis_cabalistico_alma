'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface AssignedTest {
  id: string;
  name: string;
  status: 'completed' | 'pending';
  completed_at?: string;
  assigned_at: string;
}

export default function PatientTestsPage() {
  const [tests, setTests] = useState<AssignedTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch assigned tests from backend
    // Placeholder data
    setTests([
      {
        id: '1',
        name: 'Análisis Cabalístico Básico',
        status: 'completed',
        completed_at: '2024-03-15',
        assigned_at: '2024-03-10',
      },
      {
        id: '2',
        name: 'Test de Autoobservación',
        status: 'pending',
        assigned_at: '2024-03-18',
      },
      {
        id: '3',
        name: 'Cuestionario de Proceso Personal',
        status: 'pending',
        assigned_at: '2024-03-20',
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-500">Cargando tests asignados...</p>
        </div>
      </div>
    );
  }

  const pendingTests = tests.filter(t => t.status === 'pending');
  const completedTests = tests.filter(t => t.status === 'completed');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Tests asignados</h1>
        <p className="text-gray-600">
          Completa los tests que tu terapeuta ha preparado para ti
        </p>
      </div>

      {/* Tests pendientes */}
      {pendingTests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Pendientes</h2>
          <div className="space-y-3">
            {pendingTests.map((test) => (
              <div
                key={test.id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-violet-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Asignado el {new Date(test.assigned_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // TODO: Navigate to test execution
                      console.log('Execute test:', test.id);
                    }}
                    className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors text-sm font-medium"
                  >
                    Comenzar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tests completados */}
      {completedTests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Completados</h2>
          <div className="space-y-3">
            {completedTests.map((test) => (
              <div
                key={test.id}
                className="bg-white border border-gray-200 rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Completado el {test.completed_at ? new Date(test.completed_at).toLocaleDateString('es-ES') : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // TODO: Navigate to result
                      console.log('View result:', test.id);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Ver resultado
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {tests.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No tienes tests asignados
          </h3>
          <p className="text-gray-500 text-sm">
            Tu terapeuta te asignará tests según tu proceso personal
          </p>
        </div>
      )}
    </div>
  );
}
