import { useCallback, useMemo, useState } from 'react';
import type {
  BodyViewSide,
  TherapistNote,
  VisualizationLayerId,
  VisualizationState,
} from '../types';

const createNoteId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useVisualizationLayers = () => {
  const [state, setState] = useState<VisualizationState>({
    activeLayers: [],
    selectedSefirahId: null,
    selectedBodyRegionId: null,
    side: 'front',
    notes: [],
  });

  const toggleLayer = useCallback((layer: VisualizationLayerId) => {
    setState((prev) => {
      const activeLayers = prev.activeLayers.includes(layer)
        ? prev.activeLayers.filter((item) => item !== layer)
        : [...prev.activeLayers, layer];
      return { ...prev, activeLayers };
    });
  }, []);

  const setSide = useCallback((side: BodyViewSide) => {
    setState((prev) => ({ ...prev, side }));
  }, []);

  const selectSefirah = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedSefirahId: id,
      selectedBodyRegionId: id ? null : prev.selectedBodyRegionId,
    }));
  }, []);

  const selectBodyRegion = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedBodyRegionId: id,
      selectedSefirahId: id ? null : prev.selectedSefirahId,
    }));
  }, []);

  const getNoteForTarget = useCallback(
    (targetType: TherapistNote['targetType'], targetId: string) =>
      state.notes.find((note) => note.targetType === targetType && note.targetId === targetId),
    [state.notes],
  );

  const upsertNote = useCallback(
    (targetType: TherapistNote['targetType'], targetId: string, text: string, status: TherapistNote['status']) => {
      setState((prev) => {
        const now = new Date().toISOString();
        const existingIndex = prev.notes.findIndex(
          (note) => note.targetType === targetType && note.targetId === targetId,
        );
        if (existingIndex >= 0) {
          const nextNotes = [...prev.notes];
          const existing = nextNotes[existingIndex];
          nextNotes[existingIndex] = {
            ...existing,
            text,
            status,
            updatedAt: now,
          };
          return { ...prev, notes: nextNotes };
        }
        const nextNote: TherapistNote = {
          id: createNoteId(),
          targetType,
          targetId,
          text,
          status,
          createdAt: now,
          updatedAt: now,
        };
        return { ...prev, notes: [...prev.notes, nextNote] };
      });
    },
    [],
  );

  const derived = useMemo(
    () => ({
      hasLayer: (layer: VisualizationLayerId) => state.activeLayers.includes(layer),
      showBody: state.activeLayers.includes('body') || state.activeLayers.includes('integrated'),
      showSefirot:
        state.activeLayers.includes('sefirot') || state.activeLayers.includes('integrated'),
    }),
    [state.activeLayers],
  );

  return {
    state,
    derived,
    toggleLayer,
    setSide,
    selectSefirah,
    selectBodyRegion,
    getNoteForTarget,
    upsertNote,
  };
};
