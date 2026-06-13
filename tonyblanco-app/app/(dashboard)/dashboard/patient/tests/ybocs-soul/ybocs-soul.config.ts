export type YbocsSoulQuestion = {
  id: string;
  group: 'obsesiones' | 'compulsiones';
  text: string;
  scale: Record<number, string>;
};

export const ybocsSoulDefinition = {
  code: 'ybocs_soul',
  name: 'Y-BOCS-Soul — Sanctuario del Balance Ietzirático',
  purpose: 'Exploración simbólica del equilibrio entre Gevurah y Chesed en pensamientos y rituales',
  estimated_time_minutes: 7,
  disclaimer: 'Exploración simbólica no clínica. No sustituye diagnóstico médico.',
  questions: [
    // Obsesiones
    {
      id: 'q1',
      group: 'obsesiones' as const,
      text: '¿Cuánto tiempo al día ocupan los pensamientos repetitivos o intrusivos (ecos del alma)?',
      scale: {
        0: 'Ninguno',
        1: 'Leve — menos de 1 hora al día',
        2: 'Moderado — 1 a 3 horas al día',
        3: 'Severo — 3 a 8 horas al día',
        4: 'Extremo — más de 8 horas al día',
      },
    },
    {
      id: 'q2',
      group: 'obsesiones' as const,
      text: '¿En qué medida estos pensamientos interfieren con tu vida diaria, trabajo o relaciones?',
      scale: {
        0: 'Sin interferencia',
        1: 'Leve — pequeña interferencia',
        2: 'Moderada — notable pero funciono',
        3: 'Severa — interfiere significativamente',
        4: 'Extrema — incapacitante',
      },
    },
    {
      id: 'q3',
      group: 'obsesiones' as const,
      text: '¿Cuánto malestar te generan estos pensamientos si intentas ignorarlos o interrumpirlos?',
      scale: {
        0: 'Sin malestar',
        1: 'Leve — mínimo malestar',
        2: 'Moderado — perturbador pero manejable',
        3: 'Severo — muy intenso',
        4: 'Extremo — prácticamente incapacitante',
      },
    },
    {
      id: 'q4',
      group: 'obsesiones' as const,
      text: '¿En qué medida puedes resistir estos pensamientos y evitar que te arrastren?',
      scale: {
        0: 'Resistencia completa — siempre lo logro',
        1: 'Resistencia alta — casi siempre resisto',
        2: 'Resistencia moderada — a veces resisto',
        3: 'Resistencia baja — rara vez resisto',
        4: 'Sin resistencia — cedo completamente',
      },
    },
    {
      id: 'q5',
      group: 'obsesiones' as const,
      text: '¿Cuánto control tienes sobre estos pensamientos cuando aparecen?',
      scale: {
        0: 'Control completo',
        1: 'Control alto — los desvío con esfuerzo',
        2: 'Control moderado — a veces los desvío',
        3: 'Control bajo — raramente los desvío',
        4: 'Sin control — totalmente incontrolables',
      },
    },
    // Compulsiones
    {
      id: 'q6',
      group: 'compulsiones' as const,
      text: '¿Cuánto tiempo al día dedicas a rituales o conductas repetitivas que sientes que debes realizar?',
      scale: {
        0: 'Ninguno',
        1: 'Leve — menos de 1 hora al día',
        2: 'Moderado — 1 a 3 horas al día',
        3: 'Severo — 3 a 8 horas al día',
        4: 'Extremo — más de 8 horas al día',
      },
    },
    {
      id: 'q7',
      group: 'compulsiones' as const,
      text: '¿En qué medida estos rituales interfieren con tu vida diaria, trabajo o relaciones?',
      scale: {
        0: 'Sin interferencia',
        1: 'Leve — pequeña interferencia',
        2: 'Moderada — notable pero funciono',
        3: 'Severa — interfiere significativamente',
        4: 'Extrema — incapacitante',
      },
    },
    {
      id: 'q8',
      group: 'compulsiones' as const,
      text: '¿Cuánto malestar sientes si no puedes realizar estos rituales o se ven interrumpidos?',
      scale: {
        0: 'Sin malestar',
        1: 'Leve — mínimo malestar',
        2: 'Moderado — perturbador pero manejable',
        3: 'Severo — muy intenso',
        4: 'Extremo — prácticamente incapacitante',
      },
    },
    {
      id: 'q9',
      group: 'compulsiones' as const,
      text: '¿En qué medida puedes resistir el impulso de realizar estos rituales?',
      scale: {
        0: 'Resistencia completa — siempre lo logro',
        1: 'Resistencia alta — casi siempre resisto',
        2: 'Resistencia moderada — a veces resisto',
        3: 'Resistencia baja — rara vez resisto',
        4: 'Sin resistencia — cedo completamente',
      },
    },
    {
      id: 'q10',
      group: 'compulsiones' as const,
      text: '¿Cuánto control tienes sobre los rituales? ¿Puedes posponerlos o modificarlos?',
      scale: {
        0: 'Control completo',
        1: 'Control alto — los modifico con esfuerzo',
        2: 'Control moderado — a veces los pospongo',
        3: 'Control bajo — raramente los modifico',
        4: 'Sin control — totalmente incontrolables',
      },
    },
  ] satisfies YbocsSoulQuestion[],
};
