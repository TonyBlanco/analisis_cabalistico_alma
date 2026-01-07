export type InsomniaQuestion = {
  id: string;
  text: string;
};

export const insomniaDefinition = {
  code: 'insomnia',
  name: 'Insomnia — Descanso y hábitos',
  purpose: 'Evaluación orientativa de hábitos de descanso y calidad del sueño (no médico).',
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
    // A) Inicio y continuidad del sueño
    { id: 'i1', text: 'Me dormí con relativa facilidad.' },
    { id: 'i2', text: 'Me desperté varias veces durante la noche.' }, // invertida
    { id: 'i3', text: 'Mi sueño fue profundo y reparador.' },
    { id: 'i4', text: 'Me desperté demasiado temprano sin poder volver a dormir.' }, // invertida

    // B) Regularidad y ritmo
    { id: 'i5', text: 'Me acosté a horarios similares cada día.' },
    { id: 'i6', text: 'Me levanté a una hora relativamente constante.' },
    { id: 'i7', text: 'Dormí el número de horas que mi cuerpo necesita.' },
    { id: 'i8', text: 'Mis horarios de sueño fueron caóticos.' }, // invertida

    // C) Hábitos y entorno
    { id: 'i9', text: 'Evité pantallas antes de dormir.' },
    { id: 'i10', text: 'Mi entorno de descanso fue cómodo y tranquilo.' },
    { id: 'i11', text: 'Consumí sustancias que interfirieron con mi sueño.' }, // invertida
    { id: 'i12', text: 'Realicé actividades relajantes antes de acostarme.' },

    // D) Recuperación diurna
    { id: 'i13', text: 'Me sentí descansado/a al despertar.' },
    { id: 'i14', text: 'Tuve energía suficiente durante el día.' },
    { id: 'i15', text: 'Me sentí somnoliento/a o fatigado/a durante el día.' }, // invertida
    { id: 'i16', text: 'Mi descanso me permitió funcionar con claridad.' },
  ] as InsomniaQuestion[],
};

// Notas de implementación:
// - Los ítems marcados como "invertida" deben invertirse en el cálculo (backend).
// - Utilizar el motor `wellness` para ejecución/guardado y la misma estructura de salida descrita en docs/TEST_CONTRACTS.md.
