export type MarketingFeature = {
  title: string;
  description: string;
  iconPaths: [string, string];
};

export type MarketingStep = {
  number: string;
  title: string;
  description: string;
};

export type MarketingTestimonial = {
  text: string;
  initials: string;
  name: string;
  role: string;
};

export type MarketingFaqItem = {
  question: string;
  answer: string;
};

export type MarketingFaqGroup = {
  category: string;
  items: MarketingFaqItem[];
};

export type MarketingModule = {
  title: string;
  summary: string;
  forYou: string;
  forClient: string;
  iconPaths: [string, string];
};

export type MarketingAboutPoint = {
  title: string;
  description: string;
};

export const MARKETING_ABOUT: {
  eyebrow: string;
  title: string;
  lead: string;
  points: MarketingAboutPoint[];
} = {
  eyebrow: 'Qué es Holistica Aplicada',
  title: 'Un espacio de trabajo profesional para acompañar con método',
  lead:
    'Holistica Aplicada es una plataforma (software como servicio) que reúne el análisis simbólico cabalístico y la gestión de tu práctica en un mismo lugar. Conviertes el conocimiento de cada persona —su Árbol de la Vida, sus números y sus patrones— en un acompañamiento estructurado, sesión a sesión.',
  points: [
    {
      title: 'Para quién es',
      description:
        'Terapeutas, coaches y guías de bienestar que trabajan con herramientas simbólicas y quieren una base profesional, ordenada y seria para acompañar a las personas.',
    },
    {
      title: 'Qué resuelve',
      description:
        'Deja de reunir a mano el contexto de cada persona: la plataforma genera los análisis, guarda el historial y te da una visión clara de cada acompañamiento.',
    },
    {
      title: 'Cómo te acompaña',
      description:
        'Un Centro de Aprendizaje integrado te forma en la metodología a tu ritmo, sin necesidad de ser experto en cábala para empezar a trabajar.',
    },
  ],
};

export const MARKETING_FEATURES: MarketingFeature[] = [
  {
    title: 'Gestión de pacientes',
    description:
      'Organiza fichas, historial de sesiones y análisis de todas las personas que acompañas, en un solo lugar.',
    iconPaths: [
      'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
      'M4.8 20c.9-3.4 3.7-5.3 7.2-5.3s6.3 1.9 7.2 5.3',
    ],
  },
  {
    title: 'Análisis profundos',
    description:
      'Informes cabalísticos completos con Árbol de la Vida, números maestros y patrones, generados en minutos.',
    iconPaths: [
      'M12 4.5a2 2 0 1 0 .01 0ZM6 15.5a2 2 0 1 0 .01 0ZM18 15.5a2 2 0 1 0 .01 0Z',
      'M11 8.2 7 15.3M13 8.2l4 7.1M8 17.5h8',
    ],
  },
  {
    title: 'Centro de Aprendizaje + Asistente IA',
    description:
      'Formación continua sobre la metodología y un asistente que responde tus dudas mientras trabajas.',
    iconPaths: [
      'M4 5.5C6.5 4.3 9.4 4.3 12 5.8c2.6-1.5 5.5-1.5 8-.3V18c-2.5-1.2-5.4-1.2-8 .3-2.6-1.5-5.5-1.5-8-.3V5.5Z',
      'M12 5.8v12.5',
    ],
  },
  {
    title: 'Dashboard del terapeuta',
    description:
      'Tu práctica de un vistazo: próximas sesiones, pendientes y evolución de cada acompañamiento.',
    iconPaths: [
      'M4.5 5h15a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
      'M8 15v-3M12 15V9M16 15v-5',
    ],
  },
  {
    title: 'Seguridad y privacidad',
    description:
      'Conexión cifrada y control de accesos. Confidencialidad profesional desde el diseño: solo tú decides quién accede.',
    iconPaths: [
      'M12 3.5 5 6v6c0 4.4 3 7.4 7 8.5 4-1.1 7-4.1 7-8.5V6l-7-2.5Z',
      'M9.2 12l2 2 3.6-3.8',
    ],
  },
  {
    title: 'Actualizaciones continuas',
    description:
      'Nuevas funciones, plantillas y recursos añadidos regularmente, sin coste extra para tu plan.',
    iconPaths: ['M19 12a7 7 0 1 1-2-4.9', 'M19 4.5V8h-3.5'],
  },
];

