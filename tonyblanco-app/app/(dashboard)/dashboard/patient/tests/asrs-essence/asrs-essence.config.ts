export const asrsEssenceDefinition = {
  code: 'asrs_essence',
  name: 'ASRS-Essence — Conciencia Esencial Abierta',
  purpose: 'Exploración simbólica del ritmo de atención y presencia vital',
  estimated_time_minutes: 3,
  scale: {
    min: 0,
    max: 4,
    labels: {
      0: 'Nunca',
      1: 'Rara vez',
      2: 'A veces',
      3: 'A menudo',
      4: 'Muy a menudo',
    },
  },
  questions: [
    {
      id: 'q1',
      text: '¿Con qué frecuencia pierdes el hilo al cerrar los últimos detalles de tus travesías internas, incluso cuando lo principal ya está completado?',
    },
    {
      id: 'q2',
      text: '¿Con qué frecuencia encuentras dificultad para ordenar el flujo de tus intenciones cuando el sendero requiere estructura y jerarquía?',
    },
    {
      id: 'q3',
      text: '¿Con qué frecuencia olvidas compromisos del alma —encuentros, promesas, compromisos— que ya habías concertado?',
    },
    {
      id: 'q4',
      text: '¿Con qué frecuencia postergas o evitas los trabajos del espíritu que requieren sostenimiento prolongado de la atención?',
    },
    {
      id: 'q5',
      text: '¿Con qué frecuencia sientes inquietud o movimiento interno cuando el camino te pide permanecer en quietud?',
    },
    {
      id: 'q6',
      text: '¿Con qué frecuencia percibes una energía interior que te lleva a actuar más allá de lo que la situación requiere, como si el impulso se impusiera al equilibrio?',
    },
  ],
};
