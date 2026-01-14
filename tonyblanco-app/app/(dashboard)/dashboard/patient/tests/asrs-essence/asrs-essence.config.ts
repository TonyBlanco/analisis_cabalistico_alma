export const asrsEssenceDefinition = {
  code: 'asrs_essence',
  name: 'ASRS-Essence',
  purpose: 'Exploracion del ritmo esencial y su coherencia interna',
  estimated_time_minutes: 4,
  scale: {
    min: 1,
    max: 5,
    labels: {
      1: 'Nunca',
      2: 'Rara vez',
      3: 'A veces',
      4: 'Frecuente',
      5: 'Casi siempre',
    },
  },
  questions: [
    { id: 'q1', text: 'Siento un pulso interno estable durante el dia.' },
    { id: 'q2', text: 'Puedo sostener mi atencion sin dispersarme con facilidad.' },
    { id: 'q3', text: 'Mis decisiones se sienten alineadas con lo que valoro.' },
    { id: 'q4', text: 'Cuando me activo, vuelvo al centro con relativa facilidad.' },
    { id: 'q5', text: 'Percibo continuidad entre lo que pienso, siento y hago.' },
    { id: 'q6', text: 'Mantengo un ritmo personal constante sin forzarme.' },
    { id: 'q7', text: 'Mi energia se mueve con claridad y direccion.' },
    { id: 'q8', text: 'Reconozco con precision cuando necesito pausar o ajustar.' },
  ],
};
