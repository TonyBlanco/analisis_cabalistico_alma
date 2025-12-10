// Recomendaciones Naturales: Infusiones, Meditaciones y Remedios Naturales

export interface NaturalRemedy {
  id: string;
  name: string;
  type: 'infusion' | 'meditation' | 'exercise' | 'food' | 'supplement' | 'practice';
  system: string[];
  benefits: string[];
  instructions: string;
  frequency: string;
  duration: string;
  precautions?: string[];
  ingredients?: string[];
  difficulty: 'easy' | 'medium' | 'advanced';
}

// ==================== INFUSIONES MEDICINALES ====================

export const HERBAL_INFUSIONS: NaturalRemedy[] = [
  {
    id: 'inf-digestivo-01',
    name: 'Infusión Digestiva de Manzanilla y Menta',
    type: 'infusion',
    system: ['Sistema Digestivo'],
    benefits: [
      'Reduce inflamación intestinal',
      'Alivia gases y distensión abdominal',
      'Calma náuseas y malestar estomacal',
      'Favorece la digestión',
    ],
    instructions: '1. Hervir 1 taza de agua\n2. Agregar 1 cucharadita de manzanilla y 1 de menta\n3. Dejar reposar 5-7 minutos tapado\n4. Colar y beber tibio',
    frequency: '2-3 veces al día, después de comidas',
    duration: '2-4 semanas',
    ingredients: ['Manzanilla seca', 'Menta piperita', 'Agua'],
    difficulty: 'easy',
    precautions: ['No consumir si es alérgico a plantas de la familia Asteraceae'],
  },
  {
    id: 'inf-nervioso-01',
    name: 'Té Calmante de Valeriana y Pasiflora',
    type: 'infusion',
    system: ['Sistema Nervioso'],
    benefits: [
      'Reduce ansiedad y nerviosismo',
      'Mejora la calidad del sueño',
      'Calma tensión muscular',
      'Equilibra el sistema nervioso',
    ],
    instructions: '1. Hervir 1 taza de agua\n2. Agregar 1 cucharadita de raíz de valeriana y 1 de pasiflora\n3. Dejar reposar 10 minutos\n4. Colar y beber tibio',
    frequency: '1 taza por la noche, 30 minutos antes de dormir',
    duration: '3-6 semanas',
    ingredients: ['Raíz de valeriana', 'Pasiflora', 'Opcional: miel'],
    difficulty: 'easy',
    precautions: ['No combinar con medicamentos sedantes', 'Evitar durante el embarazo'],
  },
  {
    id: 'inf-circulatorio-01',
    name: 'Infusión Circulatoria de Jengibre y Cúrcuma',
    type: 'infusion',
    system: ['Sistema Circulatorio'],
    benefits: [
      'Mejora la circulación sanguínea',
      'Reduce inflamación vascular',
      'Fortalece el sistema cardiovascular',
      'Efecto anticoagulante natural',
    ],
    instructions: '1. Hervir 2 tazas de agua\n2. Agregar 1 cm de jengibre fresco rallado y 1/2 cucharadita de cúrcuma\n3. Cocinar a fuego lento 10 minutos\n4. Agregar jugo de 1/2 limón\n5. Colar y beber',
    frequency: '1-2 veces al día',
    duration: 'Uso continuo',
    ingredients: ['Jengibre fresco', 'Cúrcuma en polvo', 'Limón', 'Pimienta negra (mejora absorción)'],
    difficulty: 'medium',
    precautions: ['Consultar si toma anticoagulantes', 'Puede irritar el estómago en exceso'],
  },
  {
    id: 'inf-respiratorio-01',
    name: 'Vapor e Infusión de Eucalipto y Tomillo',
    type: 'infusion',
    system: ['Sistema Respiratorio'],
    benefits: [
      'Despeja vías respiratorias',
      'Expectorante natural',
      'Antimicrobiano y antiséptico',
      'Alivia la tos',
    ],
    instructions: '1. Hervir 1 litro de agua\n2. Agregar 2 cucharadas de eucalipto y 1 de tomillo\n3. Para vapor: inhalar el vapor 10 minutos con toalla sobre la cabeza\n4. Para beber: dejar reposar 15 minutos, colar y tomar tibio',
    frequency: 'Vapor 2 veces al día / Infusión 3 veces al día',
    duration: 'Durante síntomas respiratorios',
    ingredients: ['Hojas de eucalipto', 'Tomillo', 'Opcional: miel de eucalipto'],
    difficulty: 'medium',
    precautions: ['No consumir aceite esencial directamente', 'Precaución con niños pequeños'],
  },
  {
    id: 'inf-esqueletico-01',
    name: 'Té de Cola de Caballo y Ortiga',
    type: 'infusion',
    system: ['Sistema Esquelético'],
    benefits: [
      'Rico en minerales para huesos',
      'Fortalece tejido óseo',
      'Reduce inflamación articular',
      'Alto contenido de silicio',
    ],
    instructions: '1. Hervir 2 tazas de agua\n2. Agregar 1 cucharada de cola de caballo y 1 de ortiga\n3. Dejar reposar 10 minutos\n4. Colar y beber',
    frequency: '2 tazas al día',
    duration: '2-3 meses (con descanso de 1 semana cada mes)',
    ingredients: ['Cola de caballo', 'Ortiga', 'Opcional: limón'],
    difficulty: 'easy',
    precautions: ['No usar en caso de problemas renales', 'Consultar si toma medicamentos diuréticos'],
  },
  {
    id: 'inf-muscular-01',
    name: 'Infusión Relajante Muscular de Romero y Árnica',
    type: 'infusion',
    system: ['Sistema Muscular'],
    benefits: [
      'Alivia tensión muscular',
      'Reduce dolor por contracturas',
      'Mejora recuperación post-ejercicio',
      'Antiinflamatorio natural',
    ],
    instructions: '1. Hervir 1 taza de agua\n2. Agregar 1 cucharadita de romero y flores de árnica (uso interno solo variedades apropiadas)\n3. Dejar reposar 7-10 minutos\n4. Colar y beber tibio',
    frequency: '2 veces al día',
    duration: 'Durante período de molestias musculares',
    ingredients: ['Romero', 'Árnica (solo variedades de uso interno)', 'Jengibre opcional'],
    difficulty: 'medium',
    precautions: ['IMPORTANTE: Árnica de uso interno debe ser variedad específica', 'Consultar con herbolario experto'],
  },
];

