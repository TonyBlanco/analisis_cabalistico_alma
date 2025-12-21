import type { SymbolicCrossDataset } from './types';

export const mockCrossDataset: SymbolicCrossDataset = {
  patientId: 'DEMO-PATIENT-001',
  windowDays: 7,
  events: [
    {
      id: 'event-1',
      date: new Date().toISOString(),
      system: 'tarot',
      symbols: ['fool', 'magician'],
      sourceEventId: 'timeline-1',
      notes: 'Seleccion manual registrada',
    },
    {
      id: 'event-2',
      date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      system: 'tree',
      symbols: ['Kether', 'Chokmah'],
      sourceEventId: 'timeline-2',
    },
    {
      id: 'event-3',
      date: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      system: 'astrology',
      symbols: ['Leo', 'House 5'],
      sourceEventId: 'timeline-3',
    },
  ],
  patterns: [],
  temporal: [],
  dominance: [],
  notes: 'Dataset simulado para vista observacional.',
};
