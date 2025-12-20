'use client';

import React from 'react';
import Link from 'next/link';
import AssignedTestsSection from '@/components/AssignedTestsSection';
import type { VisualizationState } from '@/components/BodySoulVisualization/types';
import type { ContextSectionId, IntegrativeNote } from './types';

interface RightPanelProps {
  activeSection: ContextSectionId;
  visualizationState: VisualizationState | null;
  integrativeNotes: IntegrativeNote[];
  onAddNote: (text: string) => void;
}

export default function RightPanel({
  activeSection,
  visualizationState,
  integrativeNotes,
  onAddNote,
}: RightPanelProps) {
  void visualizationState;

  return (
    <div className="space-y-4">
      {activeSection === 'overview' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Resumen</h3>
          <p className="text-xs text-gray-500">
            Espacio de observacion y presencia. Sin conclusiones automaticas.
          </p>
          <p className="text-xs text-gray-500">El terapeuta observa antes de leer.</p>
        </div>
      )}

      {activeSection === 'clinical-history' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Historia clinica</h3>
          <p className="text-xs text-gray-500">
            Contexto para observacion longitudinal.
          </p>
          <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500">
            Sin historial estructurado en este panel. Usa el perfil del paciente y las
            sesiones para ampliar contexto.
          </div>
        </div>
      )}

      {activeSection === 'bioemotional' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Bio-Emocion</h3>
          <p className="text-xs text-gray-500">
            Vista consultiva para observaciones simbolicas y relacionales.
          </p>
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
            Revisa diccionario, hipotesis y notas simbolicas.
          </div>
          <Link
            href="/dashboard/therapist/bioemotional-experiencial-profunda"
            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            Abrir workspace de Bio-Emocion
          </Link>
        </div>
      )}

      {activeSection === 'evaluations' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Evaluaciones</h3>
            <p className="text-xs text-gray-500">
              Vista en solo lectura de tests asignados. Sin metricas automaticas.
            </p>
          </div>
          <AssignedTestsSection />
        </div>
      )}

      {activeSection === 'integrative-notes' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Notas integrativas</h3>
          <p className="text-xs text-gray-500">
            Notas humanas unicamente. Sin automatizacion ni interpretacion.
          </p>
          <IntegrativeNotesForm onAddNote={onAddNote} />
          <div className="space-y-2">
            {integrativeNotes.length === 0 && (
              <p className="text-xs text-gray-500">
                No hay notas registradas.
              </p>
            )}
            {integrativeNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-md border border-gray-100 bg-gray-50 p-3 text-xs text-gray-700"
              >
                <p className="whitespace-pre-line">{note.text}</p>
                <p className="mt-2 text-[11px] text-gray-500">
                  {new Date(note.createdAt).toLocaleString('es-ES')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrativeNotesForm({ onAddNote }: { onAddNote: (text: string) => void }) {
  const [text, setText] = React.useState('');

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        placeholder="Escribe una observacion consultiva."
      />
      <button
        type="button"
        onClick={() => {
          const trimmed = text.trim();
          if (!trimmed) return;
          onAddNote(trimmed);
          setText('');
        }}
        className="px-3 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
        style={{ backgroundColor: 'var(--accent-color)' }}
      >
        Guardar nota
      </button>
    </div>
  );
}

