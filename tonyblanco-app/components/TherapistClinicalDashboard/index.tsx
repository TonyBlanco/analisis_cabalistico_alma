'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PatientHeader from './PatientHeader';
import ContextNav from './ContextNav';
import CenterVisual from './CenterVisual';
import RightPanel from './RightPanel';
import SendPatientNoteBlock from './SendPatientNoteBlock';
import type { ContextSection, ContextSectionId, IntegrativeNote } from './types';
import type { VisualizationState } from '@/components/BodySoulVisualization/types';
import { usePanelManager } from '@/components/TherapistWorkspace/PanelManagerContext';
import { createTherapistNote, listTherapistNotes } from '@/lib/therapist-notes-api';
import AssignMCMI4Modal from '@/components/AssignMCMI4Modal';
import AssignMCMI4MysticModal from '@/components/AssignMCMI4MysticModal';
import AssignBioEmotionalModal from '@/components/AssignBioEmotionalModal';
import { getApiBaseUrl } from '@/lib/api-base';
import { getAuthToken } from '@/lib/api';
import { getPatientDetail } from '@/lib/assignment-api';

interface TherapistClinicalDashboardProps {
  onChangePatient: () => void;
  patientId?: string | number;
  patientName?: string;
}

const contextSections: ContextSection[] = [
  {
    id: 'overview',
    label: 'Resumen',
    description: 'Contexto situacional',
  },
  {
    id: 'clinical-history',
    label: 'Historia clínica',
    description: 'Contexto longitudinal',
  },
  {
    id: 'evaluations',
    label: 'Evaluaciones',
    description: 'Tests asignados',
  },
  {
    id: 'integrative-notes',
    label: 'Notas integrativas',
    description: 'Notas humanas',
  },
];

