'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

export default function TherapistPatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [patient, setPatient] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [analysisRecords, setAnalysisRecords] = useState<any[]>([]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
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

    const load = async () => {
      setLoading(true);
      setErrors([]);

      const nextErrors: string[] = [];

      const patientPromise = fetchJson(`${API_URL}/therapist/patients/${patientId}/`).catch((err) => {
        nextErrors.push(`Patient fetch failed: ${err.message}`);
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
    };

    if (patientId) {
      load();
    } else {
      setErrors(['Missing patient id.']);
      setLoading(false);
    }
  }, [patientId]);

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
        <h1 className="text-xl font-semibold text-gray-900">Patient clinical view</h1>
        <p className="text-sm text-gray-600">Patient ID: {patientId}</p>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Patient info</h2>
        {patient ? (
          <div className="text-sm text-gray-700 space-y-2">
            <div>Name: {valueOrFallback(patient.full_name || patient.legal_full_name || patient.name)}</div>
            <div>Email: {valueOrFallback(patient.email)}</div>
            <div>Status: {valueOrFallback(patient.therapy_status || patient.status)}</div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No patient data.</p>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Profile summary</h2>
        {profile ? (
          <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
            {safeJson(profile)}
          </pre>
        ) : (
          <p className="text-sm text-gray-600">No profile data.</p>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Test results</h2>
        {results.length === 0 ? (
          <p className="text-sm text-gray-600">No test results.</p>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.id || result.result_id} className="border border-gray-200 rounded-md p-3">
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
    </div>
  );
}

function valueOrFallback(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  return String(value);
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