// ==================== MEDITACIONES Y PRÁCTICAS ====================

export const MEDITATION_PRACTICES: NaturalRemedy[] = [
  {
    id: 'med-nervioso-01',
    name: 'Meditación de Respiración 4-7-8',
    type: 'meditation',
    system: ['Sistema Nervioso', 'Sistema Respiratorio'],
    benefits: [
      'Reduce ansiedad inmediatamente',
      'Calma el sistema nervioso',
      'Mejora la oxigenación',
      'Induce relajación profunda',
    ],
    instructions: '1. Siéntate cómodamente con la espalda recta\n2. Exhala completamente por la boca\n3. Inhala por la nariz contando hasta 4\n4. Sostén la respiración contando hasta 7\n5. Exhala completamente por la boca contando hasta 8\n6. Repite el ciclo 4 veces',
    frequency: '2-3 veces al día, especialmente antes de dormir',
    duration: '5 minutos',
    difficulty: 'easy',
  },
  {
    id: 'med-digestivo-01',
    name: 'Meditación de Sanación Digestiva con Visualización',
    type: 'meditation',
    system: ['Sistema Digestivo'],
    benefits: [
      'Reduce estrés digestivo',
      'Mejora la conexión mente-intestino',
      'Alivia síntomas de intestino irritable',
      'Promueve digestión saludable',
    ],
    instructions: '1. Acuéstate boca arriba cómodamente\n2. Coloca tus manos sobre el abdomen\n3. Respira profundo sintiendo tu abdomen expandirse\n4. Visualiza una luz cálida dorada en tu estómago\n5. Con cada respiración, visualiza esta luz sanando y relajando tu sistema digestivo\n6. Mantén esta visualización por 10 minutos\n7. Afirma: "Mi sistema digestivo funciona en perfecta armonía"',
    frequency: 'Diariamente, especialmente después de comidas',
    duration: '10-15 minutos',
    difficulty: 'medium',
  },
  {
    id: 'med-circulatorio-01',
    name: 'Meditación de Flujo Energético Circulatorio',
    type: 'meditation',
    system: ['Sistema Circulatorio'],
    benefits: [
      'Mejora la circulación',
      'Reduce presión arterial por estrés',
      'Equilibra ritmo cardíaco',
      'Aumenta conciencia corporal',
    ],
    instructions: '1. Siéntate o acuéstate cómodamente\n2. Visualiza tu sangre fluyendo por todo tu cuerpo\n3. Con cada inhalación, visualiza sangre oxigenada viajando a cada célula\n4. Con cada exhalación, visualiza toxinas siendo eliminadas\n5. Siente un pulso rítmico y armonioso en todo tu cuerpo\n6. Mantén esta consciencia por 15 minutos',
    frequency: '1 vez al día',
    duration: '15-20 minutos',
    difficulty: 'medium',
  },
  {
    id: 'med-muscular-01',
    name: 'Relajación Muscular Progresiva de Jacobson',
    type: 'meditation',
    system: ['Sistema Muscular', 'Sistema Nervioso'],
    benefits: [
      'Libera tensión muscular acumulada',
      'Reduce dolor por contracturas',
      'Mejora consciencia corporal',
      'Induce relajación profunda',
    ],
    instructions: '1. Acuéstate cómodamente\n2. Comienza por los pies: tensa los músculos 5 segundos, luego relaja completamente\n3. Avanza por cada grupo muscular: pantorrillas, muslos, glúteos, abdomen, pecho, brazos, manos, cuello, cara\n4. Al llegar a la cabeza, mantén todo el cuerpo relajado por 5 minutos\n5. Respira profundamente sintiendo la relajación total',
    frequency: 'Diariamente, idealmente antes de dormir',
    duration: '20-30 minutos',
    difficulty: 'medium',
  },
  {
    id: 'med-esqueletico-01',
    name: 'Visualización de Fortalecimiento Óseo',
    type: 'meditation',
    system: ['Sistema Esquelético'],
    benefits: [
      'Promueve salud ósea',
      'Reduce dolor articular',
      'Mejora postura consciente',
      'Fortalece conexión mente-cuerpo',
    ],
    instructions: '1. Siéntate con la columna recta\n2. Visualiza tu esqueleto como una estructura de luz blanca\n3. Imagina esta luz fortaleciéndose y brillando más\n4. Visualiza tus huesos absorbiendonutrientes y energía\n5. Siente tu columna alargándose y fortaleciéndose\n6. Mantén esta visualización por 10 minutos',
    frequency: '3-4 veces por semana',
    duration: '10-15 minutos',
    difficulty: 'medium',
  },
];

