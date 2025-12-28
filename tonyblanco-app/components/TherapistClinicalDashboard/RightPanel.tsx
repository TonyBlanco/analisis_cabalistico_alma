'use client';

import React from 'react';
import Link from 'next/link';
import AssignedTestsSection from '@/components/AssignedTestsSection';
import { bodyRegions } from '@/components/BodySoulVisualization/data/bodyRegions';
import {
  sefirotBodyCorrespondences,
  sefirotDefinitions,
} from '@/components/BodySoulVisualization/data/sefirotCorrespondences';
import type { VisualizationState } from '@/components/BodySoulVisualization/types';
import type { ContextSectionId, IntegrativeNote } from './types';
import ExportHistoryList from '@/components/HolisticExportHistory/ExportHistoryList';

interface RightPanelProps {
  activeSection: ContextSectionId;
  visualizationState: VisualizationState | null;
  integrativeNotes: IntegrativeNote[];
  onAddNote: (text: string) => void;
  patientId?: string | number;
  notesLoading?: boolean;
  notesError?: string | null;
}

export default function RightPanel({
  activeSection,
  visualizationState,
  integrativeNotes,
  onAddNote,
  patientId,
  notesLoading,
  notesError,
}: RightPanelProps) {
  const normalizedPatientId =
    patientId === undefined || patientId === null || patientId === ''
      ? null
      : String(patientId);

  const selectedRegion =
    bodyRegions.find((region) => region.id === visualizationState?.selectedBodyRegionId) || null;
  const selectedSefirah =
    sefirotDefinitions.find((sefirah) => sefirah.id === visualizationState?.selectedSefirahId) ||
    null;

  const correspondences = sefirotBodyCorrespondences.filter((item) => {
    if (selectedRegion) return item.bodyRegionId === selectedRegion.id;
    if (selectedSefirah) return item.sefirahId === selectedSefirah.id;
    return false;
  });

  const showSelectionCard =
    activeSection === 'visualization' || selectedRegion !== null || selectedSefirah !== null;

  const handleCopyToNotes = () => {
    const title = selectedSefirah?.spanishName || selectedRegion?.label;
    const description = selectedSefirah?.description || selectedRegion?.description;
    if (!title) return;
    const notes = correspondences.map((item) => item.note);
    const text = [
      `Seleccion actual: ${title}`,
      description,
      notes.length > 0 ? `Correspondencias: ${notes.join(' | ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => undefined);
    }

    window.dispatchEvent(
      new CustomEvent('visualization-copy-notes', {
        detail: { text },
      }),
    );
  };

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
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
              Exports holísticos guardados (puedes abrirlos como PDF e insertarlos en notas).
            </p>
            <ExportHistoryList patientId={patientId} onAddNote={onAddNote} />
          </div>
        </div>
      )}

      {showSelectionCard && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Seleccion actual</h3>
          {!selectedRegion && !selectedSefirah && (
            <p className="text-xs text-gray-500">
              Selecciona una region corporal o una sefira para ver su contexto.
            </p>
          )}
          {(selectedRegion || selectedSefirah) && (
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedSefirah ? selectedSefirah.spanishName : selectedRegion?.label}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedSefirah ? selectedSefirah.description : selectedRegion?.description}
                </p>
              </div>
              {correspondences.length > 0 && (
                <div className="rounded-md bg-gray-50 p-2 text-xs text-gray-600">
                  <p className="font-medium text-gray-700">Correspondencia simbolica</p>
                  <ul className="mt-1 space-y-1">
                    {correspondences.map((item) => (
                      <li key={`${item.sefirahId}-${item.bodyRegionId}`}>{item.note}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                type="button"
                onClick={handleCopyToNotes}
                disabled={!selectedRegion && !selectedSefirah}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Copiar y enviar a notas humanas
              </button>
            </div>
          )}
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
            <Link
              href={
                normalizedPatientId
                  ? `/dashboard/therapist/tests?patient_id=${encodeURIComponent(normalizedPatientId)}`
                  : '/dashboard/therapist/tests'
              }
              className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Abrir catalogo de tests
            </Link>
          </div>
          <AssignedTestsSection patientId={normalizedPatientId} />
        </div>
      )}

      {activeSection === 'integrative-notes' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Notas integrativas</h3>
          <p className="text-xs text-gray-500">
            Notas humanas unicamente. Sin automatizacion ni interpretacion.
          </p>
          {!normalizedPatientId ? (
            <p className="text-xs text-gray-600">Selecciona un consultante para guardar notas.</p>
          ) : null}
          {notesError ? <p className="text-xs text-red-600">{notesError}</p> : null}
          {notesLoading ? <p className="text-xs text-gray-500">Cargando notas…</p> : null}
          <IntegrativeNotesForm onAddNote={onAddNote} disabled={!normalizedPatientId} />
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

function IntegrativeNotesForm({
  onAddNote,
  disabled,
}: {
  onAddNote: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = React.useState('');

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        disabled={disabled}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60"
        placeholder="Escribe una observacion consultiva."
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          const trimmed = text.trim();
          if (!trimmed) return;
          onAddNote(trimmed);
          setText('');
        }}
        className="px-3 py-2 text-xs font-medium text-white rounded-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--accent-color)' }}
      >
        Guardar nota
      </button>
    </div>
  );
}

