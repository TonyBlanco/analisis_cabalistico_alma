export type UnityIntrospectionQuestion = {
  id: string;
  text: string;
};

export const unityIntrospectionDefinition = {
  code: 'dudit_spirit',
  name: 'Introspección de Unidad — Patrones de desconexión (Rúaj)',
  purpose:
    'Exploración holística orientativa sobre patrones de desconexión/escape y regulación (no diagnóstico).',
  target_population: 'personas adultas',
  estimated_time_minutes: '5–7',
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
    { id: 'q1', text: 'En el último mes, recurrí a hábitos de desconexión/escape para cambiar mi estado interno.' },
    { id: 'q2', text: 'Cuando empecé ese patrón, me costó detenerlo una vez iniciado.' },
    { id: 'q3', text: 'Sentí urgencia o impulso fuerte por repetir ese patrón.' },

    { id: 'q4', text: 'Noté efectos en mi energía, claridad o ánimo al día siguiente.' },
    { id: 'q5', text: 'Ese patrón afectó responsabilidades, vínculos o autocuidado.' },
    { id: 'q6', text: 'Después sentí culpa, vergüenza o conflicto interno.' },

    { id: 'q7', text: 'Intenté reducirlo y me resultó difícil sostener el cambio.' },
    { id: 'q8', text: 'Postergué actividades importantes por sostener ese patrón.' },
    { id: 'q9', text: 'Lo utilicé para evitar sentir emociones o pensamientos difíciles.' },

    { id: 'q10', text: 'Durante ese patrón me sentí desconectado/a de mi cuerpo o de mis señales internas.' },
    { id: 'q11', text: 'Después me costó volver a la presencia corporal (respiración, calma, descanso).' },
  ] as UnityIntrospectionQuestion[],
};
