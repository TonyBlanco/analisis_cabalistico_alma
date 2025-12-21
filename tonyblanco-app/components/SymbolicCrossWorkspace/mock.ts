import type { SymbolicCrossDataset } from './types';

export const mockCrossDataset: SymbolicCrossDataset = {
  patientId: 'DEMO-PATIENT-001',
  events: [
    {
      date: new Date().toISOString(),
      system: 'tarot',
      symbols: ['fool', 'magician'],
      notes: 'Seleccion manual registrada',
    },
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      system: 'tree',
      symbols: ['Kether', 'Chokmah'],
    },
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      system: 'astrology',
      symbols: ['Leo', 'House 5'],
    },
  ],
  patterns: [],
  temporal: [],
  dominance: [],
  notes: 'Dataset simulado para vista observacional.',
};
