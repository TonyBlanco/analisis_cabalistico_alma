'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PatientProfileView from '@/components/patient/PatientProfileView';
import PatientProfileEditor from '@/components/patient/PatientProfileEditor';
import CreateWorkspaceButton from '@/components/CreateWorkspaceButton';
import dynamic from 'next/dynamic'
import { getActivePatient, setActivePatientId } from '@/lib/active-patient';
import AssignMCMI4Modal from '@/components/AssignMCMI4Modal';
import AssignMCMI4MysticModal from '@/components/AssignMCMI4MysticModal';
import AssignBioEmotionalModal from '@/components/AssignBioEmotionalModal';
import DataCleanupPanel from '@/components/therapist/DataCleanupPanel';

import { getApiBaseUrl } from '@/lib/api-base';
import { getAuthToken } from '@/lib/api';

const KabbalahPanel = dynamic(() => import('@/components/therapist/KabbalahPanel'), { ssr: false })

const API_URL = getApiBaseUrl();

export default function TherapistPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [patient, setPatient] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [analysisRecords, setAnalysisRecords] = useState<any[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAssignMysticModal, setShowAssignMysticModal] = useState(false);
  const [showAssignBioEmotionalModal, setShowAssignBioEmotionalModal] = useState(false);

  // Detect if patient has completed SIGNAL
  const signalResult = useMemo(() => {
    return results.find((r: any) => 
      r.test_module?.code === 'mcmi4-signal' || 
      r.test_code === 'mcmi4-signal'
    );
  }, [results]);

  const hasCompletedSignal = !!signalResult;

  useEffect(() => {
    if (!patientId) {
      setErrors(['Missing patient id.']);
      setLoading(false);
      return;
    }

    // Guard: this route is numeric-only. Prevent accidental navigation to
    // /dashboard/therapist/patients/create (or other non-numeric segments).
    if (!isNumericId(patientId)) {
      router.replace('/dashboard/therapist/patients');
      return;
    }

    if (patientId) {
      loadData();
    }
  }, [patientId, router]);

  const loadData = async () => {
    const token = getAuthToken();
    if (!token) {
      setErrors(['No auth token found.']);
      setLoading(false);
      return;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    };

    const fetchJson = async (url: string) => {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = errorBody.detail || errorBody.message || `Request failed (${response.status}).`;
        throw new Error(message);
      }
      return response.json();
    };

    setLoading(true);
    setErrors([]);

    const nextErrors: string[] = [];

    const patientPromise = fetchJson(`${API_URL}/therapist/patients/${patientId}/`).catch((err) => {
      nextErrors.push(`Error al cargar consultante: ${err.message}`);
      return null;
    });
    const profilePromise = fetchJson(`${API_URL}/therapist/patients/${patientId}/profile/`).catch((err) => {
      nextErrors.push(`Profile fetch failed: ${err.message}`);
      return null;
    });
    const resultsPromise = fetchJson(`${API_URL}/tests/results/?patient_id=${encodeURIComponent(patientId)}`).catch((err) => {
      nextErrors.push(`Test results fetch failed: ${err.message}`);
      return [];
    });
    const analysisPromise = fetchJson(`${API_URL}/analysis-records/?patient_id=${encodeURIComponent(patientId)}`).catch((err) => {
      nextErrors.push(`Analysis records fetch failed: ${err.message}`);
      return [];
    });

    const [patientData, profileData, resultsData, analysisData] = await Promise.all([
      patientPromise,
      profilePromise,
      resultsPromise,
      analysisPromise,
    ]);

    setPatient(patientData);
    setProfile(profileData);
    setResults(Array.isArray(resultsData) ? resultsData : (resultsData?.results || []));
    setAnalysisRecords(Array.isArray(analysisData) ? analysisData : (analysisData?.results || []));
    setErrors(nextErrors);
    setLoading(false);

    // Sync: if this route successfully loads a consultante but global context is empty/incomplete,
    // inject it so the header and Astrology guard unlock automatically.
    const numericPatientId = Number(patientId);
    if (!Number.isNaN(numericPatientId)) {
      const active = getActivePatient();
      const patientName =
        profileData?.legal_full_name ||
        profileData?.full_name ||
        patientData?.legal_full_name ||
        patientData?.full_name ||
        patientData?.name ||
        null;

      const shouldInject =
        !active ||
        active.id !== numericPatientId ||
        (patientName && !active.name);

      if (shouldInject) {
        setActivePatientId(numericPatientId, patientName);
        window.dispatchEvent(new Event('activePatientChanged'));
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600">Loading patient...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-xl font-semibold text-gray-900">Vista clínica del consultante</h1>
        <p className="text-sm text-gray-600">ID consultante: {patientId}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/therapist/tarot?patient=${encodeURIComponent(patientId)}`}
            className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Abrir Tarot en workspace simbólico
          </Link>
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Asignar SIGNAL (16 ítems)
          </button>
          <button
            onClick={() => setShowAssignBioEmotionalModal(true)}
            className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            Asignar Bio-Emocional (22)
          </button>
          {/* Show 195 assignment only if SIGNAL completed */}
          {hasCompletedSignal && (
            <button
              onClick={() => setShowAssignMysticModal(true)}
              className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#7c3aed' }}
            >
              Asignar MCMI-4 Místico (195)
            </button>
          )}
        </div>
        {/* Signal Status Indicator */}
        {hasCompletedSignal && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            <p className="text-sm text-green-700">
              ✓ SIGNAL completado — puede asignar MCMI-4 Místico (195 ítems)
            </p>
          </div>
        )}
      </div>


      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">Some data could not be loaded:</p>
          <ul className="text-sm text-red-700 list-disc pl-5 mt-2">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Información del consultante</h2>
        {patient ? (
          <div className="text-sm text-gray-700 space-y-2">
            <div>Nombre: {valueOrFallback(patient.full_name || patient.legal_full_name || patient.name)}</div>
            <div>Email: {valueOrFallback(patient.email)}</div>
            <div>Estado: {valueOrFallback(patient.therapy_status || patient.status)}</div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No patient data.</p>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Profile summary</h2>
        <PatientProfileView
          profile={profile}
          onEdit={() => setShowEditor(true)}
          canEdit={true}
        />
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Test results</h2>
        {results.length === 0 ? (
          <p className="text-sm text-gray-600">No test results.</p>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.id || result.result_id} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">
                      {valueOrFallback(
                        result.test_module?.name || result.test_module_name || result.test_name || result.test_module?.code || result.test_code
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {valueOrFallback(result.id || result.result_id)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Date: {valueOrFallback(result.completed_at || result.created_at || result.updated_at)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Code: {valueOrFallback(result.test_module?.code || result.test_code)}
                    </div>
                  </div>

                  {/* Create Workspace Button (only for mcmi4-signal) */}
                  <CreateWorkspaceButton
                    testResultId={result.id || result.result_id}
                    testModuleCode={result.test_module?.code || result.test_code || ''}
                    subjectUserId={result.user_id || result.subject_user_id || patient?.user?.id || patient?.user || 0}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Analysis records</h2>
        {analysisRecords.length === 0 ? (
          <p className="text-sm text-gray-600">No analysis records.</p>
        ) : (
          <div className="space-y-3">
            {analysisRecords.map((record) => (
              <div key={record.id || record.uuid} className="border border-gray-200 rounded-md p-3">
                <div className="text-sm text-gray-900">
                  {valueOrFallback(record.analysis_type || record.type || record.name)}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {valueOrFallback(record.id || record.uuid)}
                </div>
                <div className="text-xs text-gray-500">
                  Date: {valueOrFallback(record.created_at || record.updated_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Kabbalah Interpretation (PoC)</h2>
        <KabbalahPanel patientId={patientId} />
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Utilidades — Limpieza de Datos</h2>
        <p className="text-sm text-gray-600 mb-4">
          Limpia datos de tests anteriores para poder ejecutar nuevos tests con este consultante.
          Útil cuando necesitas repetir tests o limpiar datos de pruebas.
        </p>
        <DataCleanupPanel patientId={patientId} />
      </section>

      {showEditor && (
        <PatientProfileEditor
          profile={profile}
          patientId={patientId}
          onSave={loadData}
          onClose={() => setShowEditor(false)}
        />
      )}

      <AssignMCMI4Modal
        open={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          loadData(); // Refresh results after assignment
        }}
        patientId={Number(patientId)}
        patientName={patient?.full_name || patient?.legal_full_name || patient?.name || 'Consultante'}
        patientUserId={patient?.user?.id || patient?.user || null}
      />

      <AssignMCMI4MysticModal
        open={showAssignMysticModal}
        onClose={() => {
          setShowAssignMysticModal(false);
          loadData(); // Refresh results after assignment
        }}
        patientId={Number(patientId)}
        patientName={patient?.full_name || patient?.legal_full_name || patient?.name || 'Consultante'}
        patientUserId={patient?.user?.id || patient?.user || null}
        dominantWorld={signalResult?.result_data?.structured_data?.dominant_axis || null}
        shadowWorld={signalResult?.result_data?.structured_data?.weakest_axis || null}
        signalTestResultId={signalResult?.id || null}
      />

      {showAssignBioEmotionalModal && patient?.user && (
        <AssignBioEmotionalModal
          patientId={Number(patientId)}
          patientUserId={patient.user?.id || patient.user}
          patientName={patient?.full_name || patient?.legal_full_name || patient?.name || 'Consultante'}
          onClose={() => setShowAssignBioEmotionalModal(false)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}

function valueOrFallback(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  return String(value);
}

function isNumericId(value: string): boolean {
  return /^\d+$/.test(value);
}
