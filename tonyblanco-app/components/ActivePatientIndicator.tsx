'use client';

import { useState, useEffect } from 'react';
import { getActivePatient, clearActivePatientId } from '@/lib/active-patient';

interface ActivePatientIndicatorProps {
  onSelectPatient?: () => void;
}

/**
 * Active Patient Indicator Component
 * 
 * Displays the currently active patient and provides actions to change or clear.
 * This component is read-only - it doesn't fetch patients or open modals directly.
 * Parent components should handle patient selection via onSelectPatient callback.
 */
export default function ActivePatientIndicator({ onSelectPatient }: ActivePatientIndicatorProps) {
  const [activePatient, setActivePatient] = useState<{ id: number; name: string | null } | null>(null);

  useEffect(() => {
    // Load active patient on mount and when storage changes
    const loadActivePatient = () => {
      const patient = getActivePatient();
      setActivePatient(patient);
    };

    loadActivePatient();

    // Listen for storage changes (in case patient is changed in another tab/component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'therapist_active_patient_id' || e.key === 'therapist_active_patient_name') {
        loadActivePatient();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      loadActivePatient();
    };
    window.addEventListener('activePatientChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('activePatientChanged', handleCustomStorageChange);
    };
  }, []);

  const handleClear = () => {
    clearActivePatientId();
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('activePatientChanged'));
    setActivePatient(null);
  };

  if (!activePatient) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Paciente activo</p>
            <p className="text-sm text-gray-500">Selecciona un paciente para comenzar</p>
          </div>
          {onSelectPatient && (
            <button
              onClick={onSelectPatient}
              className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity shadow-sm"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              Seleccionar paciente
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Paciente activo</p>
          <p className="text-base text-gray-900 font-semibold">
            {activePatient.name || `Paciente #${activePatient.id}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onSelectPatient && (
            <button
              onClick={onSelectPatient}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cambiar
            </button>
          )}
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
