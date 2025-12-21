import type { SymbolicOverlayData } from './types';

export const mockOverlayData: SymbolicOverlayData = {
  patientContext: {
    patientId: 'DEMO-PATIENT-001',
    patientName: 'Paciente Demo',
  },
  events: [
    {
      patientId: 'DEMO-PATIENT-001',
      date: '2025-12-21T22:35:32.104Z',
      workspace: 'tarot',
      system: 'thoth',
      symbols: {
        cards: ['fool', 'magician'],
        sefirot: ['Kether', 'Chokmah'],
        paths: ['Kether-Chokmah'],
      },
      source: 'manual',
    },
    {
      patientId: 'DEMO-PATIENT-001',
      date: '2025-12-21T16:12:08.512Z',
      workspace: 'tarot',
      system: 'golden-dawn',
      symbols: {
        cards: ['lovers'],
        sefirot: ['Binah', 'Tiphareth'],
      },
      source: 'manual',
    },
  ],
  patterns: [
    {
      id: 'pattern-1',
      label: 'Coincidencia simbolica: Kether',
      systems: ['tarot', 'tree', 'astrology'],
      window: '7 dias',
      evidence: [
        {
          sourceEventId: 'timeline-1',
          date: '2025-12-21T22:35:32.104Z',
          system: 'tarot',
          symbols: ['fool', 'Kether'],
        },
      ],
    },
  ],
};
