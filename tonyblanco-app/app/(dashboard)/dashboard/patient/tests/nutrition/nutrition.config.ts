export type NutritionQuestion = {
  id: string;
  text: string;
};

export const nutritionDefinition = {
  code: 'nutrition',
  name: 'Alimentación — Relación y hábitos',
  purpose:
    'Lectura orientativa de tu relación con la alimentación y hábitos asociados (no nutricional, no diagnóstico)',
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
  // 16 preguntas agrupadas en 4 dimensiones. Algunos ítems son invertidos (ver notas).
  questions: [
    // A) Señales corporales
    { id: 'n1', text: 'Reconocí cuándo tenía hambre real.' },
    { id: 'n2', text: 'Pude notar cuándo estaba satisfecho/a.' },
    { id: 'n3', text: 'Comí respetando señales de mi cuerpo.' },
    { id: 'n4', text: 'Comí aunque no tuviera hambre.' }, // invertida

    // B) Relación emocional
    { id: 'n5', text: 'Comí para regular emociones (estrés, tristeza, aburrimiento).' }, // invertida
    { id: 'n6', text: 'Me sentí en paz con mi forma de comer.' },
    { id: 'n7', text: 'Me sentí culpable después de comer.' }, // invertida
    { id: 'n8', text: 'Pude comer con calma y presencia.' },

    // C) Regularidad y hábitos
    { id: 'n9', text: 'Mantuve horarios relativamente estables.' },
    { id: 'n10', text: 'Salté comidas de forma desordenada.' }, // invertida
    { id: 'n11', text: 'Elegí alimentos que me sientan bien.' },
    { id: 'n12', text: 'Mi alimentación fue caótica.' }, // invertida

    // D) Contexto y autocuidado
    { id: 'n13', text: 'Comí con atención, sin muchas distracciones.' },
    { id: 'n14', text: 'Mi entorno favoreció una alimentación consciente.' },
    { id: 'n15', text: 'Sentí que me cuidaba a través de la comida.' },
    { id: 'n16', text: 'Comí de forma automática o apresurada.' }, // invertida
  ] as NutritionQuestion[],
};

// Notas de implementación:
// - Los ítems marcados como "invertida" deben invertirse en el cálculo (backend).
// - Este test debe usar exclusivamente el motor WELLNESS (sin fallback simbólico).

