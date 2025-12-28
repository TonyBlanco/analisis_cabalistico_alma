'use client';

import { useState, useEffect, useMemo } from 'react';
import { getTherapistPatients, Patient } from '@/lib/patient-api';
import { setActivePatientId } from '@/lib/active-patient';

interface PatientPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (patient: Patient) => void;
}

/**
 * Patient Picker Component
 * 
 * Modal/drawer that displays a list of patients assigned to the therapist.
 * Allows searching (client-side) and selecting a patient.
 * 
 * READ-ONLY: No editing or creating patients here.
 */
export default function PatientPicker({ open, onClose, onSelect }: PatientPickerProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      fetchPatients();
    } else {
      // Reset state when closed
      setSearchQuery('');
      setError(null);
    }
  }, [open]);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTherapistPatients();
      setPatients(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar consultantes';
      setError(errorMessage);
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side search filtering
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) {
      return patients;
    }

    const query = searchQuery.toLowerCase();
    return patients.filter((patient) => {
      const fullName = patient.full_name?.toLowerCase() || '';
      const firstName = patient.first_name?.toLowerCase() || '';
      const lastName = patient.last_name?.toLowerCase() || '';
      const email = patient.email?.toLowerCase() || '';

      return (
        fullName.includes(query) ||
        firstName.includes(query) ||
        lastName.includes(query) ||
        email.includes(query)
      );
    });
  }, [patients, searchQuery]);

  const handleSelectPatient = (patient: Patient) => {
    setActivePatientId(patient.id, patient.full_name);
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('activePatientChanged'));
    onSelect(patient);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Seleccionar consultante</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-offset-0 focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Cargando consultantes...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchPatients}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && filteredPatients.length === 0 && (
            <div className="text-center py-8">
                <p className="text-sm text-gray-500">
                {searchQuery ? 'No se encontraron consultantes con ese criterio de búsqueda.' : 'No hay consultantes disponibles.'}
              </p>
            </div>
          )}

          {!loading && !error && filteredPatients.length > 0 && (
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{patient.full_name || `${patient.first_name} ${patient.last_name}`}</p>
                      {patient.email && (
                        <p className="text-sm text-gray-500 mt-1">{patient.email}</p>
                      )}
                      {patient.birth_date && (
                        <p className="text-xs text-gray-400 mt-1">
                          Fecha de nacimiento: {new Date(patient.birth_date).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
