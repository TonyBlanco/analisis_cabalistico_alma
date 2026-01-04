import { useEffect, useMemo, useState } from 'react';
import type {
  BodyRegion,
  SefirahBodyCorrespondence,
  SefirahDefinition,
  TherapistNote,
} from './types';

interface TherapistNotesPanelProps {
  selectedSefirah: SefirahDefinition | null;
  selectedBodyRegion: BodyRegion | null;
  correspondences: SefirahBodyCorrespondence[];
  getNoteForTarget: (targetType: TherapistNote['targetType'], targetId: string) => TherapistNote | undefined;
  onSaveNote: (
    targetType: TherapistNote['targetType'],
    targetId: string,
    text: string,
    status: TherapistNote['status'],
  ) => void;
}

const statusOptions: TherapistNote['status'][] = ['attention', 'observed', 'historical'];

export default function TherapistNotesPanel({
  selectedSefirah,
  selectedBodyRegion,
  correspondences,
  getNoteForTarget,
  onSaveNote,
}: TherapistNotesPanelProps) {
  const [draftText, setDraftText] = useState('');
  const [draftStatus, setDraftStatus] = useState<TherapistNote['status']>('observed');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasManualToggle, setHasManualToggle] = useState(false);

  useEffect(() => {
    if (hasManualToggle) return;
    const media = window.matchMedia('(max-width: 768px)');
    const updateCollapsed = () => setIsCollapsed(media.matches);
    updateCollapsed();
    media.addEventListener('change', updateCollapsed);
    return () => media.removeEventListener('change', updateCollapsed);
  }, [hasManualToggle]);

  useEffect(() => {
    // Removed automatic copy handler: notes must remain manual-only.
  }, []);

  const target = useMemo(() => {
    if (selectedSefirah) return { type: 'sefirah' as const, id: selectedSefirah.id };
    if (selectedBodyRegion) return { type: 'bodyRegion' as const, id: selectedBodyRegion.id };
    return null;
  }, [selectedSefirah, selectedBodyRegion]);

  const targetNote = useMemo(() => {
    if (!target) return undefined;
    return getNoteForTarget(target.type, target.id);
  }, [target, getNoteForTarget]);

  useEffect(() => {
    setDraftText(targetNote?.text || '');
    setDraftStatus(targetNote?.status || 'observed');
  }, [target?.id, target?.type, targetNote?.text, targetNote?.status]);

  const handleSave = () => {
    if (!target) return;
    const text = draftText.trim();
    if (!text) return;
    onSaveNote(target.type, target.id, text, draftStatus);
  };

  const correspondenceNotes = useMemo(() => {
    if (selectedSefirah) {
      return correspondences.filter((item) => item.sefirahId === selectedSefirah.id);
    }
    if (selectedBodyRegion) {
      return correspondences.filter((item) => item.bodyRegionId === selectedBodyRegion.id);
    }
    return [];
  }, [selectedSefirah, selectedBodyRegion, correspondences]);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Notas humanas</h3>
          <p className="text-xs text-gray-500">
            Notas manuales del terapeuta. Sin automatizacion ni interpretacion automatica.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setHasManualToggle(true);
            setIsCollapsed((prev) => !prev);
          }}
          className="text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          {isCollapsed ? 'Expandir' : 'Colapsar'}
        </button>
      </div>

      {isCollapsed && (
        <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500">
          Panel colapsado. Expande para registrar notas humanas.
        </div>
      )}

      {!isCollapsed && (
        <>
      {!target && (
        <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500">
          Selecciona una region corporal o una sefira para vincular una nota humana.
        </div>
      )}

      {target && (
        <div className="space-y-3 rounded-md border border-gray-200 p-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-500">Seleccion actual</p>
            <p className="text-sm font-medium text-gray-900">
              {selectedSefirah ? selectedSefirah.spanishName : selectedBodyRegion?.label}
            </p>
            <p className="text-xs text-gray-500">
              {selectedSefirah ? selectedSefirah.description : selectedBodyRegion?.description}
            </p>
          </div>

          {correspondenceNotes.length > 0 && (
            <div className="rounded-md bg-gray-50 p-2 text-xs text-gray-600">
              <p className="font-medium text-gray-700">Correspondencia simbolica</p>
              <ul className="mt-1 space-y-1">
                {correspondenceNotes.map((item) => (
                  <li key={`${item.sefirahId}-${item.bodyRegionId}`}>{item.note}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Nota humana</label>
            <textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y"
              placeholder="Registrar observaciones consultivas y reflexiones humanas."
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600">Estado neutral</label>
              <select
                value={draftStatus}
                onChange={(event) => setDraftStatus(event.target.value as TherapistNote['status'])}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
            >
              Guardar nota
            </button>
          </div>

          {targetNote && (
            <p className="text-[11px] text-gray-500">
              Ultima actualizacion: {new Date(targetNote.updatedAt).toLocaleString('es-ES')}
            </p>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}
