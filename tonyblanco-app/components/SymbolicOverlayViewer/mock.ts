import type { SymbolicOverlayData } from './types';

export const mockOverlayData: SymbolicOverlayData = {
  patientContext: {
    patientId: 'DEMO-PATIENT-001',
    patientName: 'Paciente Demo',
  },
  events: [
    {
      patientId: 'DEMO-PATIENT-001',
      date: new Date().toISOString(),
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
      date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
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
          date: new Date().toISOString(),
          system: 'tarot',
          symbols: ['fool', 'Kether'],
        },
      ],
    },
  ],
};
