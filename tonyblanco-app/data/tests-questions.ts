/**
 * Base de datos tipada de preguntas para tests psicológicos
 * Incluye configuraciones completas para tests estandarizados
 */

export interface Question {
  id: string;
  text: string;
  options: { value: number; label: string }[];
}

export interface TestConfig {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export const TESTS_DB: Record<string, TestConfig> = {
  'phq-9': {
    id: 'phq-9',
    title: 'Pulso del Ánimo — 9 señales',
    description: 'Lectura de bienestar basada en 9 señales. Responde según las últimas 2 semanas.',
    questions: [
      {
        id: 'phq9-q1',
        text: 'Poco interés o placer en hacer cosas.',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'phq9-q2',
        text: 'Se ha sentido decaído/a, deprimido/a o sin esperanzas.',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'phq9-q3',
        text: 'Dificultad para quedarse o permanecer dormido/a, o dormir demasiado.',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'phq9-q4',
        text: 'Se ha sentido cansado/a o con poca energía.',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'phq9-q5',
        text: 'Poco apetito o comer en exceso.',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'phq9-q6',
        text: 'Se ha sentido mal consigo mismo/a, o que es un fracaso o que ha quedado mal con usted mismo/a o con su familia.',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'phq9-q7',
        text: 'Dificultad para concentrarse en cosas, tales como leer el periódico o ver televisión.',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'phq9-q8',
        text: 'Se ha movido o hablado tan lento que otras personas podrían haberlo notado. O lo contrario: ha estado tan inquieto/a o agitado/a que ha estado moviéndose mucho más de lo habitual.',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'phq9-q9',
        text: 'Pensamientos de que estaría mejor muerto/a o de alguna manera lastimándose a usted mismo/a.',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
    ],
  },

  'gad-7': {
    id: 'gad-7',
    title: 'Mapa de Preocupación — 7 señales',
    description: 'Lectura de bienestar basada en 7 señales de preocupación/tensión. Responde según las últimas 2 semanas.',
    questions: [
      {
        id: 'gad7-q1',
        text: 'Sentirse nervioso/a, intranquilo/a o con los nervios de punta',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'gad7-q2',
        text: 'No poder dejar de preocuparse o no poder controlar la preocupación',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'gad7-q3',
        text: 'Preocuparse demasiado por diferentes cosas',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'gad7-q4',
        text: 'Dificultad para relajarse',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'gad7-q5',
        text: 'Estar tan inquieto/a que es difícil quedarse quieto/a',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'gad7-q6',
        text: 'Facilidad para molestarse o irritarse',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
      {
        id: 'gad7-q7',
        text: 'Sentir miedo como si algo terrible fuera a suceder',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          { value: 2, label: 'Más de la mitad de los días' },
          { value: 3, label: 'Casi todos los días' },
        ],
      },
    ],
  },

  'bai': {
    id: 'bai',
    title: 'Señales del Cuerpo — Intensidad',
    description: 'Lectura de bienestar sobre señales corporales. Indica la intensidad con la que ha sentido cada señal en la última semana.',
    questions: [
      {
        id: 'bai-q1',
        text: 'Hormigueo o entumecimiento',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q2',
        text: 'Sensación de calor',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q3',
        text: 'Temblor de piernas',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q4',
        text: 'Incapacidad de relajarse',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q5',
        text: 'Miedo a que suceda lo peor',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q6',
        text: 'Mareo o aturdimiento',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q7',
        text: 'Palpitaciones o taquicardia',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q8',
        text: 'Inestabilidad',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q9',
        text: 'Terror o pánico',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q10',
        text: 'Nerviosismo',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q11',
        text: 'Sensación de ahogo',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q12',
        text: 'Temblor de manos',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q13',
        text: 'Temblor generalizado',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q14',
        text: 'Miedo a perder el control',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q15',
        text: 'Dificultad para respirar',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q16',
        text: 'Miedo a morir',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q17',
        text: 'Sofocos',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q18',
        text: 'Rubor facial',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q19',
        text: 'Sudoración (no debida al calor)',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q20',
        text: 'Desmayos',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
      {
        id: 'bai-q21',
        text: 'Sensación de atragantamiento',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Levemente' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Severamente' },
        ],
      },
    ],
  },

