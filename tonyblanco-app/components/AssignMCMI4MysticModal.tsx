/**
 * AssignMCMI4MysticModal
 * 
 * Modal to assign MCMI-4 Místico (195 ítems) to patient
 * ONLY appears after patient has completed mcmi4-signal
 * Shows detected dominant/shadow world from SIGNAL
 * 
 * Flow: SIGNAL (16) → [this modal] → assigns mcmi4-mystic (195)
 * 
 * Auto-fetches patientUserId if not provided
 */

'use client';

import { useState, useEffect } from 'react';
import { createAssignment, getPatientDetail } from '@/lib/assignment-api';
import { X, CheckCircle, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface AssignMCMI4MysticModalProps {
  isOpen?: boolean;  // Alternate prop name for compatibility
  open?: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
  patientUserId?: number | null;  // Optional - will be fetched if not provided
  /** Optional: dominant world detected from SIGNAL */
  dominantWorld?: string | null;
  /** Optional: shadow/weakest world detected from SIGNAL */
  shadowWorld?: string | null;
  /** Optional: signal test result ID for reference */
  signalTestResultId?: number | string | null;
}

const WORLD_LABELS: Record<string, string> = {
  atzilut: 'Atzilut (Emanativo/Espiritual)',
  briah: 'Briah (Creativo/Intelectual)',
  yetzirah: 'Yetzirah (Formativo/Emocional)',
  assiah: 'Assiah (Material/Físico)',
};

export default function AssignMCMI4MysticModal({
  isOpen,
  open,
  onClose,
  patientId,
  patientName,
  patientUserId: propPatientUserId,
  dominantWorld,
  shadowWorld,
  signalTestResultId,
}: AssignMCMI4MysticModalProps) {
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
        test_type: 'mcmi4-mystic',  // 195 ítems
        n_questions: 195,
      });

      setSuccess(true);
      
      // Auto-close after 1.5s on success
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setSuccess(false);
          setError(null);
        }, 300);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al asignar MCMI-4 Místico';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
    setTimeout(() => {
      setError(null);
      setSuccess(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-violet-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Asignar MCMI-4 Místico (195 ítems)
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Evaluación profunda por los 4 Mundos Cabalísticos
              </p>
            </div>
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
              El consultante verá el test completo (195 ítems) en su panel
            </p>
          </div>
        ) : (
          <>
            {/* Signal Results Summary (if available) */}
            {(dominantWorld || shadowWorld) && (
              <div className="mb-4 bg-violet-50 border border-violet-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-violet-600 font-medium mb-2">
                  Resultado del SIGNAL (Cribado)
                </p>
                <div className="space-y-2 text-sm">
                  {dominantWorld && (
                    <div className="flex items-center gap-2">
                      <span className="text-violet-700">Mundo Predominante:</span>
                      <span className="font-medium text-violet-900">
                        {WORLD_LABELS[dominantWorld] || dominantWorld}
                      </span>
                    </div>
                  )}
                  {shadowWorld && (
                    <div className="flex items-center gap-2">
                      <span className="text-violet-700">Mundo Sombra:</span>
                      <span className="font-medium text-violet-900">
                        {WORLD_LABELS[shadowWorld] || shadowWorld}
                      </span>
                    </div>
                  )}
                </div>
                {signalTestResultId && (
                  <p className="text-xs text-violet-500 mt-2">
                    Ref: TestResult #{signalTestResultId}
                  </p>
                )}
              </div>
            )}

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
                    </p>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-600 space-y-1">
                <p>✓ Test: <span className="font-medium">mcmi4-mystic</span> (195 ítems)</p>
                <p>✓ Distribuido en <span className="font-medium">4 Mundos</span>:</p>
                <ul className="pl-4 mt-1 space-y-0.5 text-gray-500">
                  <li>• Atzilut (Emanativo): 49 ítems</li>
                  <li>• Briah (Creativo): 49 ítems</li>
                  <li>• Yetzirah (Formativo): 49 ítems</li>
                  <li>• Assiah (Material): 48 ítems</li>
                </ul>
                <p className="mt-2">✓ Duración estimada: <span className="font-medium">45-60 minutos</span></p>
                <p>✓ El consultante lo verá en Tests Pendientes</p>
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
                style={{ backgroundColor: '#7c3aed' }}
              >
                {loading ? 'Asignando...' : 'Confirmar Asignación (195)'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
