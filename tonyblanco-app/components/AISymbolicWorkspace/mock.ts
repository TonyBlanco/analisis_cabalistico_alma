import type { AISymbolicContext, SymbolicCrossAnalysis } from './types';

export const mockContext: AISymbolicContext = {
  patientId: 'DEMO-PATIENT-001',
  timestamp: new Date().toISOString(),
  system: 'thoth',
  timeline: [
    {
      patientId: 'DEMO-PATIENT-001',
      date: new Date().toISOString(),
      workspace: 'tarot',
      system: 'thoth',
      symbols: {
        cards: ['fool', 'magician'],
        letters: ['Aleph', 'Beth'],
        sefirot: ['Kether', 'Chokmah'],
        paths: ['Kether-Chokmah'],
      },
      source: 'manual',
    },
  ],
  cards: [
    { id: 'fool', name: 'The Fool', number: 0, system: 'thoth' },
    { id: 'magician', name: 'The Magician', number: 1, system: 'thoth' },
  ],
  letters: [{ name: 'Aleph', gematria: 1 }],
  sefirot: [
    { id: 'Kether', name: 'Kether' },
    { id: 'Chokmah', name: 'Chokmah' },
  ],
  paths: [{ label: 'Kether-Chokmah', from: 'Kether', to: 'Chokmah' }],
  intent: 'exploratorio',
  notes: 'Explorar patrones simbolicos relevantes.',
};

export const mockCrossAnalysis: SymbolicCrossAnalysis = {
  systems: ['thoth', 'golden-dawn'],
  cards: [
    { id: 'fool', name: 'The Fool', number: 0, system: 'thoth' },
    { id: 'magician', name: 'The Magician', number: 1, system: 'thoth' },
  ],
  letters: [{ name: 'Aleph', gematria: 1 }],
  sefirot: [{ id: 'Kether', name: 'Kether' }],
  paths: [{ label: 'Kether-Chokmah' }],
  timeline: mockContext.timeline,
  intent: 'exploratorio',
};
