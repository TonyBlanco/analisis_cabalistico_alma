export type StressRegulationQuestion = {
  id: string;
  text: string;
};

export const stressRegulationDefinition = {
  code: 'stress-regulation',
  name: 'Estrés — Carga y regulación',
  purpose:
    'Screening wellness orientativo (no diagnóstico) para explorar carga de estrés, regulación y recursos disponibles.',
  target_population: 'personas adultas',
  estimated_time_minutes: '6–8',
  scale: {
    min: 0,
    max: 4,
    labels: {
      '0': 'Nunca',
      '1': 'Rara vez',
      '2': 'A veces',
      '3': 'A menudo',
      '4': 'Casi siempre',
    } as Record<string, string>,
  },
  questions: [
    // Carga fisiológica
    { id: 'sr1', text: 'He notado tensión física (mandíbula, cuello, espalda).' },
    { id: 'sr2', text: 'He sentido el cuerpo en “alerta” o inquieto/a.' },
    { id: 'sr3', text: 'He tenido síntomas físicos asociados al estrés (dolor, molestias, fatiga).' },

    // Carga mental/emocional
    { id: 'sr4', text: 'Me he sentido sobrepasado/a por mis responsabilidades.' },
    { id: 'sr5', text: 'He tenido dificultad para desconectar mentalmente.' },
    { id: 'sr6', text: 'He estado más irritable o reactivo/a de lo habitual.' },

    // Recuperación y descanso
    { id: 'sr7', text: 'He tenido dificultad para relajarme incluso en momentos de descanso.' },
    { id: 'sr8', text: 'Mi descanso no ha sido reparador.' },
    { id: 'sr9', text: 'He tenido espacios reales de pausa o recuperación.' },

    // Regulación emocional
    { id: 'sr10', text: 'He podido regular mis emociones cuando me sentí tenso/a.' },
    { id: 'sr11', text: 'He identificado señales tempranas de estrés y pude responder a tiempo.' },
    { id: 'sr12', text: 'He podido bajar el ritmo cuando lo necesité.' },

    // Recursos personales
    { id: 'sr13', text: 'He contado con estrategias que me ayudan a regular el estrés.' },
    { id: 'sr14', text: 'He podido poner límites a las demandas.' },
    { id: 'sr15', text: 'He sentido que me recuperaba adecuadamente tras días exigentes.' },

    // Apoyo externo
    { id: 'sr16', text: 'Siento que cuento con apoyo cuando lo necesito.' },
    { id: 'sr17', text: 'Me ha costado pedir ayuda o apoyo.' },
    { id: 'sr18', text: 'He compartido con alguien de confianza cómo me he sentido.' },
  ] as StressRegulationQuestion[],
};

// Notas:
// - Este test debe ejecutarse EXCLUSIVAMENTE vía motor Wellness (sin fallback simbólico).