export const MARKETING_MODULES: MarketingModule[] = [
  {
    title: 'Análisis del Árbol de la Vida',
    summary:
      'Genera un informe simbólico completo a partir del nombre y la fecha de nacimiento de la persona: las 10 Sefirot, números maestros y patrones, en minutos.',
    forYou:
      'Llegas a cada sesión con un mapa estructurado del consultante en lugar de partir de cero.',
    forClient:
      'Recibe una lectura coherente y personalizada, siempre consistente: la misma persona obtiene siempre el mismo análisis.',
    iconPaths: [
      'M12 4.5a2 2 0 1 0 .01 0ZM6 15.5a2 2 0 1 0 .01 0ZM18 15.5a2 2 0 1 0 .01 0Z',
      'M11 8.2 7 15.3M13 8.2l4 7.1M8 17.5h8',
    ],
  },
  {
    title: 'Lectura simbólica · Tirada del Árbol',
    summary:
      'Una tirada visual sobre el Árbol de la Vida que asocia cada posición con su Sefirá, pensada como apoyo a la reflexión y al diálogo en sesión.',
    forYou:
      'Un recurso visual listo para usar que da ritmo y profundidad a la conversación.',
    forClient:
      'Una experiencia clara y cuidada que le ayuda a poner palabras a su proceso.',
    iconPaths: [
      'M12 3v4M12 17v4M3 12h4M17 12h4',
      'M7.8 7.8l2.6 2.6M16.2 7.8l-2.6 2.6M7.8 16.2l2.6-2.6M16.2 16.2l-2.6-2.6',
    ],
  },
  {
    title: 'Gestión de consultantes',
    summary:
      'Fichas, historial de sesiones y análisis de todas las personas que acompañas, organizados en un solo lugar.',
    forYou:
      'Todo el recorrido de cada persona a mano, sin hojas sueltas ni documentos dispersos.',
    forClient:
      'Continuidad real: cada sesión parte de lo trabajado en la anterior.',
    iconPaths: [
      'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
      'M4.8 20c.9-3.4 3.7-5.3 7.2-5.3s6.3 1.9 7.2 5.3',
    ],
  },
  {
    title: 'Dashboard del terapeuta',
    summary:
      'Tu práctica de un vistazo: próximas sesiones, pendientes y evolución de cada acompañamiento.',
    forYou:
      'Sabes en segundos qué tienes hoy y dónde está cada persona en su proceso.',
    forClient: 'Un seguimiento atento, sin que nada se quede en el aire.',
    iconPaths: [
      'M4.5 5h15a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
      'M8 15v-3M12 15V9M16 15v-5',
    ],
  },
  {
    title: 'Centro de Aprendizaje',
    summary:
      'Formación sobre la metodología y recursos para sacar partido a cada análisis, con un asistente que resuelve tus dudas mientras trabajas.',
    forYou:
      'Aprendes a tu ritmo y ganas seguridad con la herramienta desde el primer día.',
    forClient:
      'Se beneficia de un acompañamiento mejor fundamentado y más seguro.',
    iconPaths: [
      'M4 5.5C6.5 4.3 9.4 4.3 12 5.8c2.6-1.5 5.5-1.5 8-.3V18c-2.5-1.2-5.4-1.2-8 .3-2.6-1.5-5.5-1.5-8-.3V5.5Z',
      'M12 5.8v12.5',
    ],
  },
  {
    title: 'Seguridad y consentimiento',
    summary:
      'Conexión cifrada, control de accesos y un consentimiento que se otorga una sola vez y cubre todo el acompañamiento de la persona.',
    forYou:
      'Confidencialidad profesional desde el diseño: solo tú decides quién accede.',
    forClient:
      'Claridad total sobre sus datos y cómo se usan, sin pasos repetidos en cada lectura.',
    iconPaths: [
      'M12 3.5 5 6v6c0 4.4 3 7.4 7 8.5 4-1.1 7-4.1 7-8.5V6l-7-2.5Z',
      'M9.2 12l2 2 3.6-3.8',
    ],
  },
];

export const MARKETING_STEPS: MarketingStep[] = [
  {
    number: '01',
    title: 'Crea tu cuenta profesional',
    description:
      'Regístrate con tu email o con Google y completa tu perfil profesional en un par de minutos.',
  },
  {
    number: '02',
    title: 'Añade tu primera ficha y genera un análisis',
    description:
      'Crea la ficha de un consultante con su nombre y fecha de nacimiento, y obtén su informe del Árbol de la Vida al instante.',
  },
  {
    number: '03',
    title: 'Acompaña con datos, sesión a sesión',
    description:
      'Registra cada encuentro, consulta el historial y sigue la evolución de cada persona a lo largo del tiempo.',
  },
];

export const MARKETING_TESTIMONIALS: MarketingTestimonial[] = [
  {
    text: 'Me permite preparar cada sesión con un contexto que antes me llevaba horas reunir.',
    initials: 'LG',
    name: 'Laura G.',
    role: 'Terapeuta gestalt · Madrid',
  },
  {
    text: 'Los informes dan a mi acompañamiento una estructura y una seriedad que las personas notan desde la primera sesión.',
    initials: 'MR',
    name: 'Marcos R.',
    role: 'Coach transpersonal · CDMX',
  },
  {
    text: 'Tener todo el historial de sesiones en un solo lugar cambió por completo mi forma de trabajar.',
    initials: 'AP',
    name: 'Ana P.',
    role: 'Guía de bienestar · Buenos Aires',
  },
];