  'bdi-ii': {
    id: 'bdi-ii',
    title: 'Inventario de Reflexión Profunda',
    description: 'Selecciona la afirmación que mejor describa cómo te has sentido en las últimas dos semanas.',
    questions: [
      {
        id: 'bdii-q1',
        text: 'Tristeza',
        options: [
          { value: 0, label: 'No me siento triste' },
          { value: 1, label: 'Me siento triste gran parte del tiempo' },
          { value: 2, label: 'Me siento triste todo el tiempo' },
          { value: 3, label: 'Me siento tan triste o desgraciado que no puedo soportarlo' },
        ],
      },
      {
        id: 'bdii-q2',
        text: 'Pesimismo',
        options: [
          { value: 0, label: 'No estoy desalentado respecto de mi futuro' },
          { value: 1, label: 'Me siento más desalentado respecto de mi futuro que lo que solía estarlo' },
          { value: 2, label: 'No espero que las cosas funcionen para mí' },
          { value: 3, label: 'Siento que no hay esperanza para mi futuro' },
        ],
      },
      {
        id: 'bdii-q3',
        text: 'Fracaso pasado',
        options: [
          { value: 0, label: 'No me siento como un fracasado' },
          { value: 1, label: 'He fracasado más de lo que debería' },
          { value: 2, label: 'Cuando miro hacia atrás, veo muchos fracasos' },
          { value: 3, label: 'Siento que como persona soy un fracaso total' },
        ],
      },
      {
        id: 'bdii-q4',
        text: 'Pérdida de placer',
        options: [
          { value: 0, label: 'Obtengo tanto placer como siempre por las cosas que me gustan' },
          { value: 1, label: 'No disfruto tanto de las cosas como solía hacerlo' },
          { value: 2, label: 'Obtengo muy poco placer de las cosas que solía disfrutar' },
          { value: 3, label: 'No puedo obtener ningún placer de las cosas que solía disfrutar' },
        ],
      },
      {
        id: 'bdii-q5',
        text: 'Sentimientos de culpa',
        options: [
          { value: 0, label: 'No me siento particularmente culpable' },
          { value: 1, label: 'Me siento culpable respecto de varias cosas que he hecho o que debería haber hecho' },
          { value: 2, label: 'Me siento bastante culpable la mayor parte del tiempo' },
          { value: 3, label: 'Me siento culpable todo el tiempo' },
        ],
      },
      {
        id: 'bdii-q6',
        text: 'Sentimientos de castigo',
        options: [
          { value: 0, label: 'No siento que esté siendo castigado' },
          { value: 1, label: 'Siento que tal vez pueda ser castigado' },
          { value: 2, label: 'Espero ser castigado' },
          { value: 3, label: 'Siento que estoy siendo castigado' },
        ],
      },
      {
        id: 'bdii-q7',
        text: 'Disgusto hacia uno mismo',
        options: [
          { value: 0, label: 'Me siento igual acerca de mí mismo que siempre' },
          { value: 1, label: 'He perdido la confianza en mí mismo' },
          { value: 2, label: 'Estoy decepcionado conmigo mismo' },
          { value: 3, label: 'Me disgusto a mí mismo' },
        ],
      },
      {
        id: 'bdii-q8',
        text: 'Autocrítica',
        options: [
          { value: 0, label: 'No me critico ni me culpo más de lo habitual' },
          { value: 1, label: 'Estoy más crítico conmigo mismo de lo que solía estarlo' },
          { value: 2, label: 'Me critico a mí mismo por todos mis defectos' },
          { value: 3, label: 'Me culpo a mí mismo por todo lo malo que sucede' },
        ],
      },
      {
        id: 'bdii-q9',
        text: 'Pensamientos o deseos suicidas',
        options: [
          { value: 0, label: 'No tengo ningún pensamiento de matarme' },
          { value: 1, label: 'Tengo pensamientos de matarme, pero no los llevaría a cabo' },
          { value: 2, label: 'Me gustaría matarme' },
          { value: 3, label: 'Me mataría si tuviera la oportunidad de hacerlo' },
        ],
      },
      {
        id: 'bdii-q10',
        text: 'Llanto',
        options: [
          { value: 0, label: 'No lloro más de lo que solía hacerlo' },
          { value: 1, label: 'Lloro más ahora que en el pasado' },
          { value: 2, label: 'Lloro por cualquier pequeña cosa' },
          { value: 3, label: 'Siento ganas de llorar pero no puedo' },
        ],
      },
      {
        id: 'bdii-q11',
        text: 'Agitación',
        options: [
          { value: 0, label: 'No estoy más inquieto o tenso que lo habitual' },
          { value: 1, label: 'Me siento más inquieto o tenso que lo habitual' },
          { value: 2, label: 'Estoy tan inquieto o agitado que me es difícil quedarme quieto' },
          { value: 3, label: 'Estoy tan inquieto o agitado que tengo que estar siempre moviéndome o haciendo algo' },
        ],
      },
      {
        id: 'bdii-q12',
        text: 'Pérdida de interés',
        options: [
          { value: 0, label: 'No he perdido el interés en otras personas o actividades' },
          { value: 1, label: 'Estoy menos interesado en otras personas o en cosas que antes' },
          { value: 2, label: 'He perdido la mayor parte de mi interés en otras personas o cosas' },
          { value: 3, label: 'Es difícil interesarme en algo' },
        ],
      },
      {
        id: 'bdii-q13',
        text: 'Indecisión',
        options: [
          { value: 0, label: 'Tomo mis propias decisiones tan bien como siempre' },
          { value: 1, label: 'Me resulta más difícil tomar decisiones de lo habitual' },
          { value: 2, label: 'Tengo mucha más dificultad en tomar decisiones de lo que solía tener' },
          { value: 3, label: 'Tengo problemas para tomar cualquier decisión' },
        ],
      },
      {
        id: 'bdii-q14',
        text: 'Desvalorización',
        options: [
          { value: 0, label: 'No siento que no valga nada' },
          { value: 1, label: 'No me considero a mí mismo tan valioso y útil como solía considerarme' },
          { value: 2, label: 'Siento que valgo menos que otras personas' },
          { value: 3, label: 'Siento que no valgo nada' },
        ],
      },
      {
        id: 'bdii-q15',
        text: 'Pérdida de energía',
        options: [
          { value: 0, label: 'Tengo tanta energía como siempre' },
          { value: 1, label: 'Tengo menos energía que lo habitual' },
          { value: 2, label: 'No tengo suficiente energía para hacer demasiado' },
          { value: 3, label: 'No tengo suficiente energía para hacer nada' },
        ],
      },
      {
        id: 'bdii-q16',
        text: 'Cambios en el patrón de sueño',
        options: [
          { value: 0, label: 'No he experimentado ningún cambio en mi patrón de sueño' },
          { value: 1, label: 'Duermo un poco más que lo habitual' },
          { value: 2, label: 'Duermo un poco menos que lo habitual' },
          { value: 3, label: 'Duermo mucho más que lo habitual' },
        ],
      },
      {
        id: 'bdii-q17',
        text: 'Irritabilidad',
        options: [
          { value: 0, label: 'No estoy más irritable que lo habitual' },
          { value: 1, label: 'Estoy más irritable que lo habitual' },
          { value: 2, label: 'Estoy mucho más irritable que lo habitual' },
          { value: 3, label: 'Estoy irritable todo el tiempo' },
        ],
      },
      {
        id: 'bdii-q18',
        text: 'Cambios en el apetito',
        options: [
          { value: 0, label: 'No he experimentado ningún cambio en mi apetito' },
          { value: 1, label: 'Mi apetito es un poco menor que lo habitual' },
          { value: 2, label: 'Mi apetito es mucho menor que antes' },
          { value: 3, label: 'No tengo apetito en absoluto' },
        ],
      },
      {
        id: 'bdii-q19',
        text: 'Dificultad de concentración',
        options: [
          { value: 0, label: 'Puedo concentrarme tan bien como siempre' },
          { value: 1, label: 'No puedo concentrarme tan bien como habitualmente' },
          { value: 2, label: 'Es difícil mantener la mente en algo por mucho tiempo' },
          { value: 3, label: 'Me resulta difícil concentrarme en nada' },
        ],
      },
      {
        id: 'bdii-q20',
        text: 'Cansancio o fatiga',
        options: [
          { value: 0, label: 'No estoy más cansado o fatigado que lo habitual' },
          { value: 1, label: 'Me fatigo más fácilmente que lo habitual' },
          { value: 2, label: 'Estoy demasiado fatigado para hacer muchas de las cosas que solía hacer' },
          { value: 3, label: 'Estoy demasiado fatigado para hacer la mayor parte de las cosas que solía hacer' },
        ],
      },
      {
        id: 'bdii-q21',
        text: 'Pérdida de interés en el sexo',
        options: [
          { value: 0, label: 'No he notado ningún cambio reciente en mi interés por el sexo' },
          { value: 1, label: 'Estoy menos interesado en el sexo de lo que solía estar' },
          { value: 2, label: 'Estoy mucho menos interesado en el sexo ahora' },
          { value: 3, label: 'He perdido completamente el interés en el sexo' },
        ],
      },
    ],
  },

