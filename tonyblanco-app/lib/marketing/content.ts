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

export type MarketingFaq = {
  question: string;
  answer: string;
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
      'Datos cifrados y protegidos. Confidencialidad profesional desde el diseño: solo tú decides quién accede.',
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

export const MARKETING_STEPS: MarketingStep[] = [
  {
    number: '01',
    title: 'Crea tu cuenta profesional',
    description:
      'Regístrate con tu email o con Google y completa tu perfil profesional en un par de minutos.',
  },
  {
    number: '02',
    title: 'Configura tu práctica',
    description:
      'Crea tus primeras fichas y organiza tu espacio de trabajo a la medida de cómo acompañas.',
  },
  {
    number: '03',
    title: 'Acompaña con datos',
    description:
      'Genera análisis, registra cada sesión y sigue la evolución de cada persona a lo largo del tiempo.',
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

export const MARKETING_FAQS: MarketingFaq[] = [
  {
    question: '¿Necesito conocimientos previos de cábala?',
    answer:
      'No. El Centro de Aprendizaje y el asistente integrado te orientan desde el primer análisis: la plataforma genera los informes y puedes profundizar en la metodología a tu ritmo.',
  },
  {
    question: '¿Cómo protegéis los datos de mis pacientes?',
    answer:
      'Los datos viajan y se almacenan cifrados, y solo tú decides quién accede a cada ficha. Trabajamos bajo estándares de confidencialidad profesional.',
  },
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
    question: '¿La plataforma sustituye mi criterio profesional?',
    answer:
      'No: es una herramienta de apoyo. Los análisis aportan contexto y estructura; la interpretación y el acompañamiento siguen siendo tuyos.',
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