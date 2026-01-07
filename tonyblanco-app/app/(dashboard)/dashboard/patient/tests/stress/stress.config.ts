export type StressQuestion = {
  id: string;
  dimension: 'A' | 'B' | 'C';
  text: string;
};

export const stressDefinition = {
  code: 'stress',
  name: 'Estrés — Carga y regulación',
  purpose: 'Wellness orientativo (no diagnóstico) para explorar carga de estrés, regulación y recursos',
  estimated_time_minutes: '6–8',
  scale: {
    labels: {
      '0': 'Nunca',
      '1': 'Rara vez',
      '2': 'A veces',
      '3': 'A menudo',
      '4': 'Casi siempre',
    } as Record<string, string>,
  },
  questions: [
    // A) Carga y presión
    {
      id: 'stress-a1',
      dimension: 'A',
      text: 'He sentido que las demandas superaban mis recursos.',
    },
    {
      id: 'stress-a2',
      dimension: 'A',
      text: 'Me he sentido bajo/a presión constante.',
    },
    {
      id: 'stress-a3',
      dimension: 'A',
      text: 'He tenido dificultad para desconectar mentalmente.',
    },
    {
      id: 'stress-a4',
      dimension: 'A',
      text: 'He sentido urgencia o prisa la mayor parte del tiempo.',
    },
    {
      id: 'stress-a5',
      dimension: 'A',
      text: 'Me he sentido abrumado/a por responsabilidades.',
    },
    {
      id: 'stress-a6',
      dimension: 'A',
      text: 'He sentido pérdida de control sobre mi ritmo diario.',
    },
    // B) Respuesta física y emocional
    {
      id: 'stress-b1',
      dimension: 'B',
      text: 'He notado tensión física (mandíbula, cuello, espalda).',
    },
    {
      id: 'stress-b2',
      dimension: 'B',
      text: 'He tenido síntomas físicos relacionados con el estrés.',
    },
    {
      id: 'stress-b3',
      dimension: 'B',
      text: 'He estado irritable o con cambios bruscos de humor.',
    },
    {
      id: 'stress-b4',
      dimension: 'B',
      text: 'Me he sentido agotado/a emocionalmente.',
    },
    {
      id: 'stress-b5',
      dimension: 'B',
      text: 'He tenido dificultad para relajarme.',
    },
    {
      id: 'stress-b6',
      dimension: 'B',
      text: 'He estado más reactivo/a de lo habitual.',
    },
    // C) Regulación y recursos (invertidos)
    {
      id: 'stress-c1',
      dimension: 'C',
      text: 'He contado con estrategias que me ayudan a regular el estrés.',
    },
    {
      id: 'stress-c2',
      dimension: 'C',
      text: 'He podido pedir apoyo cuando lo he necesitado.',
    },
    {
      id: 'stress-c3',
      dimension: 'C',
      text: 'He tenido espacios reales de descanso.',
    },
    {
      id: 'stress-c4',
      dimension: 'C',
      text: 'He podido poner límites a las demandas.',
    },
    {
      id: 'stress-c5',
      dimension: 'C',
      text: 'He tenido momentos de calma durante el día.',
    },
    {
      id: 'stress-c6',
      dimension: 'C',
      text: 'He sentido que me recuperaba adecuadamente.',
    },
  ] as StressQuestion[],
} as const;