export const MARKETING_FAQ_GROUPS: MarketingFaqGroup[] = [
  {
    category: 'Sobre la plataforma',
    items: [
      {
        question: '¿Qué es exactamente Holistica Aplicada?',
        answer:
          'Es una plataforma profesional (software como servicio) que combina el análisis simbólico cabalístico con la gestión de tu práctica: fichas de consultantes, historial de sesiones e informes, todo en un mismo espacio de trabajo.',
      },
      {
        question: '¿Para quién está pensada?',
        answer:
          'Para terapeutas, coaches y guías de bienestar que trabajan con herramientas simbólicas y quieren una base ordenada, seria y profesional para acompañar a las personas.',
      },
      {
        question: '¿Qué puedo hacer nada más crear la cuenta?',
        answer:
          'Al entrar verás una guía de primeros pasos: crea la ficha de tu primer consultante, genera su análisis del Árbol de la Vida y explora el Centro de Aprendizaje. En pocos minutos tienes tu primer informe listo.',
      },
      {
        question: '¿Necesito conocimientos previos de cábala?',
        answer:
          'No. El Centro de Aprendizaje y el asistente integrado te orientan desde el primer análisis: la plataforma genera los informes y puedes profundizar en la metodología a tu ritmo.',
      },
    ],
  },
  {
    category: 'Metodología y módulos',
    items: [
      {
        question: '¿Qué incluye un análisis del Árbol de la Vida?',
        answer:
          'Un informe que recorre las 10 Sefirot a partir del nombre y la fecha de nacimiento de la persona, con sus números maestros y patrones, presentado de forma clara para usarlo directamente en sesión.',
      },
      {
        question: '¿Qué es la Tirada del Árbol o lectura simbólica?',
        answer:
          'Una tirada visual sobre el Árbol de la Vida que asocia cada posición con su Sefirá. Es un apoyo a la reflexión y al diálogo en sesión, con fines educativos, no un método predictivo.',
      },
      {
        question: '¿La misma persona obtiene siempre el mismo análisis?',
        answer:
          'Sí. El análisis se deriva de la identidad de la persona (nombre y fecha de nacimiento), de modo que es consistente: la misma persona obtiene siempre la misma lectura, y personas distintas obtienen lecturas distintas.',
      },
      {
        question: '¿La plataforma sustituye mi criterio profesional?',
        answer:
          'No: es una herramienta de apoyo. Los análisis aportan contexto y estructura; la interpretación y el acompañamiento siguen siendo tuyos.',
      },
    ],
  },
  {
    category: 'Datos, privacidad y consentimiento',
    items: [
      {
        question: '¿Cómo protegéis los datos de mis pacientes?',
        answer:
          'La conexión con la plataforma está cifrada (HTTPS), el acceso requiere autenticación y solo tú decides quién accede a cada ficha. Trabajamos bajo estándares de confidencialidad profesional.',
      },
      {
        question: '¿Cómo funciona el consentimiento?',
        answer:
          'La persona otorga su consentimiento una sola vez, al dar de alta su cuenta, y ese consentimiento cubre todo su acompañamiento. No hay que volver a pedirlo en cada lectura ni en cada función.',
      },
      {
        question: '¿Puedo exportar o eliminar los datos?',
        answer:
          'Sí. Tú controlas la información: puedes exportar los informes y, si dejas de usar la plataforma, tus datos quedan a tu disposición.',
      },
    ],
  },
  {
    category: 'Planes y prueba',
    items: [
      {
        question: '¿Qué incluye la prueba gratuita?',
        answer:
          '14 días con acceso completo, sin tarjeta de crédito. Al terminar decides si continúas con alguno de los planes; si no, tus datos quedan a tu disposición para exportarlos.',
      },
      {
        question: '¿Puedo cancelar cuando quiera?',
        answer:
          'Sí. La suscripción se gestiona desde tu cuenta y puedes cancelarla en cualquier momento, sin permanencia ni penalizaciones.',
      },
      {
        question: '¿Cuánto cuesta?',
        answer:
          'Durante la prueba tienes acceso completo sin tarjeta. Los planes y precios definitivos se comunican dentro de la plataforma, para que elijas el que mejor se ajuste a tu práctica al terminar la prueba.',
      },
    ],
  },
];

export const PLAN_PRO_FEATURES = [
  'Hasta 30 pacientes activos',
  'Análisis ilimitados',
  'Historial completo de sesiones',
  'Exportación de informes en PDF',
  'Soporte prioritario',
];

export const PLAN_PREMIUM_FEATURES = [
  'Pacientes ilimitados',
  'Todo lo del plan Profesional',
  'Recursos avanzados de formación',
  'Acompañamiento en la puesta en marcha',
  'Soporte ampliado',
];

export const MARKETING_METADATA = {
  title: 'Holistica Aplicada — Herramientas para terapeutas y guías',
  description:
    'Plataforma profesional de análisis simbólico y gestión de tu práctica. Prueba gratuita de 14 días, sin tarjeta.',
  openGraph: {
    title: 'Holistica Aplicada — Potencia tu práctica',
    description:
      'Análisis cabalístico, fichas, sesiones y Centro de Aprendizaje en un espacio de trabajo pensado para terapeutas, coaches y guías.',
  },
};
