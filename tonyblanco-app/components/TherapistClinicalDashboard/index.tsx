'use client';

import { useCallback, useMemo, useState } from 'react';
import PatientHeader from './PatientHeader';
import ContextNav from './ContextNav';
import CenterVisual from './CenterVisual';
import RightPanel from './RightPanel';
import type { ContextSection, ContextSectionId, IntegrativeNote } from './types';
import type { VisualizationState } from '@/components/BodySoulVisualization/types';
import { usePanelManager } from '@/components/TherapistWorkspace/PanelManagerContext';

interface TherapistClinicalDashboardProps {
  onChangePatient: () => void;
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
}: TherapistClinicalDashboardProps) {
  const [activeSection, setActiveSection] = useState<ContextSectionId>('overview');
  const [visualizationState, setVisualizationState] = useState<VisualizationState | null>(null);
  const [integrativeNotes, setIntegrativeNotes] = useState<IntegrativeNote[]>([]);
  const { openPanel } = usePanelManager();

  const handleAddNote = useCallback((text: string) => {
    setIntegrativeNotes((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

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
          <CenterVisual onStateChange={setVisualizationState} />
        </section>
        <aside className="space-y-4">
          <RightPanel
            activeSection={activeSection}
            visualizationState={visualizationState}
            integrativeNotes={integrativeNotes}
            onAddNote={handleAddNote}
          />
        </aside>
      </div>
    </div>
  );
}