// ==================== EJERCICIOS Y PRÁCTICAS FÍSICAS ====================

export const PHYSICAL_PRACTICES: NaturalRemedy[] = [
  {
    id: 'ex-respiratorio-01',
    name: 'Respiración Diafragmática Profunda',
    type: 'exercise',
    system: ['Sistema Respiratorio'],
    benefits: [
      'Aumenta capacidad pulmonar',
      'Mejora oxigenación',
      'Fortalece músculos respiratorios',
      'Reduce estrés',
    ],
    instructions: '1. Acuéstate boca arriba con rodillas dobladas\n2. Coloca una mano en el pecho y otra en el abdomen\n3. Inhala profundamente por la nariz haciendo que solo la mano del abdomen se eleve\n4. Exhala lentamente por la boca\n5. Practica 10 respiraciones conscientes',
    frequency: '3 veces al día, 10 respiraciones cada vez',
    duration: '5 minutos por sesión',
    difficulty: 'easy',
  },
  {
    id: 'ex-circulatorio-01',
    name: 'Caminata Consciente 30 Minutos',
    type: 'exercise',
    system: ['Sistema Circulatorio', 'Sistema Muscular'],
    benefits: [
      'Mejora circulación general',
      'Fortalece corazón',
      'Reduce presión arterial',
      'Aumenta energía',
    ],
    instructions: '1. Camina a paso moderado durante 30 minutos\n2. Mantén consciencia en tu respiración\n3. Siente tu corazón bombeando y tu sangre circulando\n4. Aumenta gradualmente la intensidad si es cómodo',
    frequency: 'Diariamente',
    duration: '30 minutos',
    difficulty: 'easy',
  },
  {
    id: 'ex-esqueletico-01',
    name: 'Estiramientos de Columna y Articulaciones',
    type: 'exercise',
    system: ['Sistema Esquelético', 'Sistema Muscular'],
    benefits: [
      'Mejora flexibilidad',
      'Reduce dolor articular',
      'Previene rigidez',
      'Mejora postura',
    ],
    instructions: '1. Gato-vaca (columna): 10 repeticiones\n2. Rotación de cuello: 5 cada lado\n3. Círculos de hombros: 10 adelante, 10 atrás\n4. Rotación de cadera: 10 cada lado\n5. Flexión de rodillas: 10 repeticiones\n6. Círculos de tobillos: 10 cada pie',
    frequency: 'Diariamente, idealmente por la mañana',
    duration: '15 minutos',
    difficulty: 'easy',
  },
];

