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
  hint?: string;
  note?: string;
};

export type PastLivesGuidedReflectionField = {
  id: string;
  label: string;
  type: 'text_long' | 'text_short';
  required: false;
  placeholder?: string;
  hints?: string[];
};

export const pastLivesDefinition = {
  code: 'past-lives',
  name: 'Vidas Pasadas – Exploración de Memorias del Alma',
  estimated_time_minutes: 20,
  disclaimer:
    'Este cuestionario es una herramienta de exploración personal y simbólica.\n' +
    'No constituye diagnóstico médico ni psicológico ni afirma hechos históricos literales.\n' +
    'Su finalidad es facilitar conciencia, reflexión e integración emocional.',
  intro: {
    title: 'Una lente simbólica para escuchar tu alma',
    paragraphs: [
      'En la tradición cabalística, el alma puede recorrer aprendizajes a lo largo del tiempo (gilgul). ' +
        'La idea de Tikun —rectificación o reparación— invita a mirar qué lecciones parecen repetirse en tu camino.',
      'Este cuestionario no afirma hechos históricos literales. Es un espejo simbólico: conecta con la memoria del alma ' +
        '(asociada en la Kabbalah a Yesod y Binah) para iluminar patrones, afinidades y sensaciones de continuidad.',
      'Responde desde la intuición, sin buscar respuestas «correctas». Si algo resuena, anótalo; si no, también es información.',
    ],
  },
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
      hint: 'Permite que emerja lo que ya sientes, sin necesidad de explicarlo.',
    },
    {
      id: 's2',
      title: 'Emociones sin causa aparente',
      hint: 'Observa emociones que llegan «de otro lugar» en tu historia actual.',
    },
    {
      id: 's3',
      title: 'Patrones repetitivos de vida',
      hint: 'Fíjate en ciclos o dinámicas que se repiten con personas o situaciones.',
    },
    {
      id: 's4',
      title: 'Afinidades históricas y simbólicas',
      hint: 'Nota culturas, símbolos o épocas que te mueven sin razón evidente.',
    },
    {
      id: 's5',
      title: 'Sueños y memorias internas',
      hint: 'Recuerda imágenes oníricas o sensaciones que parecen memoria más que fantasía.',
    },
    {
      id: 's6',
      title: 'Misión, sentido y aprendizaje',
      hint: 'Escucha qué propósito o lección sientes debajo de tu camino vital.',
    },
    {
      id: 's7',
      title: 'Talentos y saberes espontáneos',
      hint: 'Reconoce habilidades o saberes que parecen venir «de fábrica».',
    },
    {
      id: 's8',
      title: 'El cuerpo y sus señales',
      hint: 'Presta atención a sensaciones corporales que evocan historia o emoción.',
      note: 'Esta sección es simbólica y no sustituye una valoración médica.',
    },
    {
      id: 's9',
      title: 'Vínculos del alma',
      hint: 'Piensa en encuentros donde sentiste un reconocimiento inmediato.',
    },
    {
      id: 's10',
      title: 'Lugares y épocas',
      hint: 'Imagina geografías o tiempos que te resultan extrañamente familiares.',
    },
    {
      id: 's11',
      title: 'Aprendizaje del alma / Tikun',
      hint: 'Pregúntate qué reparación o aprendizaje central parece pedirte esta vida.',
    },
  ] as PastLivesSection[],
  questions: [
    { id: 'pl_s1_q1', sectionId: 's1', text: 'Siento que esta vida es la continuación de una experiencia anterior.' },
    { id: 'pl_s1_q2', sectionId: 's1', text: 'Desde pequeño/a he tenido la sensación de “haber vivido antes”.' },
    { id: 'pl_s1_q3', sectionId: 's1', text: 'Me resulta familiar la idea de un aprendizaje que viene de lejos.' },
    { id: 'pl_s1_q4', sectionId: 's1', text: 'Siento que hay cosas que ya sabía sin haberlas aprendido.' },
    { id: 'pl_s1_q5', sectionId: 's1', text: 'Tengo la sensación de estar completando algo pendiente.' },

    { id: 'pl_s2_q1', sectionId: 's2', text: 'Experimento emociones intensas sin una causa clara en mi historia actual.' },
    { id: 'pl_s2_q2', sectionId: 's2', text: 'Siento miedos profundos difíciles de explicar racionalmente.' },
    { id: 'pl_s2_q3', sectionId: 's2', text: 'Algunas situaciones despiertan reacciones desproporcionadas en mí.' },
    { id: 'pl_s2_q4', sectionId: 's2', text: 'Hay emociones recurrentes que no logro ubicar en eventos concretos.' },
    { id: 'pl_s2_q5', sectionId: 's2', text: 'Siento culpas o nostalgias sin un origen claro.' },

    { id: 'pl_s3_q1', sectionId: 's3', text: 'Repito situaciones similares a lo largo de mi vida.' },
    { id: 'pl_s3_q2', sectionId: 's3', text: 'Atraigo relaciones con dinámicas parecidas.' },
    { id: 'pl_s3_q3', sectionId: 's3', text: 'Vivo ciclos que parecen repetirse una y otra vez.' },
    { id: 'pl_s3_q4', sectionId: 's3', text: 'Siento que ciertas pruebas vuelven constantemente.' },
    { id: 'pl_s3_q5', sectionId: 's3', text: 'Me cuesta romper determinados patrones vitales.' },

    { id: 'pl_s4_q1', sectionId: 's4', text: 'Siento una conexión profunda con épocas históricas específicas.' },
    { id: 'pl_s4_q2', sectionId: 's4', text: 'Algunas culturas me resultan extrañamente familiares.' },
    { id: 'pl_s4_q3', sectionId: 's4', text: 'Ciertos símbolos o tradiciones despiertan emociones intensas en mí.' },
    { id: 'pl_s4_q4', sectionId: 's4', text: 'Me atraen lugares que no he visitado pero siento cercanos.' },
    { id: 'pl_s4_q5', sectionId: 's4', text: 'La historia me genera sensaciones de reconocimiento personal.' },

    { id: 'pl_s5_q1', sectionId: 's5', text: 'He tenido sueños que parecen no pertenecer a mi vida actual.' },
    { id: 'pl_s5_q2', sectionId: 's5', text: 'En sueños adopto identidades distintas a la mía.' },
    { id: 'pl_s5_q3', sectionId: 's5', text: 'Sueño con lugares muy definidos que no conozco conscientemente.' },
    { id: 'pl_s5_q4', sectionId: 's5', text: 'Algunos sueños tienen una carga emocional muy real.' },
    { id: 'pl_s5_q5', sectionId: 's5', text: 'Siento que ciertos sueños contienen recuerdos.' },

    { id: 'pl_s6_q1', sectionId: 's6', text: 'Siento que mi vida tiene un propósito más profundo.' },
    { id: 'pl_s6_q2', sectionId: 's6', text: 'Creo que estoy aquí para aprender lecciones importantes.' },
    { id: 'pl_s6_q3', sectionId: 's6', text: 'Mi experiencia vital parece orientada a reparar o sanar algo.' },
    { id: 'pl_s6_q4', sectionId: 's6', text: 'Siento responsabilidad hacia otros sin una razón concreta.' },
    { id: 'pl_s6_q5', sectionId: 's6', text: 'Percibo mi vida como parte de un proceso mayor.' },

    { id: 'pl_s7_q1', sectionId: 's7', text: 'Tengo habilidades que parecen venirme "de fábrica", sin haberlas aprendido.' },
    { id: 'pl_s7_q2', sectionId: 's7', text: 'Hay temas o destrezas que capto con una facilidad que me sorprende.' },
    { id: 'pl_s7_q3', sectionId: 's7', text: 'Me atraen oficios, artes o saberes antiguos sin saber por qué.' },
    { id: 'pl_s7_q4', sectionId: 's7', text: 'A veces sé cómo hacer algo la primera vez que lo intento.' },
    { id: 'pl_s7_q5', sectionId: 's7', text: 'Siento que traigo conmigo un talento o sabiduría que me precede.' },

    { id: 'pl_s8_q1', sectionId: 's8', text: 'Tengo molestias o tensiones recurrentes sin una causa clara.' },
    { id: 'pl_s8_q2', sectionId: 's8', text: 'Ciertas posturas, gestos o lugares del cuerpo me evocan emociones intensas.' },
    { id: 'pl_s8_q3', sectionId: 's8', text: 'Tengo miedos físicos (agua, fuego, alturas, un objeto) difíciles de explicar.' },
    { id: 'pl_s8_q4', sectionId: 's8', text: 'Mi cuerpo reacciona con fuerza ante ciertos sonidos, olores o imágenes.' },
    { id: 'pl_s8_q5', sectionId: 's8', text: 'Siento que mi cuerpo "recuerda" algo que mi mente no ubica.' },

    { id: 'pl_s9_q1', sectionId: 's9', text: 'He sentido que conocía a alguien "de antes" desde el primer encuentro.' },
    { id: 'pl_s9_q2', sectionId: 's9', text: 'Hay personas con quienes el vínculo fue inmediato e inexplicablemente profundo.' },
    { id: 'pl_s9_q3', sectionId: 's9', text: 'Siento que algunas relaciones tienen un propósito más allá de esta vida.' },
    { id: 'pl_s9_q4', sectionId: 's9', text: 'He reconocido en alguien una presencia familiar que no sé de dónde viene.' },
    { id: 'pl_s9_q5', sectionId: 's9', text: 'Creo que ciertas personas y yo "nos volvemos a encontrar".' },

    { id: 'pl_s10_q1', sectionId: 's10', text: 'Hay lugares que no he visitado y siento profundamente familiares.' },
    { id: 'pl_s10_q2', sectionId: 's10', text: 'Me atrae (o me incomoda) intensamente una época histórica concreta.' },
    { id: 'pl_s10_q3', sectionId: 's10', text: 'He sentido un déjà vu fuerte al llegar a un sitio nuevo.' },
    { id: 'pl_s10_q4', sectionId: 's10', text: 'Ciertas culturas, idiomas o paisajes me "llaman" sin motivo aparente.' },
    { id: 'pl_s10_q5', sectionId: 's10', text: 'Imagino con detalle lugares o tiempos en los que siento que estuve.' },

    { id: 'pl_s11_q1', sectionId: 's11', text: 'Siento que vine a aprender o reparar algo concreto en esta vida.' },
    { id: 'pl_s11_q2', sectionId: 's11', text: 'Reconozco una "lección" que se me presenta una y otra vez.' },
    { id: 'pl_s11_q3', sectionId: 's11', text: 'Hay un tema (perdón, confianza, poder, entrega...) central en mi camino.' },
    { id: 'pl_s11_q4', sectionId: 's11', text: 'Siento que al sanar algo mío, alivio también algo más grande que yo.' },
    { id: 'pl_s11_q5', sectionId: 's11', text: 'Percibo mi vida como parte de un aprendizaje que continúa.' },
  ] as PastLivesQuestion[],
  guidedReflection: [
    {
      id: 'recurring_scene',
      label: 'Escena o sueño recurrente',
      type: 'text_long',
      required: false,
      placeholder: 'Describe la escena o sueño si lo deseas (opcional)',
      hints: [
        'Época o lugar que sientes',
        'Edad aparente',
        'Emoción central',
        'Símbolo u objeto que destaca',
      ],
    },
    {
      id: 'inexplicable_gift_fear',
      label: 'Un talento, miedo o atracción inexplicable',
      type: 'text_short',
      required: false,
      placeholder: 'Algo que te sorprende en ti (opcional)',
    },
    {
      id: 'familiar_person_place',
      label: 'Una persona o lugar que sentiste conocer de antes',
      type: 'text_short',
      required: false,
      placeholder: 'Un encuentro o lugar que te marcó (opcional)',
    },
  ] as PastLivesGuidedReflectionField[],
};

export function buildPastLivesOpenReflection(
  values: Record<string, string>,
): string | Record<string, string> | undefined {
  const trimmed: Record<string, string> = {};
  for (const field of pastLivesDefinition.guidedReflection) {
    const val = (values[field.id] || '').trim();
    if (val) trimmed[field.id] = val;
  }
  if (Object.keys(trimmed).length === 0) return undefined;
  if (Object.keys(trimmed).length === 1 && trimmed.recurring_scene) {
    return trimmed.recurring_scene;
  }
  return trimmed;
}