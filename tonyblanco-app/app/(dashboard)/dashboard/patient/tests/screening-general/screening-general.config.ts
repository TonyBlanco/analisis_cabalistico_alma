export type ScreeningGeneralQuestion = {
  id: string;
  text: string;
};

export const screeningGeneralDefinition = {
  code: 'screening-general',
  name: 'Screening Psicológico General',
  purpose: 'Cuestionario interno orientativo para mapear áreas de malestar, funcionamiento y recursos (no diagnóstico)',
  target_population: 'personas adultas',
  estimated_time_minutes: 10,
  scale: {
    min: 0,
    max: 3,
    labels: {
      '0': 'Nada',
      '1': 'Leve',
      '2': 'Moderado',
      '3': 'Intenso',
    } as Record<string, string>,
  },
  questions: [
    // Ansiedad / preocupación
    { id: 's1', text: 'Me he sentido en estado de alerta o tensión.' },
    { id: 's2', text: 'He tenido preocupación difícil de controlar.' },
    { id: 's3', text: 'He tenido síntomas físicos de ansiedad (palpitaciones, presión, inquietud).' },
    { id: 's4', text: 'Me ha costado concentrarme por nervios o anticipación.' },
    { id: 's5', text: 'He evitado situaciones por temor o incomodidad.' },

    // Estado de ánimo
    { id: 's6', text: 'He sentido desánimo o pérdida de interés.' },
    { id: 's7', text: 'He tenido irritabilidad o enojo que me supera.' },
    { id: 's8', text: 'He sentido culpa o autoexigencia excesiva.' },
    { id: 's9', text: 'He sentido desesperanza (sensación de que nada mejora).' },
    { id: 's10', text: 'He tenido pensamientos de hacerme daño o de no querer estar aquí.' },

    // Trauma / estrés
    { id: 's11', text: 'He tenido recuerdos intrusivos o imágenes molestas.' },
    { id: 's12', text: 'He tenido sobresaltos o hipervigilancia.' },
    { id: 's13', text: 'He evitado pensamientos/lugares por ser demasiado activadores.' },
    { id: 's14', text: 'He sentido desconexión o “entumecimiento” emocional.' },

    // Rumiación / control
    { id: 's15', text: 'He tenido pensamientos repetitivos que se atascan.' },
    { id: 's16', text: 'He sentido necesidad de controlar para sentirme seguro/a.' },
    { id: 's17', text: 'He revisado o repetido conductas para calmarme.' },
    { id: 's18', text: 'He tenido dificultad para tolerar incertidumbre.' },

    // Somatización
    { id: 's19', text: 'He tenido tensión muscular o dolor corporal relacionado al estrés.' },
    { id: 's20', text: 'He tenido molestias digestivas relacionadas al estrés.' },
    { id: 's21', text: 'He tenido cansancio persistente que afecta mi día.' },
    { id: 's22', text: 'He tenido dificultad para dormir o descansar.' },

    // Funcionamiento
    { id: 's23', text: 'Mi rendimiento cotidiano (trabajo/estudio) se ha visto afectado.' },
    { id: 's24', text: 'Mis relaciones se han visto afectadas por mi estado emocional.' },
    { id: 's25', text: 'Mi autocuidado (comer, higiene, rutina) se ha visto afectado.' },
    { id: 's26', text: 'Me ha costado sostener hábitos y compromisos.' },

    // Recursos (se interpretan invertidos en backend: más alto = mejor recurso)
    { id: 's27', text: 'He contado con apoyo emocional disponible (personas, comunidad, terapia).' },
    { id: 's28', text: 'He tenido momentos de calma o regulación durante la semana.' },
    { id: 's29', text: 'He podido expresar lo que siento de forma segura.' },
    { id: 's30', text: 'He tenido sensación de sentido o propósito en algún momento.' },
  ] as ScreeningGeneralQuestion[],
};
