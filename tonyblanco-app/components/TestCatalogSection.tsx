'use client';

import { useState, useEffect } from 'react';
import { getAvailableTests } from '@/lib/test-api';
import { TestModule } from '@/lib/test-types';
import { getActivePatientId } from '@/lib/active-patient';

interface TestCatalogSectionProps {
  onTestAssigned?: () => void; // Callback when a test is assigned (to refresh assigned list)
}

/**
 * Test Catalog Section Component
 * 
 * Displays tests filtered by execution_mode:
 * - "Asignables al paciente" (patient_self only) - with assignment capability
 * - "Evaluaciones clínicas" (therapist_clinical only) - no assignment
 * 
 * Assignment is only available for patient_self tests when active patient is selected.
 */
export default function TestCatalogSection({ onTestAssigned }: TestCatalogSectionProps = {}) {
  const [tests, setTests] = useState<TestModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assignable' | 'clinical'>('assignable');
  const [assigningTestCode, setAssigningTestCode] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [testToAssign, setTestToAssign] = useState<TestModule | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAvailableTests();
      setTests(response.tests || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar catálogo de tests';
      setError(errorMessage);
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter tests by execution_mode
  // patient_self: available_for_personal=True (may also have available_for_therapists=True)
  // therapist_clinical: available_for_therapists=True AND available_for_personal=False
  const assignableTests = tests.filter((test) => {
    // patient_self tests: available_for_personal must be true
    return test.available_for_personal === true;
  });

  const clinicalTests = tests.filter((test) => {
    // therapist_clinical tests: available_for_therapists=True AND available_for_personal=False
    return test.available_for_therapists === true && test.available_for_personal === false;
  });

  const activePatientId = getActivePatientId();

  const handleAssignTest = (test: TestModule) => {
    if (!activePatientId) {
      alert('Por favor, selecciona un paciente activo antes de asignar un test.');
      return;
    }
    setTestToAssign(test);
    setShowConfirmModal(true);
  };

  const confirmAssignTest = async () => {
    if (!testToAssign || !activePatientId) return;

    setAssigningTestCode(testToAssign.code);
    setShowConfirmModal(false);

    try {
      // Import here to avoid circular dependencies
      const { assignTestToPatient } = await import('@/lib/assignment-api');
      
      // New endpoint uses patient_id directly, backend validates patient has linked User account
      await assignTestToPatient(activePatientId, testToAssign.code);
      
      // Show success message
      alert(`Test "${testToAssign.name}" asignado correctamente al paciente.`);
      
      // Refresh assigned tests list
      if (onTestAssigned) {
        onTestAssigned();
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al asignar test';
      alert(errorMessage);
      console.error('Error assigning test:', error);
    } finally {
      setAssigningTestCode(null);
      setTestToAssign(null);
    }
  };

  const cancelAssignTest = () => {
    setShowConfirmModal(false);
    setTestToAssign(null);
  };

  // Helper component for assign button
  const AssignTestButton = ({ test, onAssign, disabled }: { test: TestModule; onAssign: () => void; disabled: boolean }) => {
    if (!activePatientId) {
      return (
        <button
          disabled
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed"
          title="Selecciona un paciente activo para asignar tests"
        >
          Asignar
        </button>
      );
    }

    return (
      <button
        onClick={onAssign}
        disabled={disabled}
        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        style={{ backgroundColor: 'var(--accent-color)' }}
      >
        {disabled ? 'Asignando...' : 'Asignar'}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Catálogo de Tests</h2>
        <div className="text-center py-12">
          <div className="inline-block animate-pulse">
            <div className="h-2 w-32 bg-gray-200 rounded mb-2"></div>
            <p className="text-sm text-gray-500 mt-2">Cargando catálogo de tests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Catálogo de Tests</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={fetchTests}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Catálogo de Tests</h2>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('assignable')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'assignable'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Asignables al paciente ({assignableTests.length})
          </button>
          <button
            onClick={() => setActiveTab('clinical')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'clinical'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Evaluaciones clínicas ({clinicalTests.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {activeTab === 'assignable' && (
          <div>
            {assignableTests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No hay tests asignables disponibles.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignableTests.map((test) => (
                  <div
                    key={test.code}
                    className="border border-gray-200 rounded-md p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{test.name}</h3>
                        {test.description && (
                          <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Asignable
                          </span>
                          {test.test_type && (
                            <span className="text-xs text-gray-500">{test.test_type}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <AssignTestButton
                          test={test}
                          onAssign={() => handleAssignTest(test)}
                          disabled={assigningTestCode === test.code}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clinical' && (
          <div>
            {clinicalTests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No hay evaluaciones clínicas disponibles.</p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <p className="text-sm text-blue-800">
                  💡 Las evaluaciones clínicas se ejecutan directamente desde la sección dedicada más abajo.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assignment Confirmation Modal */}
      {showConfirmModal && testToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={cancelAssignTest}>
          <div
            className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar asignación</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Deseas asignar el test <strong>"{testToAssign.name}"</strong> al paciente activo?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={cancelAssignTest}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAssignTest}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
