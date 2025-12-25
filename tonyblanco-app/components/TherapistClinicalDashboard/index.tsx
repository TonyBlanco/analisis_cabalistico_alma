'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PatientHeader from './PatientHeader';
import ContextNav from './ContextNav';
import CenterVisual from './CenterVisual';
import RightPanel from './RightPanel';
import type { ContextSection, ContextSectionId, IntegrativeNote } from './types';
import type { VisualizationState } from '@/components/BodySoulVisualization/types';
import { usePanelManager } from '@/components/TherapistWorkspace/PanelManagerContext';
import { createTherapistNote, listTherapistNotes } from '@/lib/therapist-notes-api';

interface TherapistClinicalDashboardProps {
  onChangePatient: () => void;
  patientId?: string | number;
  patientName?: string;
}

const contextSections: ContextSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Situational awareness',
  },
  {
    id: 'clinical-history',
    label: 'Clinical history',
    description: 'Longitudinal context',
  },
  {
    id: 'bioemotional',
    label: 'Bio-Emotional',
    description: 'Symbolic observations',
  },
  {
    id: 'visualization',
    label: 'Body-Soul',
    description: 'Layered visualization',
  },
  {
    id: 'evaluations',
    label: 'Evaluations',
    description: 'Assigned tests',
  },
  {
    id: 'integrative-notes',
    label: 'Integrative notes',
    description: 'Human notes',
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
    if (!resolvedPatientId) {
      setIntegrativeNotes([]);
      setNotesError(null);
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
        </aside>
      </div>
    </div>
  );
}