export default function TherapistClinicalDashboard({
  onChangePatient,
  patientId,
  patientName,
}: TherapistClinicalDashboardProps) {
  const [activeSection, setActiveSection] = useState<ContextSectionId>('overview');
  const [visualizationState, setVisualizationState] = useState<VisualizationState | null>(null);
  const [integrativeNotes, setIntegrativeNotes] = useState<IntegrativeNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const { openPanel } = usePanelManager();

  // Modal states for test assignment
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAssignMysticModal, setShowAssignMysticModal] = useState(false);
  const [showAssignBioEmotionalModal, setShowAssignBioEmotionalModal] = useState(false);
  const [signalCompleted, setSignalCompleted] = useState(false);
  const [patientHasUser, setPatientHasUser] = useState<boolean | null>(null);

  const resolvedPatientId = useMemo(() => {
    if (patientId === undefined || patientId === null || patientId === '') return null;
    if (typeof patientId === 'string') {
      const parsed = parseInt(patientId, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }
    if (typeof patientId === 'number') return patientId;
    return null;
  }, [patientId]);

  useEffect(() => {
    // Fetch whether patient has linked user account (so we can enable/disable assign actions)
    let cancelled = false;
    const checkPatientUser = async () => {
      if (!resolvedPatientId) {
        setPatientHasUser(null);
        return;
      }
      try {
        const data = await getPatientDetail(resolvedPatientId);
        if (!cancelled) setPatientHasUser(!!(data && (data.user || data.user_id)));
      } catch (err) {
        if (!cancelled) setPatientHasUser(false);
      }
    };

    checkPatientUser();

    return () => {
      cancelled = true;
    };
  }, [resolvedPatientId]);

  useEffect(() => {
    if (!resolvedPatientId) {
      // Clear state when no patient - state updates handled in separate effect
      return;
    }

    let cancelled = false;
    setNotesLoading(true);
    setNotesError(null);

    listTherapistNotes(resolvedPatientId)
      .then((data) => {
        if (cancelled) return;
        setIntegrativeNotes(
          data.map((n) => ({
            id: String(n.id),
            text: [n.title, n.content].filter(Boolean).join('\n').trim(),
            createdAt: (n.created_at || new Date().toISOString()) as string,
          })),
        );
      })
      .catch((err: any) => {
        if (cancelled) return;
        setNotesError(err?.message || 'No se pudieron cargar las notas');
        setIntegrativeNotes([]);
      })
      .finally(() => {
        if (cancelled) return;
        setNotesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedPatientId]);

  // Check if SIGNAL test is completed for this patient
  useEffect(() => {
    if (!resolvedPatientId) {
      setSignalCompleted(false);
      return;
    }

    const checkSignalStatus = async () => {
      try {
        const token = getAuthToken();
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/test-assignments/?patient=${resolvedPatientId}`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const signalAssignment = data.find(
            (a: any) => a.test_module?.code === 'mcmi4_signal' && a.status === 'completed'
          );
          setSignalCompleted(!!signalAssignment);
        }
      } catch (err) {
        console.warn('Could not check SIGNAL status:', err);
      }
    };

    checkSignalStatus();
  }, [resolvedPatientId]);

  const handleAddNote = useCallback(
    (text: string) => {
      const trimmed = (text || '').trim();
      if (!trimmed || !resolvedPatientId) return;

      setNotesError(null);
      const firstLine = trimmed.split('\n')[0] || 'Nota integrativa';
      const title = firstLine.slice(0, 80);

      void createTherapistNote({
        patientId: resolvedPatientId,
        title,
        content: trimmed,
        tags: 'integrative',
      })
        .then((created) => {
          setIntegrativeNotes((prev) => [
            {
              id: String(created.id),
              text: [created.title, created.content].filter(Boolean).join('\n').trim(),
              createdAt: (created.created_at || new Date().toISOString()) as string,
            },
            ...prev,
          ]);
        })
        .catch((err: any) => {
          console.error('Error saving therapist note:', err);
          setNotesError(err?.message || 'No se pudo guardar la nota');
        });
    },
    [resolvedPatientId],
  );

  const handleViewHistory = () => {
    openPanel('history');
  };

  const handleNewSession = () => {
    setActiveSection('visualization');
  };

  const handleAddNoteShortcut = () => {
    setActiveSection('integrative-notes');
    openPanel('notes');
  };

  const navigationSections = useMemo(() => contextSections, []);

  return (
    <div className="space-y-4">
      <PatientHeader
        onAddNote={handleAddNoteShortcut}
        onNewSession={handleNewSession}
        onViewHistory={handleViewHistory}
        onChangePatient={onChangePatient}
        patientName={patientName}
      />

      {/* Assignment Actions */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Acciones de asignación</h3>
        <div className="flex flex-wrap gap-2">
          {patientHasUser === false && (
            <div className="p-3 rounded-md bg-amber-50 border border-amber-100 text-amber-800 text-sm">
              El consultante no tiene cuenta de usuario vinculada. Vincula una cuenta para asignar tests.
            </div>
          )}

          <Link
            href="/dashboard/therapist/tarot"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <span className="text-lg">🔮</span>
            Abrir Tarot en workspace simbólico
          </Link>
          <button
            onClick={() => patientHasUser ? setShowAssignModal(true) : undefined}
            disabled={patientHasUser === false}
            className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="text-lg">📋</span>
            Asignar SIGNAL (16 ítems)
          </button>
          <button
            onClick={() => patientHasUser ? setShowAssignBioEmotionalModal(true) : undefined}
            disabled={patientHasUser === false}
            className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="text-lg">🌿</span>
            Asignar Bio-Emocional (22)
          </button>
          {signalCompleted && (
            <button
              onClick={() => setShowAssignMysticModal(true)}
              className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
            >
              <span className="text-lg">✨</span>
              Asignar MCMI-4 Místico (195)
            </button>
          )}
        </div>
        {!signalCompleted && (
          <p className="mt-2 text-xs text-muted-foreground">
            💡 El paciente debe completar SIGNAL antes de poder asignar MCMI-4 Místico
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="space-y-4">
          <ContextNav
            sections={navigationSections}
            activeSection={activeSection}
            onChangeSection={setActiveSection}
          />
        </aside>
        <section className="min-h-[520px]">
          <CenterVisual
            activeSection={activeSection}
            onStateChange={setVisualizationState}
            patientId={patientId}
            onAddNote={handleAddNote}
          />
        </section>
        <aside className="space-y-4">
          <RightPanel
            activeSection={activeSection}
            visualizationState={visualizationState}
            integrativeNotes={integrativeNotes}
            onAddNote={handleAddNote}
            patientId={patientId}
            notesLoading={notesLoading}
            notesError={notesError}
          />
          <SendPatientNoteBlock patientId={patientId} />
        </aside>
      </div>

      {/* Assignment Modals */}
      {resolvedPatientId && (
        <>
          <AssignMCMI4Modal
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            patientId={resolvedPatientId}
            patientName={patientName || 'Paciente'}
          />
          <AssignMCMI4MysticModal
            isOpen={showAssignMysticModal}
            onClose={() => setShowAssignMysticModal(false)}
            patientId={resolvedPatientId}
            patientName={patientName || 'Paciente'}
          />
          <AssignBioEmotionalModal
            isOpen={showAssignBioEmotionalModal}
            onClose={() => setShowAssignBioEmotionalModal(false)}
            patientId={resolvedPatientId}
            patientName={patientName || 'Paciente'}
          />
        </>
      )}
    </div>
  );
}
