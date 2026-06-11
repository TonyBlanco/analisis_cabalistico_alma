'use client';

import { useRouter } from 'next/navigation';

interface ProfileCompletionModalProps {
  open: boolean;
  onClose: () => void;
  missingFields?: string[];
  /** Whose profile is incomplete — defaults to logged-in user (personal/self-serve). */
  subject?: 'self' | 'patient';
  patientId?: number | null;
  patientName?: string | null;
}

/**
 * Profile Completion Modal Component
 * 
 * Shows when user tries to execute analysis but profile is incomplete.
 * Blocks action and prompts user to complete profile.
 */
export default function ProfileCompletionModal({
  open,
  onClose,
  missingFields = [],
  subject = 'self',
  patientId = null,
  patientName = null,
}: ProfileCompletionModalProps) {
  const router = useRouter();

  if (!open) return null;

  const isPatient = subject === 'patient';
  const displayName = patientName?.trim() || 'el consultante';

  const handleGoToProfile = () => {
    if (isPatient && patientId) {
      router.push(`/dashboard/therapist/patients/${patientId}`);
    } else {
      router.push('/dashboard/profile');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isPatient ? 'Datos del consultante requeridos' : 'Información personal requerida'}
            </h2>
            <p className="text-sm text-gray-600">
              {isPatient
                ? `Antes de continuar, completa la información de nacimiento de ${displayName}. Los análisis clínicos usan los datos del consultante, no los del terapeuta.`
                : 'Antes de continuar, necesitamos completar tu información personal para garantizar la precisión del análisis.'}
            </p>
          </div>

          {/* Missing Fields List (if provided) */}
          {missingFields.length > 0 && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Información faltante:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                {missingFields.map((field, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info Message */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              Los análisis astrológicos y cabalísticos requieren información precisa de nacimiento para garantizar resultados confiables.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGoToProfile}
              className="px-6 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {isPatient ? 'Completar datos del consultante' : 'Completar perfil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