  'ptsd': {
    id: 'ptsd',
    title: 'PTSD Check',
    description: 'Evaluación de síntomas de estrés postraumático. Responde según tu experiencia.',
    questions: [
      {
        id: 'ptsd-q1',
        text: 'He tenido pesadillas o recuerdos angustiosos sobre el evento traumático',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Siempre' },
        ],
      },
      {
        id: 'ptsd-q2',
        text: 'Evito lugares, personas o situaciones que me recuerdan el evento',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Siempre' },
        ],
      },
      {
        id: 'ptsd-q3',
        text: 'Me siento emocionalmente adormecido o desconectado de los demás',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Siempre' },
        ],
      },
      {
        id: 'ptsd-q4',
        text: 'Tengo dificultad para dormir o me despierto sobresaltado',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Siempre' },
        ],
      },
      {
        id: 'ptsd-q5',
        text: 'Me siento constantemente en alerta o sobresaltado fácilmente',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Siempre' },
        ],
      },
    ],
  },

  'ocd': {
    id: 'ocd',
    title: 'Screening OCD',
    description: 'Evaluación de síntomas obsesivo-compulsivos. Indica la frecuencia de estos comportamientos.',
    questions: [
      {
        id: 'ocd-q1',
        text: 'Lavo o limpio repetidamente por miedo a gérmenes o contaminación',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Siempre' },
        ],
      },
      {
        id: 'ocd-q2',
        text: 'Verifico repetidamente cosas (puertas, luces, aparatos) aunque sé que están bien',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Siempre' },
        ],
      },
      {
        id: 'ocd-q3',
        text: 'Tengo pensamientos intrusivos que no puedo controlar',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Siempre' },
        ],
      },
      {
        id: 'ocd-q4',
        text: 'Necesito seguir rutinas o rituales específicos para sentirme seguro',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Siempre' },
        ],
      },
      {
        id: 'ocd-q5',
        text: 'Organizo o ordeno cosas de manera repetitiva hasta que se siente "correcto"',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Siempre' },
        ],
      },
    ],
  },

  'insomnia': {
    id: 'insomnia',
    title: 'Índice de Severidad de Insomnio',
    description: 'Evalúa la severidad de tus problemas de sueño durante el último mes.',
    questions: [
      {
        id: 'insomnia-q1',
        text: 'Dificultad para conciliar el sueño al acostarme',
        options: [
          { value: 0, label: 'Ninguna' },
          { value: 1, label: 'Leve' },
          { value: 2, label: 'Moderada' },
          { value: 3, label: 'Severa' },
          { value: 4, label: 'Muy severa' },
        ],
      },
      {
        id: 'insomnia-q2',
        text: 'Dificultad para mantener el sueño (despertares frecuentes)',
        options: [
          { value: 0, label: 'Ninguna' },
          { value: 1, label: 'Leve' },
          { value: 2, label: 'Moderada' },
          { value: 3, label: 'Severa' },
          { value: 4, label: 'Muy severa' },
        ],
      },
      {
        id: 'insomnia-q3',
        text: 'Despertar demasiado temprano sin poder volver a dormir',
        options: [
          { value: 0, label: 'Ninguna' },
          { value: 1, label: 'Leve' },
          { value: 2, label: 'Moderada' },
          { value: 3, label: 'Severa' },
          { value: 4, label: 'Muy severa' },
        ],
      },
      {
        id: 'insomnia-q4',
        text: 'Insatisfacción con la calidad del sueño',
        options: [
          { value: 0, label: 'Muy satisfecho' },
          { value: 1, label: 'Satisfecho' },
          { value: 2, label: 'Moderadamente insatisfecho' },
          { value: 3, label: 'Muy insatisfecho' },
          { value: 4, label: 'Extremadamente insatisfecho' },
        ],
      },
      {
        id: 'insomnia-q5',
        text: 'Preocupación o angustia por los problemas de sueño',
        options: [
          { value: 0, label: 'Ninguna' },
          { value: 1, label: 'Leve' },
          { value: 2, label: 'Moderada' },
          { value: 3, label: 'Severa' },
          { value: 4, label: 'Muy severa' },
        ],
      },
    ],
  },

  'stai': {
    id: 'stai',
    title: 'STAI - Ansiedad Estado/Rasgo',
    description: 'Evalúa tu nivel de ansiedad actual (estado) y tu tendencia general a la ansiedad (rasgo).',
    questions: [
      {
        id: 'stai-q1',
        text: 'Me siento calmado',
        options: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' },
        ],
      },
      {
        id: 'stai-q2',
        text: 'Me preocupan posibles desgracias',
        options: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' },
        ],
      },
      {
        id: 'stai-q3',
        text: 'Me siento tenso',
        options: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' },
        ],
      },
      {
        id: 'stai-q4',
        text: 'Me siento satisfecho',
        options: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' },
        ],
      },
      {
        id: 'stai-q5',
        text: 'Me siento preocupado',
        options: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' },
        ],
      },
      {
        id: 'stai-q6',
        text: 'Me siento descansado',
        options: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' },
        ],
      },
      {
        id: 'stai-q7',
        text: 'Me siento nervioso e inquieto',
        options: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' },
        ],
      },
      {
        id: 'stai-q8',
        text: 'Me siento seguro',
        options: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' },
        ],
      },
      {
        id: 'stai-q9',
        text: 'Me siento angustiado',
        options: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' },
        ],
      },
      {
        id: 'stai-q10',
        text: 'Me siento cómodo',
        options: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' },
        ],
      },
    ],
  },

  'scl-90-r': {
    id: 'scl-90-r',
    title: 'Lente de Simetría del Alma (Revisada)',
    description: 'Explora una amplia gama de señales internas. Indica cuánto te ha molestado cada señal durante la última semana.',
    questions: [
      {
        id: 'scl90-q1',
        text: 'Dolores de cabeza',
        options: [
          { value: 0, label: 'Nada' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Mucho' },
        ],
      },
      {
        id: 'scl90-q2',
        text: 'Pensamientos o imágenes que no puedo sacar de mi mente',
        options: [
          { value: 0, label: 'Nada' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Mucho' },
        ],
      },
      {
        id: 'scl90-q3',
        text: 'Sentirse triste o bajo de ánimo',
        options: [
          { value: 0, label: 'Nada' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Mucho' },
        ],
      },
      {
        id: 'scl90-q4',
        text: 'Nerviosismo o temblores internos',
        options: [
          { value: 0, label: 'Nada' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Mucho' },
        ],
      },
      {
        id: 'scl90-q5',
        text: 'Sentimientos de hostilidad o irritabilidad hacia los demás',
        options: [
          { value: 0, label: 'Nada' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Mucho' },
        ],
      },
      {
        id: 'scl90-q6',
        text: 'Dolores en el pecho o palpitaciones',
        options: [
          { value: 0, label: 'Nada' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Mucho' },
        ],
      },
      {
        id: 'scl90-q7',
        text: 'Miedo a perder el control o volverse loco',
        options: [
          { value: 0, label: 'Nada' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Mucho' },
        ],
      },
      {
        id: 'scl90-q8',
        text: 'Sentirse solo incluso cuando hay gente alrededor',
        options: [
          { value: 0, label: 'Nada' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Mucho' },
        ],
      },
      {
        id: 'scl90-q9',
        text: 'Pensamientos sobre la muerte o el morir',
        options: [
          { value: 0, label: 'Nada' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Mucho' },
        ],
      },
      {
        id: 'scl90-q10',
        text: 'Sentirse culpable',
        options: [
          { value: 0, label: 'Nada' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Mucho' },
        ],
      },
    ],
  },

  'pai': {
    id: 'pai',
    title: 'Inventario PAI (Screening)',
    description: 'Evaluación de aspectos de personalidad y funcionamiento psicológico. Responde con honestidad.',
    questions: [
      {
        id: 'pai-q1',
        text: 'Tengo dolores de cabeza frecuentes',
        options: [
          { value: 0, label: 'Falso' },
          { value: 1, label: 'Ligeramente' },
          { value: 2, label: 'Mayormente' },
          { value: 3, label: 'Verdadero' },
        ],
      },
      {
        id: 'pai-q2',
        text: 'Me preocupo mucho por cosas que podrían salir mal',
        options: [
          { value: 0, label: 'Falso' },
          { value: 1, label: 'Ligeramente' },
          { value: 2, label: 'Mayormente' },
          { value: 3, label: 'Verdadero' },
        ],
      },
      {
        id: 'pai-q3',
        text: 'Me siento triste o deprimido la mayor parte del tiempo',
        options: [
          { value: 0, label: 'Falso' },
          { value: 1, label: 'Ligeramente' },
          { value: 2, label: 'Mayormente' },
          { value: 3, label: 'Verdadero' },
        ],
      },
      {
        id: 'pai-q4',
        text: 'Tengo períodos en los que me siento muy enérgico y activo',
        options: [
          { value: 0, label: 'Falso' },
          { value: 1, label: 'Ligeramente' },
          { value: 2, label: 'Mayormente' },
          { value: 3, label: 'Verdadero' },
        ],
      },
      {
        id: 'pai-q5',
        text: 'Tengo problemas para dormir',
        options: [
          { value: 0, label: 'Falso' },
          { value: 1, label: 'Ligeramente' },
          { value: 2, label: 'Mayormente' },
          { value: 3, label: 'Verdadero' },
        ],
      },
      {
        id: 'pai-q6',
        text: 'Me siento nervioso o tenso',
        options: [
          { value: 0, label: 'Falso' },
          { value: 1, label: 'Ligeramente' },
          { value: 2, label: 'Mayormente' },
          { value: 3, label: 'Verdadero' },
        ],
      },
      {
        id: 'pai-q7',
        text: 'Tengo dificultades para concentrarme',
        options: [
          { value: 0, label: 'Falso' },
          { value: 1, label: 'Ligeramente' },
          { value: 2, label: 'Mayormente' },
          { value: 3, label: 'Verdadero' },
        ],
      },
      {
        id: 'pai-q8',
        text: 'Me siento irritable o enojado con frecuencia',
        options: [
          { value: 0, label: 'Falso' },
          { value: 1, label: 'Ligeramente' },
          { value: 2, label: 'Mayormente' },
          { value: 3, label: 'Verdadero' },
        ],
      },
      {
        id: 'pai-q9',
        text: 'Tengo cambios de humor frecuentes',
        options: [
          { value: 0, label: 'Falso' },
          { value: 1, label: 'Ligeramente' },
          { value: 2, label: 'Mayormente' },
          { value: 3, label: 'Verdadero' },
        ],
      },
      {
        id: 'pai-q10',
        text: 'Me resulta difícil tomar decisiones',
        options: [
          { value: 0, label: 'Falso' },
          { value: 1, label: 'Ligeramente' },
          { value: 2, label: 'Mayormente' },
          { value: 3, label: 'Verdadero' },
        ],
      },
    ],
  },

  'scid-5-rv': {
    id: 'scid-5-rv',
    title: 'SCID-5 Auto-reporte',
    description: 'Evaluación de criterios diagnósticos según el DSM-5. Responde Sí o No a cada pregunta.',
    questions: [
      {
        id: 'scid5-q1',
        text: '¿Ha tenido un período de al menos 2 semanas en el que se sintió triste, vacío o desesperanzado la mayor parte del día, casi todos los días?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'scid5-q2',
        text: '¿Ha tenido un período de al menos 2 semanas en el que perdió interés o placer en casi todas las actividades que antes disfrutaba?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'scid5-q3',
        text: '¿Ha tenido un período de al menos una semana en el que se sintió excepcionalmente animado, eufórico o irritable, y también más activo o hablador de lo habitual?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'scid5-q4',
        text: '¿Ha tenido creencias inusuales que otras personas no comparten, como pensar que alguien está controlando sus pensamientos o que tiene poderes especiales?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'scid5-q5',
        text: '¿Ha escuchado voces o visto cosas que otras personas no pueden ver o escuchar?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'scid5-q6',
        text: '¿Ha tenido pensamientos de hacerse daño o de que estaría mejor muerto?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'scid5-q7',
        text: '¿Ha tenido períodos de ansiedad intensa que aparecen de repente y alcanzan su máximo en minutos, con síntomas como palpitaciones, sudoración o miedo a perder el control?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'scid5-q8',
        text: '¿Ha experimentado recuerdos angustiosos, pesadillas o reacciones físicas relacionadas con un evento traumático que vivió?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
    ],
  },

  'adhd': {
    id: 'adhd',
    title: 'TDAH Screening (ASRS-v1.1)',
    description: 'Cuestionario de auto-reporte para detectar síntomas de Trastorno por Déficit de Atención e Hiperactividad en adultos. Responde según los últimos 6 meses.',
    questions: [
      {
        id: 'adhd-q1',
        text: '¿Con qué frecuencia tiene dificultad para terminar los detalles finales de un proyecto, una vez que las partes desafiantes ya están completadas?',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Muy a menudo' },
        ],
      },
      {
        id: 'adhd-q2',
        text: '¿Con qué frecuencia tiene dificultad para organizarse cuando tiene que completar una tarea que requiere organización?',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Muy a menudo' },
        ],
      },
      {
        id: 'adhd-q3',
        text: '¿Con qué frecuencia tiene problemas para recordar citas u obligaciones?',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Muy a menudo' },
        ],
      },
      {
        id: 'adhd-q4',
        text: 'Cuando tiene una tarea que requiere mucha reflexión, ¿con qué frecuencia evita o retrasa el comenzarla?',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Muy a menudo' },
        ],
      },
      {
        id: 'adhd-q5',
        text: '¿Con qué frecuencia se retuerce o agita con las manos o los pies cuando tiene que permanecer sentado por mucho tiempo?',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Muy a menudo' },
        ],
      },
      {
        id: 'adhd-q6',
        text: '¿Con qué frecuencia se siente inquieto o como si tuviera un motor funcionando?',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Raramente' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Muy a menudo' },
        ],
      },
    ],
  },

  'substance': {
    id: 'substance',
    title: 'Screening Consumo (CAGE)',
    description: 'Cuestionario breve para detectar posibles problemas con el consumo de alcohol o sustancias. Responde con honestidad.',
    questions: [
      {
        id: 'substance-q1',
        text: '¿Ha sentido alguna vez que debería beber o consumir menos?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'substance-q2',
        text: '¿Le ha molestado que la gente le critique su forma de beber o consumir?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'substance-q3',
        text: '¿Se ha sentido alguna vez mal o culpable por su forma de beber o consumir?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'substance-q4',
        text: '¿Alguna vez ha necesitado beber o consumir algo al despertar para calmar sus nervios o eliminar una resaca?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
    ],
  },

  'eating': {
    id: 'eating',
    title: 'Screening Alimentario (SCOFF)',
    description: 'Cuestionario breve para detectar posibles trastornos alimentarios. Responde con honestidad.',
    questions: [
      {
        id: 'eating-q1',
        text: '¿Se provoca el vómito porque se siente incómodamente lleno?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'eating-q2',
        text: '¿Le preocupa que haya perdido el control sobre cuánto come?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'eating-q3',
        text: '¿Ha perdido recientemente más de 6 kilogramos (aproximadamente 13 libras) en un período de 3 meses?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'eating-q4',
        text: '¿Cree que está gordo/a aunque otros le digan que está demasiado delgado/a?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
      {
        id: 'eating-q5',
        text: '¿Diría que la comida domina su vida?',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Sí' },
        ],
      },
    ],
  },

  'ptsd-pcl5': {
    id: 'ptsd-pcl5',
    title: 'PCL-5: Lista de Verificación de Trauma (Profesional)',
    description: 'Evaluación clínica completa de 20 ítems para monitorear la severidad de los síntomas de estrés postraumático según el DSM-5. Responde según la última semana.',
    questions: [
      {
        id: 'pcl5-q1',
        text: 'Recuerdos repetitivos, angustiosos e involuntarios sobre el evento traumático',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q2',
        text: 'Sueños angustiosos recurrentes relacionados con el evento traumático',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q3',
        text: 'Reacciones de disociación (flashbacks) en las que siente o actúa como si el evento traumático estuviera ocurriendo de nuevo',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q4',
        text: 'Malestar psicológico intenso o prolongado cuando se expone a recordatorios del evento traumático',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q5',
        text: 'Reacciones fisiológicas intensas (palpitaciones, sudoración, temblores) cuando se expone a recordatorios del evento',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q6',
        text: 'Evitar recuerdos, pensamientos o sentimientos relacionados con el evento traumático',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q7',
        text: 'Evitar recordatorios externos (personas, lugares, conversaciones, actividades, objetos, situaciones) que le recuerdan el evento',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q8',
        text: 'Incapacidad de recordar aspectos importantes del evento traumático (amnesia relacionada con el trauma)',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q9',
        text: 'Creencias negativas persistentes y exageradas sobre usted mismo, otros o el mundo',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q10',
        text: 'Pensamientos distorsionados persistentes sobre las causas o consecuencias del evento que le llevan a culparse a sí mismo o a otros',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q11',
        text: 'Estado emocional negativo persistente (miedo, horror, ira, culpa, vergüenza)',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q12',
        text: 'Pérdida de interés o participación significativa en actividades que antes disfrutaba',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q13',
        text: 'Sentimientos de desapego o extrañeza hacia otras personas',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q14',
        text: 'Incapacidad persistente de experimentar emociones positivas (felicidad, satisfacción, sentimientos de amor)',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q15',
        text: 'Comportamiento irritable y arrebatos de ira (con o sin provocación) expresados hacia personas u objetos',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q16',
        text: 'Comportamiento imprudente o autodestructivo',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q17',
        text: 'Hipervigilancia (estado de alerta constante)',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q18',
        text: 'Respuesta de sobresalto exagerada',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q19',
        text: 'Problemas de concentración',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
      {
        id: 'pcl5-q20',
        text: 'Alteraciones del sueño (dificultad para conciliar o mantener el sueño, sueño inquieto)',
        options: [
          { value: 0, label: 'En absoluto' },
          { value: 1, label: 'Un poco' },
          { value: 2, label: 'Moderadamente' },
          { value: 3, label: 'Bastante' },
          { value: 4, label: 'Extremadamente' },
        ],
      },
    ],
  },
};

