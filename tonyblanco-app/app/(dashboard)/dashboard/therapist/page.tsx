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

        {/* Section 1.5: Therapist Clinical Catalog (reference only) */}
        <ClinicalCatalogSection />

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

const PRE_ANALYSIS_TESTS = [
  { name: 'PHQ-9', note: 'Disponible' },
  { name: 'GAD-7', note: 'Disponible' },
  { name: 'BAI', note: 'Disponible' },
  { name: 'SCL-90-R', note: 'Disponible' },
  { name: 'STAI', note: 'Disponible' },
  { name: 'SCID-5-RV', note: 'Requiere adaptacion clinica' },
  { name: 'Otros instrumentos de screening', note: 'Disponibles en el sistema' },
];

const CLINICAL_ANALYSES = [
  {
    name: 'Numerologia basica / completa',
    description: 'Mapa clinico cabalistico para patrones personales.',
    requiredTests: ['PHQ-9', 'GAD-7'],
    recommendedTests: ['BAI'],
    readinessNotes: 'Requiere al menos PHQ-9 y GAD-7 completados.',
  },
  {
    name: 'Tarot terapeutico',
    description: 'Analisis clinico simbolico guiado por terapeuta.',
    requiredTests: ['PHQ-9'],
    recommendedTests: ['STAI'],
    readinessNotes: 'Requiere perfil de nacimiento completo.',
  },
  {
    name: 'Astrologia cabalistica (Kerykeion)',
    description: 'Lectura clinica astrologica aplicada.',
    requiredTests: ['GAD-7'],
    recommendedTests: ['SCL-90-R'],
    readinessNotes: 'Requiere datos de nacimiento verificados.',
  },
  {
    name: 'Gematria clinica',
    description: 'Analisis numerologico cabalistico focalizado.',
    requiredTests: ['PHQ-9'],
    recommendedTests: [],
    readinessNotes: 'Requiere datos basicos del paciente.',
  },
  {
    name: 'Otros modulos cabalisticos legacy',
    description: 'Herramientas clinicas heredadas, sin cambios de logica.',
    requiredTests: [],
    recommendedTests: ['GAD-7', 'BAI'],
    readinessNotes: 'Depende del modulo seleccionado.',
  },
];

const GATE_STATUS = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
  completed: { label: 'Completado', className: 'bg-green-100 text-green-800' },
  recommended: { label: 'Recomendado', className: 'bg-blue-100 text-blue-800' },
};

function ClinicalCatalogSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Catalogo Clinico del Terapeuta</h2>
        <p className="text-sm text-gray-500">
          Mapa de capacidades clinicas. No es marketplace ni ejecuta acciones.
        </p>
      </div>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-md p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Tests Psicologicos</h3>
            <p className="text-xs text-gray-500">Pre-analisis (responde el paciente).</p>
          </div>
          <div className="space-y-2">
            {PRE_ANALYSIS_TESTS.map((test) => (
              <div key={test.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-800">{test.name}</span>
                <span className="text-xs text-gray-500">{test.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-md p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Analisis Cabalisticos</h3>
            <p className="text-xs text-gray-500">Analisis clinico (terapeuta).</p>
          </div>
          <div className="space-y-3">
            {CLINICAL_ANALYSES.map((analysis) => (
              <div key={analysis.name} className="border border-gray-100 rounded-md p-3 bg-gray-50">
                <div className="text-sm font-medium text-gray-900">{analysis.name}</div>
                <div className="text-xs text-gray-600 mt-1">{analysis.description}</div>
                <div className="text-xs text-gray-500 mt-2">{analysis.readinessNotes}</div>
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-600">Requeridos:</span>
                    {analysis.requiredTests.length === 0 && (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                    {analysis.requiredTests.map((test) => (
                      <span key={test} className="inline-flex items-center gap-1 text-xs">
                        <span className="text-gray-700">{test}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${GATE_STATUS.pending.className}`}
                        >
                          {GATE_STATUS.pending.label}
                        </span>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-600">Recomendados:</span>
                    {analysis.recommendedTests.length === 0 && (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                    {analysis.recommendedTests.map((test) => (
                      <span key={test} className="inline-flex items-center gap-1 text-xs">
                        <span className="text-gray-700">{test}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${GATE_STATUS.recommended.className}`}
                        >
                          {GATE_STATUS.recommended.label}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-md p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900">SCDF</h3>
            <p className="text-xs text-gray-500">Herramienta Clinica Central.</p>
          </div>
          <p className="text-sm text-gray-700">
            Herramienta clinica propietaria. No modificar.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Acceso desde workspace del terapeuta, con notas longitudinales y guardado de registros.
          </p>
          <div className="mt-3 rounded-md border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-600">
              Puerta clinica (informativa): requiere minimo 2 screenings completados y 1 analisis
              cabalistico previo.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Estado actual: <span className="font-medium">Pendiente</span> (informativo).
            </p>
          </div>
        </div>
      </div>
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
