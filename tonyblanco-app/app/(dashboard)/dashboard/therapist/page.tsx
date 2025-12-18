'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchSession } from '@/lib/session';
import { getUserRole } from '@/lib/getUserRole';
import { useRouter } from 'next/navigation';
import ActivePatientIndicator from '@/components/ActivePatientIndicator';
import PatientPicker from '@/components/PatientPicker';
import AssignedTestsSection from '@/components/AssignedTestsSection';
import ClinicalEvaluationsSection from '@/components/ClinicalEvaluationsSection';
import PatientResultsSection from '@/components/PatientResultsSection';
import { Patient } from '@/lib/patient-api';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

export default function TherapistDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [role, setRole] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [analysisRefreshKey, setAnalysisRefreshKey] = useState(0);

  useEffect(() => {
    fetchSession().then((session) => {
      if (session.user) {
        setUserName(session.user.username || '');
      }
    });
    getUserRole().then((userRole) => {
      setRole(userRole);
      // STRICT: Only therapist and admin (for simulation) can access
      // Admin can simulate, but should NOT see admin-specific options
      if (userRole && userRole !== 'therapist' && userRole !== 'admin') {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  const isAdmin = role === 'admin';

  const handleSelectPatient = () => {
    setPickerOpen(true);
  };

  const handlePatientSelected = (patient: Patient) => {
    // Patient is already set in PatientPicker via setActivePatientId
    // Just close the picker - ActivePatientIndicator will update via event listener
    console.log('Patient selected:', patient);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Workspace Clínico
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Panel profesional del terapeuta</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span
              className="px-3 py-1.5 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              Rol activo: Terapeuta
            </span>
            {isAdmin && (
              <span className="text-xs text-gray-500 italic">
                Vista simulada (Admin)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Active Patient Indicator */}
      <ActivePatientIndicator onSelectPatient={handleSelectPatient} />

      {/* Patient Picker Modal */}
      <PatientPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePatientSelected}
      />

      {/* Main Workspace - Patient Context Only */}
      <div className="space-y-6">
        {/* Section 1: Assigned Tests (patient_self) */}
        {/* Shows tests assigned to active patient with status: pending / completed */}
        <AssignedTestsSection />

        {/* Section 2: Therapist Clinical Actions */}
        <TherapistClinicalActions
          onSuccess={() => setAnalysisRefreshKey((prev) => prev + 1)}
        />

        {/* Section 2: Clinical Evaluations (therapist_clinical) */}
        {/* Run SCDF, Run Integrative Interview, Results are READ-ONLY after save */}
        <ClinicalEvaluationsSection key={`clinical-evals-${analysisRefreshKey}`} />

        {/* Section 3: Results Panel */}
        {/* List results per patient, expandable detail view, clear separation between test types */}
        <PatientResultsSection />
      </div>

      {/* Footer - Removed for cleaner UI */}
    </div>
  );
}

function TherapistClinicalActions({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [activePatientName, setActivePatientName] = useState<string | null>(null);
  const [patientProfile, setPatientProfile] = useState<any | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const syncActivePatient = () => {
      const id = getActivePatientId();
      const name = getActivePatientName();
      setActivePatientId(id);
      setActivePatientName(name);
    };

    syncActivePatient();

    const handleChange = () => syncActivePatient();
    window.addEventListener('activePatientChanged', handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
      window.removeEventListener('activePatientChanged', handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  useEffect(() => {
    if (!activePatientId) {
      setPatientProfile(null);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setPatientProfile(null);
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/therapist/patients/${activePatientId}/profile/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        });
        if (!response.ok) {
          setPatientProfile(null);
          return;
        }
        const data = await response.json();
        setPatientProfile(data);
      } catch {
        setPatientProfile(null);
      }
    };

    loadProfile();
  }, [activePatientId]);

  const actions = useMemo(
    () => [
      { key: 'tarot', label: 'Ejecutar Tarot Terapéutico', endpoint: 'tarot-analysis' },
      { key: 'astrology', label: 'Ejecutar Astrología Cabalística', endpoint: 'astrology-kerykeion' },
      { key: 'gematria', label: 'Ejecutar Gematría Clínica', endpoint: 'gematria-analysis' },
    ],
    []
  );

  const buildPayload = () => {
    if (!patientProfile) return {};
    return {
      profile_snapshot: {
        legal_full_name: patientProfile.legal_full_name,
        birth_date: patientProfile.birth_date,
        birth_time: patientProfile.birth_time,
        birth_city: patientProfile.birth_city,
        birth_country: patientProfile.birth_country,
      },
    };
  };

  const handleExecute = async (action: { key: string; endpoint: string }) => {
    if (!activePatientId) {
      setMessage({ type: 'error', text: 'Selecciona un paciente activo para ejecutar la acción.' });
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setMessage({ type: 'error', text: 'Sesión no válida. Vuelve a iniciar sesión.' });
      return;
    }

    setLoadingAction(action.key);
    setMessage(null);

    try {
      const payload = buildPayload();
      const response = await fetch(
        `${API_URL}/therapist/patients/${activePatientId}/${action.endpoint}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('No se pudo ejecutar la acción clínica.');
      }

      setMessage({ type: 'success', text: 'Análisis generado y guardado.' });
      onSuccess();
    } catch {
      setMessage({ type: 'error', text: 'No se pudo ejecutar la acción clínica.' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Acciones Clínicas del Terapeuta</h2>
        <p className="text-sm text-gray-500">
          Acciones clínicas exclusivas del terapeuta (análisis sin cuestionarios).
        </p>
        {activePatientName && (
          <p className="text-sm text-gray-500 mt-1">
            Paciente activo: <span className="font-medium">{activePatientName}</span>
          </p>
        )}
      </div>

      {message && (
        <div
          className={`mb-4 rounded-md border p-3 text-sm ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        {actions.map((action) => {
          const disabled = !activePatientId || loadingAction !== null;
          const isLoading = loadingAction === action.key;

          return (
            <button
              key={action.key}
              onClick={() => handleExecute(action)}
              disabled={disabled}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {isLoading ? 'Ejecutando...' : action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
