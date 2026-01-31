/**
 * Shadow Number Analysis - Polaridades Luz/Sombra por Número
 * 
 * Cada número tiene una expresión luminosa y una expresión sombría.
 * Las "ausencias" en el mapa numerológico pueden indicar áreas de sombra a trabajar.
 */

export interface NumberPolarity {
  number: number;
  lightExpression: {
    title: string;
    description: string;
    keywords: string[];
    gifts: string[];
  };
  shadowExpression: {
    title: string;
    description: string;
    keywords: string[];
    challenges: string[];
    originWound?: string;
  };
  integrationPath: string;
  affirmation: string;
  correspondingSefira: string;
  correspondingQliphah: string;
}

export const NUMBER_POLARITIES: NumberPolarity[] = [
  {
    number: 1,
    lightExpression: {
      title: 'El Iniciador',
      description: 'Liderazgo natural, independencia, originalidad, capacidad de comenzar nuevos ciclos.',
      keywords: ['liderazgo', 'independencia', 'originalidad', 'iniciativa', 'pionero'],
      gifts: ['Capacidad de innovar', 'Coraje para comenzar', 'Visión clara', 'Autoconfianza'],
    },
    shadowExpression: {
      title: 'El Tirano Solitario',
      description: 'Egocentrismo, aislamiento autoimpuesto, terquedad, dominación sobre otros.',
      keywords: ['egoísmo', 'soledad', 'terquedad', 'dominación', 'arrogancia'],
      challenges: ['Incapacidad de trabajar en equipo', 'Miedo a pedir ayuda', 'Necesidad de control'],
      originWound: 'Herida de no ser visto/reconocido en la infancia.',
    },
    integrationPath: 'Liderar desde el servicio, no desde el ego. Mantener la independencia mientras se valora la interdependencia.',
    affirmation: 'Lidero con sabiduría y permito que otros brillen junto a mí.',
    correspondingSefira: 'keter',
    correspondingQliphah: 'thaumiel',
  },
  {
    number: 2,
    lightExpression: {
      title: 'El Diplomático',
      description: 'Sensibilidad, cooperación, intuición, capacidad de mediar y crear armonía.',
      keywords: ['cooperación', 'sensibilidad', 'diplomacia', 'intuición', 'receptividad'],
      gifts: ['Empatía profunda', 'Habilidad para negociar', 'Intuición aguda', 'Paciencia'],
    },
    shadowExpression: {
      title: 'El Dependiente Invisible',
      description: 'Codependencia, pérdida de identidad en otros, indecisión paralizante, pasividad extrema.',
      keywords: ['codependencia', 'indecisión', 'invisibilidad', 'pasividad', 'sumisión'],
      challenges: ['Miedo al conflicto', 'No saber qué quiere', 'Vivir a través de otros'],
      originWound: 'Herida de abandono; necesidad de otros para sentir valor.',
    },
    integrationPath: 'Desarrollar identidad propia mientras se mantiene la sensibilidad hacia otros.',
    affirmation: 'Soy completo/a en mí mismo/a mientras me conecto amorosamente con otros.',
    correspondingSefira: 'chokmah',
    correspondingQliphah: 'ghagiel',
  },
  {
    number: 3,
    lightExpression: {
      title: 'El Creador Expresivo',
      description: 'Creatividad desbordante, alegría, comunicación inspiradora, optimismo contagioso.',
      keywords: ['creatividad', 'expresión', 'alegría', 'comunicación', 'optimismo'],
      gifts: ['Talento artístico', 'Carisma natural', 'Capacidad de inspirar', 'Humor sanador'],
    },
    shadowExpression: {
      title: 'El Disperso Superficial',
      description: 'Dispersión de energía, superficialidad, escapismo a través de placeres, chismes y drama.',
      keywords: ['dispersión', 'superficialidad', 'escapismo', 'drama', 'frivolidad'],
      challenges: ['No terminar lo que empieza', 'Evitar la profundidad', 'Adicción a la atención'],
      originWound: 'Herida de no ser escuchado; creatividad no valorada.',
    },
    integrationPath: 'Canalizar la creatividad con disciplina. Encontrar profundidad en la expresión.',
    affirmation: 'Mi creatividad fluye con propósito y profundidad.',
    correspondingSefira: 'binah',
    correspondingQliphah: 'satariel',
  },
  {
    number: 4,
    lightExpression: {
      title: 'El Constructor Estable',
      description: 'Disciplina, confiabilidad, capacidad de crear estructuras duraderas, practicidad.',
      keywords: ['estabilidad', 'disciplina', 'construcción', 'confiabilidad', 'orden'],
      gifts: ['Capacidad organizativa', 'Paciencia para el proceso', 'Lealtad', 'Sentido práctico'],
    },
    shadowExpression: {
      title: 'El Rígido Estancado',
      description: 'Rigidez extrema, miedo al cambio, control obsesivo, limitación autoimpuesta.',
      keywords: ['rigidez', 'estancamiento', 'control', 'terquedad', 'limitación'],
      challenges: ['Resistencia al cambio', 'Trabajo excesivo', 'Falta de espontaneidad'],
      originWound: 'Herida de inseguridad; necesidad de control para sentirse seguro.',
    },
    integrationPath: 'Crear estructura flexible. Encontrar seguridad en el fluir, no solo en lo fijo.',
    affirmation: 'Construyo con flexibilidad, permitiendo que la vida fluya a través de mis estructuras.',
    correspondingSefira: 'chesed',
    correspondingQliphah: 'gamchicoth',
  },
  {
    number: 5,
    lightExpression: {
      title: 'El Aventurero Libre',
      description: 'Libertad, adaptabilidad, curiosidad, capacidad de transformar y renovar.',
      keywords: ['libertad', 'aventura', 'cambio', 'versatilidad', 'curiosidad'],
      gifts: ['Adaptabilidad', 'Valentía para explorar', 'Magnetismo personal', 'Capacidad de renovación'],
    },
    shadowExpression: {
      title: 'El Adicto al Caos',
      description: 'Inestabilidad crónica, adicciones, irresponsabilidad, miedo al compromiso.',
      keywords: ['inestabilidad', 'adicción', 'irresponsabilidad', 'escapismo', 'caos'],
      challenges: ['Huir del compromiso', 'Buscar estimulación constante', 'Relaciones superficiales'],
      originWound: 'Herida de restricción; necesidad de escapar de la opresión.',
    },
    integrationPath: 'Encontrar libertad dentro del compromiso. Transformar sin destruir.',
    affirmation: 'Soy libre dentro de mis compromisos conscientes.',
    correspondingSefira: 'gevurah',
    correspondingQliphah: 'golachab',
  },
  {
    number: 6,
    lightExpression: {
      title: 'El Sanador Armónico',
      description: 'Amor incondicional, responsabilidad hacia otros, belleza, armonía familiar.',
      keywords: ['amor', 'armonía', 'responsabilidad', 'belleza', 'sanación'],
      gifts: ['Capacidad de cuidar', 'Sentido estético', 'Crear hogares amorosos', 'Mediación'],
    },
    shadowExpression: {
      title: 'El Mártir Controlador',
      description: 'Sacrificio excesivo, control a través del cuidado, perfeccionismo paralizante.',
      keywords: ['sacrificio', 'martirio', 'perfeccionismo', 'control emocional', 'culpa'],
      challenges: ['Dar para recibir', 'Perfeccionismo en relaciones', 'Incapacidad de recibir'],
      originWound: 'Herida de rechazo; necesidad de ser "perfecto" para ser amado.',
    },
    integrationPath: 'Amar sin sacrificarse. Recibir tanto como se da.',
    affirmation: 'Doy y recibo amor en perfecto equilibrio.',
    correspondingSefira: 'tiferet',
    correspondingQliphah: 'thagirion',
  },
  {
    number: 7,
    lightExpression: {
      title: 'El Buscador Místico',
      description: 'Sabiduría espiritual, introspección, análisis profundo, conexión con lo místico.',
      keywords: ['sabiduría', 'espiritualidad', 'introspección', 'análisis', 'misterio'],
      gifts: ['Intuición espiritual', 'Capacidad analítica', 'Profundidad mental', 'Discernimiento'],
    },
    shadowExpression: {
      title: 'El Ermitaño Paranoico',
      description: 'Aislamiento extremo, desconfianza crónica, frialdad emocional, intelectualización.',
      keywords: ['aislamiento', 'paranoia', 'frialdad', 'desconfianza', 'intelectualización'],
      challenges: ['Vivir en la cabeza', 'Evitar la intimidad', 'Crítica excesiva'],
      originWound: 'Herida de traición; el mundo no es seguro para confiar.',
    },
    integrationPath: 'Conectar la sabiduría con el corazón. Confiar mientras se mantiene el discernimiento.',
    affirmation: 'Mi sabiduría incluye la apertura del corazón.',
    correspondingSefira: 'netzach',
    correspondingQliphah: 'arab_zaraq',
  },
  {
    number: 8,
    lightExpression: {
      title: 'El Maestro Abundante',
      description: 'Poder personal, abundancia material y espiritual, capacidad ejecutiva, autoridad.',
      keywords: ['poder', 'abundancia', 'autoridad', 'manifestación', 'logro'],
      gifts: ['Capacidad de manifestar', 'Liderazgo ejecutivo', 'Visión de negocios', 'Determinación'],
    },
    shadowExpression: {
      title: 'El Codicioso Despiadado',
      description: 'Obsesión con el poder, codicia, manipulación para el éxito, falta de ética.',
      keywords: ['codicia', 'manipulación', 'obsesión', 'despiadado', 'materialismo'],
      challenges: ['El fin justifica los medios', 'Vacío a pesar del éxito', 'Relaciones transaccionales'],
      originWound: 'Herida de impotencia; necesidad de poder para sentirse seguro.',
    },
    integrationPath: 'Usar el poder para el bien común. Encontrar abundancia en dar, no solo en tener.',
    affirmation: 'Mi poder está al servicio del bien mayor.',
    correspondingSefira: 'hod',
    correspondingQliphah: 'samael',
  },
  {
    number: 9,
    lightExpression: {
      title: 'El Humanitario Sabio',
      description: 'Compasión universal, sabiduría completadora, servicio desinteresado, maestría espiritual.',
      keywords: ['compasión', 'humanitarismo', 'sabiduría', 'culminación', 'servicio'],
      gifts: ['Amor universal', 'Capacidad de completar ciclos', 'Inspiración espiritual', 'Sanación colectiva'],
    },
    shadowExpression: {
      title: 'El Salvador Herido',
      description: 'Complejo de mesías, pérdida de límites personales, escapismo espiritual, victimismo.',
      keywords: ['mesianismo', 'victimismo', 'límites difusos', 'escapismo', 'sacrificio'],
      challenges: ['Salvar a otros sin que lo pidan', 'No cuidar de sí mismo', 'Ilusiones espirituales'],
      originWound: 'Herida de humillación; necesidad de ser "especial" para tener valor.',
    },
    integrationPath: 'Servir sin perderse. Mantener límites mientras se expande la compasión.',
    affirmation: 'Sirvo al mundo cuidando también de mí mismo/a.',
    correspondingSefira: 'yesod',
    correspondingQliphah: 'gamaliel',
  },
  {
    number: 11,
    lightExpression: {
      title: 'El Canal Inspirado',
      description: 'Intuición elevada, inspiración divina, capacidad de iluminar a otros, visión espiritual.',
      keywords: ['intuición', 'inspiración', 'iluminación', 'canal', 'visión'],
      gifts: ['Clarividencia', 'Capacidad de inspirar masas', 'Conexión espiritual', 'Liderazgo visionario'],
    },
    shadowExpression: {
      title: 'El Fanático Desconectado',
      description: 'Fanatismo, nerviosismo extremo, desconexión de la realidad, inflación espiritual.',
      keywords: ['fanatismo', 'ansiedad', 'delirio', 'desconexión', 'inflación'],
      challenges: ['Vivir en las nubes', 'Nerviosismo crónico', 'Creerse superior espiritualmente'],
      originWound: 'Herida de no encajar; buscar significado especial para compensar.',
    },
    integrationPath: 'Anclar la inspiración en la tierra. Ser canal sin inflarse.',
    affirmation: 'Canalizo luz divina con los pies firmemente en la tierra.',
    correspondingSefira: 'keter',
    correspondingQliphah: 'thaumiel',
  },
  {
    number: 22,
    lightExpression: {
      title: 'El Maestro Constructor',
      description: 'Capacidad de manifestar visiones en realidad, construcción a gran escala, legado duradero.',
      keywords: ['construcción', 'manifestación', 'legado', 'maestría', 'visión práctica'],
      gifts: ['Materializar lo imposible', 'Liderazgo transformador', 'Visión a largo plazo', 'Impacto mundial'],
    },
    shadowExpression: {
      title: 'El Megalómano Destructivo',
      description: 'Megalomanía, proyectos imposibles, presión autoimpuesta, colapso bajo el peso de las expectativas.',
      keywords: ['megalomanía', 'presión', 'colapso', 'expectativas', 'autodestrucción'],
      challenges: ['Proyectos que abruman', 'Ignorar los propios límites', 'Destruir lo construido'],
      originWound: 'Herida de inadecuación; necesidad de lograr lo imposible para sentir valor.',
    },
    integrationPath: 'Construir paso a paso. Aceptar que incluso los grandes logros tienen límites humanos.',
    affirmation: 'Construyo mi legado un paso a la vez, honrando mis límites humanos.',
    correspondingSefira: 'malkuth',
    correspondingQliphah: 'lilith',
  },
  {
    number: 33,
    lightExpression: {
      title: 'El Sanador Crístico',
      description: 'Amor incondicional en acción, sanación a nivel colectivo, maestro espiritual, compasión absoluta.',
      keywords: ['sanación', 'amor crístico', 'maestría', 'compasión', 'servicio elevado'],
      gifts: ['Sanación profunda', 'Inspiración espiritual masiva', 'Sacrificio consciente', 'Amor transformador'],
    },
    shadowExpression: {
      title: 'El Mártir Cósmico',
      description: 'Complejo de Cristo/mártir extremo, autodestrucción por "la causa", pérdida total de sí mismo.',
      keywords: ['martirio', 'autodestrucción', 'mesianismo extremo', 'pérdida de identidad', 'sacrificio tóxico'],
      challenges: ['Sacrificarse hasta la destrucción', 'Creerse "elegido" para sufrir', 'No poder vivir vida "normal"'],
      originWound: 'Herida existencial; sentir que debe "salvar al mundo" para justificar su existencia.',
    },
    integrationPath: 'Servir desde la plenitud, no desde el vacío. Sanar al mundo sanándose primero.',
    affirmation: 'Mi servicio al mundo comienza con el amor hacia mí mismo/a.',
    correspondingSefira: 'tiferet',
    correspondingQliphah: 'thagirion',
  },
];

/**
 * Get shadow analysis for missing numbers (ausencias)
 */
export function getShadowAnalysisForMissingNumbers(missingNumbers: number[]): Array<{
  number: number;
  shadowWork: string;
  affirmation: string;
  integrationPath: string;
}> {
  return missingNumbers.map(num => {
    const polarity = NUMBER_POLARITIES.find(p => p.number === num);
    if (polarity) {
      return {
        number: num,
        shadowWork: `La ausencia del ${num} puede indicar: ${polarity.shadowExpression.originWound || polarity.shadowExpression.description}`,
        affirmation: polarity.affirmation,
        integrationPath: polarity.integrationPath,
      };
    }
    return {
      number: num,
      shadowWork: `La ausencia del ${num} es un área a explorar en tu camino.`,
      affirmation: 'Integro todas las energías numéricas en mi ser.',
      integrationPath: 'Observa cómo esta energía puede manifestarse en tu vida.',
    };
  });
}

/**
 * Get polarity for a specific number
 */
export function getNumberPolarity(num: number): NumberPolarity | null {
  return NUMBER_POLARITIES.find(p => p.number === num) || null;
}
