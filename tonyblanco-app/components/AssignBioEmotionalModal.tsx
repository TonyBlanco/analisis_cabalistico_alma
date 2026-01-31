'use client';

import { useState, useEffect } from 'react';
import { createAssignment, getPatientDetail } from '@/lib/assignment-api';

interface AssignBioEmotionalModalProps {
  isOpen: boolean;
  patientId: number;
  patientUserId?: number;  // Optional - will be fetched if not provided
  patientName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Modal for assigning BioEmotional Intake questionnaire to a patient.
 * 
 * Follows the same pattern as AssignMCMI4Modal but for bioemotional_intake test.
 * The patient will see this in their dashboard and can complete it.
 * Results feed into the BioEmotional Experiential Workspace evolution panel.
 * 
 * Auto-fetches patientUserId if not provided.
 */
export default function AssignBioEmotionalModal({
  isOpen,
  patientId,
  patientUserId: propPatientUserId,
  patientName,
  onClose,
  onSuccess,
}: AssignBioEmotionalModalProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resolvedUserId, setResolvedUserId] = useState<number | null>(propPatientUserId ?? null);
  const [fetchingUser, setFetchingUser] = useState(false);

  // Auto-fetch user_id when modal opens if not provided
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, patientId, propPatientUserId]);

  if (!isOpen) return null;

  const handleAssign = async () => {
    if (!resolvedUserId) {
      setError('El consultante debe tener una cuenta activa para asignar tests.');
      return;
    }

    setIsAssigning(true);
    setError(null);

    try {
      await createAssignment({
        patient_id: patientId,
        assigned_to_user_id: resolvedUserId,
        test_type: 'bioemotional_intake',
        n_questions: 22,
      });

      setSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error assigning BioEmotional intake:', err);
      setError(err instanceof Error ? err.message : 'Error al asignar cuestionario');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">
            Asignar Exploración Bio-Emocional
          </h3>
          <p className="text-sm text-white/80 mt-1">
            Cuestionario inicial de 22 preguntas
          </p>
        </div>

        <div className="p-6">
          {fetchingUser ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4 animate-pulse">🔄</div>
              <p className="text-sm text-gray-600">Obteniendo información del consultante...</p>
            </div>
          ) : success ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Asignación exitosa!
              </h4>
              <p className="text-sm text-gray-600">
                {patientName} recibirá el cuestionario en su dashboard.
              </p>
            </div>
          ) : (
            <>
              {/* Patient info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {patientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{patientName}</p>
                    <p className="text-xs text-gray-500">ID Consultante: {patientId}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-900">
                  ¿Qué incluye este cuestionario?
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span><strong>5 síntomas físicos:</strong> cabeza, digestivo, espalda, respiratorio, piel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span><strong>4 estados emocionales:</strong> miedo, culpa, desvalorización, separación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 mt-0.5">•</span>
                    <span><strong>4 contextos relacionales:</strong> familia, pareja, trabajo, límites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span><strong>4 patrones transgeneracionales:</strong> herencia, secretos, lealtades, duelos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span><strong>4 somatización:</strong> conexión cuerpo-emoción</span>
                  </li>
                </ul>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                  <strong>⏱️ Tiempo estimado:</strong> 10-15 minutos
                  <br />
                  <strong>📊 Resultados:</strong> Visibles en el panel de Evolución del workspace Bio-Emocional
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isAssigning}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssign}
                  disabled={isAssigning || !resolvedUserId}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAssigning ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Asignando...
                    </span>
                  ) : (
                    'Asignar Cuestionario'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
