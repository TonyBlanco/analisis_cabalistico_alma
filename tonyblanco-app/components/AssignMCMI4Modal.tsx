/**
 * AssignMCMI4Modal
 * 
 * Modal to assign mcmi4-signal test to patient
 * Used in therapist patient detail page
 * 
 * Auto-fetches patientUserId if not provided
 */

'use client';

import { useState, useEffect } from 'react';
import { createAssignment, getPatientDetail } from '@/lib/assignment-api';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AssignMCMI4ModalProps {
  isOpen?: boolean;  // Alternate prop name for compatibility
  open?: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
  patientUserId?: number | null;  // Optional - will be fetched if not provided
}

export default function AssignMCMI4Modal({
  isOpen,
  open,
  onClose,
  patientId,
  patientName,
  patientUserId: propPatientUserId,
}: AssignMCMI4ModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resolvedUserId, setResolvedUserId] = useState<number | null>(propPatientUserId ?? null);
  const [fetchingUser, setFetchingUser] = useState(false);

  const isVisible = isOpen ?? open ?? false;

  // Auto-fetch user_id when modal opens if not provided
  useEffect(() => {
    if (!isVisible) return;
    if (propPatientUserId) {
      setResolvedUserId(propPatientUserId);
      return;
    }

    // Fetch patient detail to get user_id
    setFetchingUser(true);
    getPatientDetail(patientId)
      .then((patient) => {
        const userId = patient?.user?.id || patient?.user_id || null;
        setResolvedUserId(userId);
        if (!userId) {
          setError('El consultante no tiene cuenta de usuario vinculada.');
        }
      })
      .catch((err) => {
        console.error('Error fetching patient user:', err);
        setError('No se pudo obtener información del consultante.');
      })
      .finally(() => setFetchingUser(false));
  }, [isVisible, patientId, propPatientUserId]);

  if (!isVisible) return null;

  const handleAssign = async () => {
    if (!resolvedUserId) {
      setError('El consultante debe tener una cuenta activa para asignar tests.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createAssignment({
        patient_id: patientId,
        assigned_to_user_id: resolvedUserId,
        test_type: 'mcmi4-signal',
        n_questions: 16, // MCMI-4 SIGNAL (16 ítems)
      });

      setSuccess(true);
      
      // Auto-close after 1.5s on success
      setTimeout(() => {
        onClose();
        // Reset state for next open
        setTimeout(() => {
          setSuccess(false);
          setError(null);
        }, 300);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al asignar MCMI-4';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent close during loading
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setError(null);
      setSuccess(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Asignar SWM MCMI-4 SIGNAL
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Cribado inicial (16 ítems · 5-8 min)
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {fetchingUser ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-gray-600">Obteniendo información del consultante...</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <p className="text-sm font-medium text-gray-900">¡Asignación exitosa!</p>
            <p className="text-xs text-gray-600 mt-1">
              El consultante verá el test en su panel
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Consultante:</span> {patientName}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  ID Consultante: {patientId} | ID Usuario: {resolvedUserId || 'N/A'}
                </p>
              </div>

              {!resolvedUserId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium">Usuario no vinculado</p>
                    <p className="mt-1">
                      El consultante debe tener una cuenta activa para ejecutar tests asignados.
                      Crea o vincula una cuenta primero.
                    </p>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-600 space-y-1">
                <p>✓ Test: <span className="font-medium">mcmi4-signal</span> (16 ítems de cribado)</p>
                <p>✓ Duración estimada: <span className="font-medium">5-8 minutos</span></p>
                <p>✓ El consultante lo verá en Tests Pendientes</p>
                <p>✓ Tras completar, podrá iniciar la Reflexión Experiencial</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssign}
                disabled={loading || !resolvedUserId}
                className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                {loading ? 'Asignando...' : 'Confirmar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
