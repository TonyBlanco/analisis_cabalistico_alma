/**
 * AssignMCMI4Modal
 * 
 * Modal to assign mcmi4-signal test to patient
 * Used in therapist patient detail page
 */

'use client';

import { useState } from 'react';
import { createAssignment } from '@/lib/assignment-api';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface AssignMCMI4ModalProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
  patientUserId: number | null;
}

export default function AssignMCMI4Modal({
  open,
  onClose,
  patientId,
  patientName,
  patientUserId,
}: AssignMCMI4ModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleAssign = async () => {
    if (!patientUserId) {
      setError('El consultante debe tener una cuenta activa para asignar tests.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createAssignment({
        patient_id: patientId,
        assigned_to_user_id: patientUserId,
        test_type: 'mcmi4-signal',
        n_questions: 175, // MCMI-4 standard
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
              Asignar MCMI-4 Místico
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Test de Cribado Holístico (175 ítems)
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
        {success ? (
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
                  ID Consultante: {patientId} | ID Usuario: {patientUserId || 'N/A'}
                </p>
              </div>

              {!patientUserId && (
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
                <p>✓ Test: <span className="font-medium">mcmi4-signal</span> (Cribado Holístico)</p>
                <p>✓ Duración estimada: <span className="font-medium">5-8 minutos</span></p>
                <p>✓ El consultante podrá ejecutarlo desde su panel</p>
                <p>✓ Los resultados quedarán disponibles para interpretación</p>
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
                disabled={loading || !patientUserId}
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
