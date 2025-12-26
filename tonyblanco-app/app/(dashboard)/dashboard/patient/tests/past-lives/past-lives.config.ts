export type PastLivesLikertOption = {
  value: number;
  label: string;
};

export type PastLivesQuestion = {
  id: string;
  text: string;
  sectionId: string;
};

export type PastLivesSection = {
  id: string;
  title: string;
  description?: string;
};

export const pastLivesDefinition = {
  code: 'past-lives',
  name: 'Vidas Pasadas – Exploración de Memorias del Alma',
  estimated_time_minutes: 12,
  disclaimer:
    'Este cuestionario es una herramienta de exploración personal y simbólica.\n' +
    'No constituye diagnóstico médico ni psicológico ni afirma hechos históricos literales.\n' +
    'Su finalidad es facilitar conciencia, reflexión e integración emocional.',
  scale: {
    labels: [
      { value: 1, label: 'Totalmente en desacuerdo' },
      { value: 2, label: 'En desacuerdo' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'De acuerdo' },
      { value: 5, label: 'Totalmente de acuerdo' },
    ] as PastLivesLikertOption[],
  },
  sections: [
    {
      id: 's1',
      title: 'Sensación de continuidad del alma',
    },
    {
      id: 's2',
      title: 'Emociones sin causa aparente',
    },
    {
      id: 's3',
      title: 'Patrones repetitivos de vida',
    },
    {
      id: 's4',
      title: 'Afinidades históricas y simbólicas',
    },
    {
      id: 's5',
      title: 'Sueños y memorias internas',
    },
    {
      id: 's6',
      title: 'Misión, sentido y aprendizaje',
    },
  ] as PastLivesSection[],
  questions: [
    // SECTION 1
    {
      id: 'pl_s1_q1',
      sectionId: 's1',
      text: 'Siento que esta vida es la continuación de una experiencia anterior.',
    },
    {
      id: 'pl_s1_q2',
      sectionId: 's1',
      text: 'Desde pequeño/a he tenido la sensación de “haber vivido antes”.',
    },
    {
      id: 'pl_s1_q3',
      sectionId: 's1',
      text: 'Me resulta familiar la idea de un aprendizaje que viene de lejos.',
    },
    {
      id: 'pl_s1_q4',
      sectionId: 's1',
      text: 'Siento que hay cosas que ya sabía sin haberlas aprendido.',
    },
    {
      id: 'pl_s1_q5',
      sectionId: 's1',
      text: 'Tengo la sensación de estar completando algo pendiente.',
    },

    // SECTION 2
    {
      id: 'pl_s2_q1',
      sectionId: 's2',
      text: 'Experimento emociones intensas sin una causa clara en mi historia actual.',
    },
    {
      id: 'pl_s2_q2',
      sectionId: 's2',
      text: 'Siento miedos profundos difíciles de explicar racionalmente.',
    },
    {
      id: 'pl_s2_q3',
      sectionId: 's2',
      text: 'Algunas situaciones despiertan reacciones desproporcionadas en mí.',
    },
    {
      id: 'pl_s2_q4',
      sectionId: 's2',
      text: 'Hay emociones recurrentes que no logro ubicar en eventos concretos.',
    },
    {
      id: 'pl_s2_q5',
      sectionId: 's2',
      text: 'Siento culpas o nostalgias sin un origen claro.',
    },

    // SECTION 3
    {
      id: 'pl_s3_q1',
      sectionId: 's3',
      text: 'Repito situaciones similares a lo largo de mi vida.',
    },
    {
      id: 'pl_s3_q2',
      sectionId: 's3',
      text: 'Atraigo relaciones con dinámicas parecidas.',
    },
    {
      id: 'pl_s3_q3',
      sectionId: 's3',
      text: 'Vivo ciclos que parecen repetirse una y otra vez.',
    },
    {
      id: 'pl_s3_q4',
      sectionId: 's3',
      text: 'Siento que ciertas pruebas vuelven constantemente.',
    },
    {
      id: 'pl_s3_q5',
      sectionId: 's3',
      text: 'Me cuesta romper determinados patrones vitales.',
    },

    // SECTION 4
    {
      id: 'pl_s4_q1',
      sectionId: 's4',
      text: 'Siento una conexión profunda con épocas históricas específicas.',
    },
    {
      id: 'pl_s4_q2',
      sectionId: 's4',
      text: 'Algunas culturas me resultan extrañamente familiares.',
    },
    {
      id: 'pl_s4_q3',
      sectionId: 's4',
      text: 'Ciertos símbolos o tradiciones despiertan emociones intensas en mí.',
    },
    {
      id: 'pl_s4_q4',
      sectionId: 's4',
      text: 'Me atraen lugares que no he visitado pero siento cercanos.',
    },
    {
      id: 'pl_s4_q5',
      sectionId: 's4',
      text: 'La historia me genera sensaciones de reconocimiento personal.',
    },

    // SECTION 5
    {
      id: 'pl_s5_q1',
      sectionId: 's5',
      text: 'He tenido sueños que parecen no pertenecer a mi vida actual.',
    },
    {
      id: 'pl_s5_q2',
      sectionId: 's5',
      text: 'En sueños adopto identidades distintas a la mía.',
    },
    {
      id: 'pl_s5_q3',
      sectionId: 's5',
      text: 'Sueño con lugares muy definidos que no conozco conscientemente.',
    },
    {
      id: 'pl_s5_q4',
      sectionId: 's5',
      text: 'Algunos sueños tienen una carga emocional muy real.',
    },
    {
      id: 'pl_s5_q5',
      sectionId: 's5',
      text: 'Siento que ciertos sueños contienen recuerdos.',
    },

    // SECTION 6
    {
      id: 'pl_s6_q1',
      sectionId: 's6',
      text: 'Siento que mi vida tiene un propósito más profundo.',
    },
    {
      id: 'pl_s6_q2',
      sectionId: 's6',
      text: 'Creo que estoy aquí para aprender lecciones importantes.',
    },
    {
      id: 'pl_s6_q3',
      sectionId: 's6',
      text: 'Mi experiencia vital parece orientada a reparar o sanar algo.',
    },
    {
      id: 'pl_s6_q4',
      sectionId: 's6',
      text: 'Siento responsabilidad hacia otros sin una razón concreta.',
    },
    {
      id: 'pl_s6_q5',
      sectionId: 's6',
      text: 'Percibo mi vida como parte de un proceso mayor.',
    },
  ] as PastLivesQuestion[],
  openReflection: {
    id: 'open_reflection',
    label: 'Si deseas, comparte cualquier experiencia o reflexión relacionada',
    type: 'text_long' as const,
    required: false,
  },
};
