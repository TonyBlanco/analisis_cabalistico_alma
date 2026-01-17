/**
 * CreateWorkspaceForm - Form to create new MCMI-4 Workspace
 * 
 * POST /api/swm/mcmi4/create
 * Automatically starts session after creation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { swmMcmi4Api } from '@/lib/api/swm-mcmi4-api';
import { fetchPatients, type Patient } from '@/lib/api/patients-api';
import { SparklesIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

interface CreateWorkspaceFormProps {
  onSuccess?: (workspaceId: string, sessionId: string) => void;
  onCancel?: () => void;
}

export const CreateWorkspaceForm: React.FC<CreateWorkspaceFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [subjectUserId, setSubjectUserId] = useState('');
  const [mcmi4SourceDataId, setMcmi4SourceDataId] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  
  // Real patient list from backend
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    // Fetch real patients from backend
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        setError(null);
        const data = await fetchPatients(false); // Get all active patients
        console.log('[CreateWorkspaceForm] Pacientes cargados:', data.length, data);
        setPatients(data);
        if (data.length === 0) {
          setError('No se encontraron pacientes para este terapeuta. Verifica que el usuario actual sea un terapeuta con pacientes asignados.');
        }
      } catch (err: any) {
        console.error('[CreateWorkspaceForm] Error loading patients:', err);
        setError(err.message || 'Error al cargar pacientes. Verifica tu sesión.');
      } finally {
        setLoadingPatients(false);
      }
    };
    loadPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectUserId || !mcmi4SourceDataId) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create workspace
      const createResponse = await swmMcmi4Api.createWorkspace({
        subject_user_id: subjectUserId,
        mcmi4_source_data_id: mcmi4SourceDataId,
        config: {
          focus_areas: focusAreas,
        },
        metadata: {
          created_via: 'web_ui',
        },
      });

      // Start session automatically
      const sessionResponse = await swmMcmi4Api.startSession({
        workspace_id: createResponse.workspace_id,
      });

      onSuccess?.(createResponse.workspace_id, sessionResponse.session_id);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to create workspace';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleFocusArea = (area: string) => {
    setFocusAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const FOCUS_AREAS = [
    'Patrones de Personalidad',
    'Dinámicas Relacionales',
    'Procesos de Duelo',
    'Arquetipos Activos',
    'Integración Sombra',
    'Propósito de Vida',
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-3">
          <SparklesIcon className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Crear Nuevo Workspace</h2>
            <p className="text-purple-100 text-sm mt-1">
              MCMI-4 Místico - Análisis Simbólico
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Subject User Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="inline h-4 w-4 mr-1" />
            Paciente / Sujeto *
          </label>
          <select
            value={subjectUserId}
            onChange={(e) => setSubjectUserId(e.target.value)}
            required
            disabled={loadingPatients || loading || patients.length === 0}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingPatients 
                ? 'Cargando pacientes...' 
                : patients.length === 0 
                  ? 'No hay pacientes disponibles'
                  : 'Seleccionar paciente...'}
            </option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email}
                {' '}(ID: {patient.id})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {patients.length > 0 
              ? `${patients.length} paciente(s) disponible(s). Puedes crear múltiples workspaces para el mismo paciente.`
              : 'Selecciona el paciente para quien se creará el workspace'}
          </p>
        </div>

        {/* MCMI-4 Data ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DocumentTextIcon className="inline h-4 w-4 mr-1" />
            ID de Datos MCMI-4 *
          </label>
          <input
            type="text"
            value={mcmi4SourceDataId}
            onChange={(e) => setMcmi4SourceDataId(e.target.value)}
            placeholder="Ej: mcmi4_result_123"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Identificador del resultado MCMI-4 a analizar
          </p>
        </div>

        {/* Focus Areas (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Áreas de Enfoque (Opcional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FOCUS_AREAS.map(area => (
              <button
                key={area}
                type="button"
                onClick={() => toggleFocusArea(area)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${focusAreas.includes(area)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {area}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selecciona áreas para enfocar el análisis simbólico
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Creando...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Crear e Iniciar Sesión
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          El workspace se creará y la sesión iniciará automáticamente.
          Serás redirigido al cuestionario de 195 preguntas.
        </p>
      </form>
    </div>
  );
};