// ==================== RECOMENDACIONES ALIMENTARIAS ====================

export const FOOD_RECOMMENDATIONS: NaturalRemedy[] = [
  {
    id: 'food-digestivo-01',
    name: 'Dieta Rica en Fibra y Probióticos',
    type: 'food',
    system: ['Sistema Digestivo'],
    benefits: [
      'Mejora tránsito intestinal',
      'Fortalece microbiota',
      'Reduce inflamación',
      'Previene estreñimiento',
    ],
    instructions: 'Incluir diariamente:\n- Yogurt natural o kéfir (1 taza)\n- Vegetales de hoja verde\n- Frutas con piel (manzanas, peras)\n- Granos enteros (avena, quinoa)\n- Legumbres (lentejas, garbanzos)\n- Chucrut o kimchi (fermentados)',
    frequency: 'Incorporar en cada comida principal',
    duration: 'Cambio de estilo de vida permanente',
    difficulty: 'easy',
  },
  {
    id: 'food-circulatorio-01',
    name: 'Alimentos Cardio-Protectores',
    type: 'food',
    system: ['Sistema Circulatorio'],
    benefits: [
      'Reduce colesterol',
      'Mejora salud cardiovascular',
      'Antiinflamatorio',
      'Regula presión arterial',
    ],
    instructions: 'Consumir regularmente:\n- Pescados grasos (salmón, sardinas) 3x/semana\n- Nueces y almendras (30g diarios)\n- Aceite de oliva extra virgen\n- Ajo crudo (1-2 dientes)\n- Aguacate\n- Chocolate oscuro 70% (20g)\n- Té verde (2-3 tazas)',
    frequency: 'Diariamente',
    duration: 'Estilo de vida',
    difficulty: 'medium',
  },
  {
    id: 'food-esqueletico-01',
    name: 'Dieta para Fortalecimiento Óseo',
    type: 'food',
    system: ['Sistema Esquelético'],
    benefits: [
      'Fortalece huesos',
      'Previene osteoporosis',
      'Mejora densidad ósea',
      'Reduce inflamación articular',
    ],
    instructions: 'Alimentos clave:\n- Lácteos (leche, yogurt, queso): 2-3 porciones\n- Vegetales de hoja verde oscuro (col rizada, espinacas)\n- Pescados con huesos blandos (sardinas)\n- Semillas de sésamo y chía\n- Almendras\n- Exponerse al sol 15 minutos diarios (vitamina D)',
    frequency: 'Diariamente',
    duration: 'Permanente',
    difficulty: 'easy',
  },
];

/**
 * Obtiene recomendaciones naturales según sistema afectado
 */
export function getNaturalRemediesBySystem(system: string): NaturalRemedy[] {
  const allRemedies = [
    ...HERBAL_INFUSIONS,
    ...MEDITATION_PRACTICES,
    ...PHYSICAL_PRACTICES,
    ...FOOD_RECOMMENDATIONS,
  ];
  
  return allRemedies.filter(remedy => 
    remedy.system.includes(system)
  );
}

/**
 * Genera plan de tratamiento natural personalizado
 */
export function generateNaturalTreatmentPlan(
  affectedSystems: string[],
  severity: 'high' | 'medium' | 'low'
): NaturalRemedy[] {
  const plan: NaturalRemedy[] = [];
  
  affectedSystems.forEach(system => {
    const systemRemedies = getNaturalRemediesBySystem(system);
    
    // Seleccionar según severidad
    const infusion = systemRemedies.find(r => r.type === 'infusion');
    const meditation = systemRemedies.find(r => r.type === 'meditation');
    const exercise = systemRemedies.find(r => r.type === 'exercise');
    const food = systemRemedies.find(r => r.type === 'food');
    
    if (severity === 'high') {
      if (infusion) plan.push(infusion);
      if (meditation) plan.push(meditation);
      if (food) plan.push(food);
    } else if (severity === 'medium') {
      if (infusion) plan.push(infusion);
      if (exercise) plan.push(exercise);
    } else {
      if (meditation) plan.push(meditation);
      if (food) plan.push(food);
    }
  });
  
  return plan;
}
