'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getActivePatient, setActivePatientId } from '@/lib/active-patient';
import { getPatientProfileSummary, PatientProfileSummary } from '@/lib/patient-api';
import PatientProfileEditor from '@/components/patient/PatientProfileEditor';

interface ActivePatientSummary {
  id: number;
  name: string | null;
}

const WORKSPACE_LABELS: Record<string, string> = {
  'astrologia-tarot': 'Astrologia Tarot',
  astrologia: 'Astrologia',
  'cabala-aplicada': 'Cabala Aplicada',
  cabala: 'Cabala',
  'bioemotional-experiencial-profunda': 'Bioemocional Experiencial',
  bioemotional: 'Bioemocional',
  'transgeneracional-profundo': 'Transgeneracional Profundo',
  scdf: 'SCDF',
  tests: 'Tests',
  patients: 'Consultantes',
};

function formatWorkspaceLabel(pathname: string | null): string {
  if (!pathname) return 'Workspace consultivo';
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  return WORKSPACE_LABELS[last] ?? 'Workspace consultivo';
}

export default function ClinicalContextHeader() {
  const pathname = usePathname();
  const [activePatient, setActivePatient] = useState<ActivePatientSummary | null>(
    null
  );
  const [profile, setProfile] = useState<PatientProfileSummary | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorFocusField, setEditorFocusField] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      const patient = getActivePatient();
      setActivePatient(patient);
      setProfile(null);
      if (patient) {
        getPatientProfileSummary(patient.id)
          .then((data) => setProfile(data))
          .catch(() => setProfile(null));
      }
    };

    load();
    window.addEventListener('activePatientChanged', load);
    window.addEventListener('storage', load);

    const openHandler = (e: Event) => {
      const ce = e as CustomEvent;
      const detail = ce.detail || {};
      const focusField = detail.focusField || null;
      const targetPatientId = detail.patientId ? Number(detail.patientId) : null;
      const ap = getActivePatient();

      // If the event targets a different patient, open that patient's page
      if (targetPatientId && ap && targetPatientId !== ap.id) {
        router.push(`/dashboard/therapist/patients/${targetPatientId}`);
        return;
      }

      setEditorFocusField(focusField);
      openEditorForActivePatient();
    };

    window.addEventListener('openPatientEditor', openHandler as EventListener);

    return () => {
      window.removeEventListener('activePatientChanged', load);
      window.removeEventListener('storage', load);
      window.removeEventListener('openPatientEditor', openHandler as EventListener);
    };
  }, []);

  const openEditorForActivePatient = async () => {
    const ap = getActivePatient();
    if (!ap) {
      // If no active patient set, go to patients management
      router.push('/dashboard/therapist/patients');
      return;
    }

    setEditorLoading(true);
    try {
      const fullProfile = await getPatientProfileSummary(ap.id);
      setProfile(fullProfile);
      setShowEditor(true);
    } catch (err) {
      console.error('Error loading patient profile for editor:', err);
      // If fetching profile fails, redirect to patients list to let user select
      router.push('/dashboard/therapist/patients');
    } finally {
      setEditorLoading(false);
    }
  };

  const handleEditorSave = async () => {
    // Refresh profile and update active patient name in storage + dispatch event
    const ap = getActivePatient();
    if (!ap) return;

    try {
      const refreshed = await getPatientProfileSummary(ap.id);
      setProfile(refreshed);
      if (refreshed && refreshed.legal_full_name) {
        setActivePatientId(ap.id, refreshed.legal_full_name);
      }
      // notify other components
      window.dispatchEvent(new Event('activePatientChanged'));
    } catch (err) {
      console.warn('Error refreshing profile after save:', err);
    } finally {
      setEditorFocusField(null);
      setShowEditor(false);
    }
  };

  const handleEditorClose = () => {
    setShowEditor(false);
  };

  const router = useRouter();

  const workspaceLabel = useMemo(
    () => formatWorkspaceLabel(pathname),
    [pathname]
  );

  const birthDateLabel = useMemo(() => {
    const birthDate = profile?.birth_date;
    if (!birthDate) return '—';
    const parsed = new Date(birthDate);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('es-ES');
  }, [profile?.birth_date]);

  return (
    <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm text-gray-700">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] uppercase tracking-wide text-gray-500">
            CONTEXTO PROFESIONAL
          </span>
          <span className="font-medium text-gray-900">{workspaceLabel}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="font-medium text-gray-900">
            {activePatient?.name || 'Consultante no seleccionado'}
          </span>
          <span>ID: {activePatient?.id ?? '—'}</span>
          <span>Fecha de nacimiento: {birthDateLabel}</span>
          {/* Quick access: if there is an active patient, open edit modal; otherwise go to Patients management */}
          <button
            onClick={() => (activePatient ? openEditorForActivePatient() : router.push('/dashboard/therapist/patients'))}
            className="ml-2 inline-flex items-center px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700 transition-colors"
            title={activePatient ? 'Editar consultante activo' : 'Ir a Gestión de Consultantes'}
          >
            {activePatient ? (editorLoading ? 'Cargando…' : 'Editar consultante') : 'Consultantes'}
          </button>

          <button
            onClick={() => {
              const ap = getActivePatient();
              const qs = ap?.id ? `?patient_id=${ap.id}` : '';
              router.push(`/dashboard/therapist/scdf${qs}`);
            }}
            className="inline-flex items-center px-2 py-1 rounded bg-gray-900 text-white text-xs hover:bg-gray-800 transition-colors"
            title="Abrir SCDF"
          >
            SCDF
          </button>

          <button
            onClick={() => {
              const ap = getActivePatient();
              const qs = ap?.id ? `?patient_id=${ap.id}` : '';
              router.push(`/dashboard/therapist/scid5${qs}`);
            }}
            className="inline-flex items-center px-2 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-700 transition-colors"
            title="Abrir SCID-5"
          >
            SCID-5
          </button>

          <button
            onClick={() => {
              const ap = getActivePatient();
              const qs = ap?.id ? `?patient_id=${ap.id}` : '';
              router.push(`/dashboard/therapist/mshe${qs}`);
            }}
            className="inline-flex items-center px-2 py-1 rounded bg-purple-600 text-white text-xs hover:bg-purple-700 transition-colors"
            title="Motor de Síntesis Holística Evaluativa"
          >
            MSHE
          </button>

          {showEditor && activePatient && (
            <PatientProfileEditor
              profile={profile ? {
                full_name: profile.full_name || null,
                legal_full_name: profile.legal_full_name || '',
                birth_date: profile.birth_date || '',
                birth_time: profile.birth_time || '' ,
                birth_city: profile.birth_city || '',
                birth_country: profile.birth_country || '',
                birth_latitude: profile.birth_latitude ?? null,
                birth_longitude: profile.birth_longitude ?? null,
                birth_timezone: profile.birth_timezone ?? null,
                biologicalSex: profile.biologicalSex,
                genderIdentity: profile.genderIdentity,
                coordinates_valid: profile.coordinates_valid,
              } : null}
              patientId={String(activePatient.id)}
              initialFocus={editorFocusField}
              onSave={handleEditorSave}
              onClose={() => { setEditorFocusField(null); handleEditorClose(); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
