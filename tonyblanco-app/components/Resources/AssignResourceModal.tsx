'use client';

import { useState, useEffect } from 'react';
import { Patient, getTherapistPatients } from '@/lib/patient-api';
import { getActivePatient } from '@/lib/active-patient';

interface AssignResourceModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (patientId: number, notes: string) => void;
  resourceTitle: string;
}

/**
 * AssignResourceModal Component
 * 
 * Modal for therapist to assign a resource to a patient.
 * Includes patient selection and optional notes field.
 */
export default function AssignResourceModal({
  open,
  onClose,
  onConfirm,
  resourceTitle,
}: AssignResourceModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchPatients();
      // Try to pre-select active patient
      const activePatient = getActivePatient();
      if (activePatient) {
        setSelectedPatientId(activePatient.id);
      }
    } else {
      // Reset form when modal closes
      setSelectedPatientId(null);
      setNotes('');
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

  const handleConfirm = () => {
    if (!selectedPatientId) {
      setError('Debes seleccionar un consultante');
      return;
    }
    onConfirm(selectedPatientId, notes);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Asignar recurso
        </h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Recurso:
          </p>
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm font-medium text-gray-900">{resourceTitle}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar consultante <span className="text-red-500">*</span>
          </label>
          {loading ? (
            <div className="border border-gray-300 rounded-md p-3 text-center">
              <p className="text-sm text-gray-500">Cargando consultantes...</p>
            </div>
          ) : error ? (
            <div className="border border-red-300 bg-red-50 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="border border-gray-300 rounded-md p-3 text-center">
              <p className="text-sm text-gray-500">No hay consultantes disponibles</p>
            </div>
          ) : (
            <select
              value={selectedPatientId || ''}
              onChange={(e) => setSelectedPatientId(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">-- Selecciona un consultante --</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Añade notas o instrucciones para el consultante..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPatientId || loading}
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
}
