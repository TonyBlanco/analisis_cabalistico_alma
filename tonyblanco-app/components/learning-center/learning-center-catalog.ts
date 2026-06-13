export type LearningCenterGuide = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  docPath: string;
};

export type LearningCenterTourStep = {
  id: string;
  title: string;
  description: string;
  anchorId: string;
};

export type LearningCenterQuickQuestion = {
  id: string;
  question: string;
  answer: string;
  guideSlug: string;
  ctaLabel: string;
  keywords: string[];
};

export type LearningCenterDocSection = {
  title: string;
  docPath: string;
  summary: string;
};

export type LearningCenterCatalogDefinition = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  tourSteps: LearningCenterTourStep[];
  guides: LearningCenterGuide[];
  faq: LearningCenterDocSection;
  glossary: LearningCenterDocSection;
  news: LearningCenterDocSection;
  assistant: {
    title: string;
    description: string;
    fallback: string;
    quickQuestions: LearningCenterQuickQuestion[];
  };
};

export const learningCenterCatalogDefinition: LearningCenterCatalogDefinition = {
  hero: {
    eyebrow: 'Aprendizaje guiado',
    title: 'Centro de Aprendizaje',
    description:
      'Un espacio para aprender a usar la app del terapeuta, revisar guías canónicas y resolver dudas operativas sin entrar en interpretación clínica.',
  },
  tourSteps: [
    {
      id: 'tour-menu',
      title: '1. Navega desde el menú',
      description: 'Usa el acceso Aprender del menú del terapeuta para volver aquí cuando necesites una guía rápida.',
      anchorId: 'learning-index',
    },
    {
      id: 'tour-guides',
      title: '2. Revisa las guías por módulo',
      description: 'Cada tarjeta conecta con un documento canonico y con la pantalla real correspondiente.',
      anchorId: 'learning-guides',
    },
    {
      id: 'tour-faq',
      title: '3. Consulta FAQ, glosario y novedades',
      description: 'Las dudas frecuentes y el vocabulario de uso viven en documentos separados para mantener el foco.',
      anchorId: 'learning-reference',
    },
    {
      id: 'tour-help',
      title: '4. Usa la ayuda rápida',
      description: 'Si no quieres abrir un documento completo, prueba el widget de ayuda con respuestas prearmadas.',
      anchorId: 'learning-help',
    },
  ],
  guides: [
    {
      slug: 'primeros-pasos',
      title: 'Primeros pasos',
      summary: 'Cómo orientarte en la pantalla, el menú y el flujo básico de trabajo.',
      category: 'Onboarding',
      docPath: 'learning-center/guides/primeros-pasos.md',
    },
    {
      slug: 'workspaces-del-terapeuta',
      title: 'Workspaces del terapeuta',
      summary: 'Qué abre cada workspace y cómo elegir la superficie adecuada según la tarea.',
      category: 'Workspaces',
      docPath: 'learning-center/guides/workspaces-del-terapeuta.md',
    },
    {
      slug: 'modo-hibrido',
      title: 'Modo híbrido',
      summary: 'Uso de la lectura asistida, consentimiento y separación entre tareas simbólicas y operativas.',
      category: 'Modo híbrido',
      docPath: 'learning-center/guides/modo-hibrido.md',
    },
    {
      slug: 'metricas-y-reportes',
      title: 'Métricas y reportes',
      summary: 'Cómo leer paneles agregados, refrescar datos y entender el estado general del dashboard.',
      category: 'Metricas',
      docPath: 'learning-center/guides/metricas-y-reportes.md',
    },
    {
      slug: 'faq-glosario-novedades',
      title: 'FAQ, glosario y novedades',
      summary: 'La referencia rápida para dudas de uso, vocabulario y cambios recientes de la app.',
      category: 'Referencia',
      docPath: 'learning-center/guides/faq-glosario-novedades.md',
    },
  ],
  faq: {
    title: 'FAQ de uso',
    summary: 'Respuestas breves a preguntas repetidas sobre navegación y uso de la app.',
    docPath: 'learning-center/faq.md',
  },
  glossary: {
    title: 'Glosario',
    summary: 'Definiciones operativas para leer la interfaz sin mezclarla con interpretación clínica.',
    docPath: 'learning-center/glossary.md',
  },
  news: {
    title: 'Novedades',
    summary: 'Registro ligero de cambios visibles para la experiencia del terapeuta.',
    docPath: 'learning-center/news.md',
  },
  assistant: {
    title: 'Ayuda rápida sin IA',
    description:
      'Respuestas prearmadas para preguntas de uso. Si no encuentras lo que buscas, abre la guía completa correspondiente.',
    fallback:
      'No lo sé con certeza. Abre la guía del módulo o vuelve al índice del Centro de Aprendizaje para ver el contexto correcto.',
    quickQuestions: [
      {
        id: 'open-guide',
        question: '¿Cómo abro una guía?',
        answer:
          'Usa el buscador del centro, abre una tarjeta de guía y revisa el documento completo en el panel principal.',
        guideSlug: 'primeros-pasos',
        ctaLabel: 'Ver primeros pasos',
        keywords: ['guia', 'abrir', 'documento', 'tarjeta'],
      },
      {
        id: 'resume-tour',
        question: '¿Cómo retomo el tour?',
        answer:
          'El tour se reanuda desde la tarjeta de onboarding. Si lo descartaste, puedes abrirlo otra vez con un clic.',
        guideSlug: 'primeros-pasos',
        ctaLabel: 'Retomar tour',
        keywords: ['tour', 'onboarding', 'retomar', 'reanudar'],
      },
      {
        id: 'news',
        question: '¿Dónde veo las novedades?',
        answer:
          'Las novedades están en la sección de referencia. Ahí verás los cambios pequeños que afectan a la navegación o al lenguaje de la interfaz.',
        guideSlug: 'faq-glosario-novedades',
        ctaLabel: 'Abrir novedades',
        keywords: ['novedades', 'cambios', 'changelog'],
      },
      {
        id: 'tests-holisticos',
        question: '¿Qué tests holísticos puedo asignar?',
        answer:
          'Los tests holísticos activos son: SHA-Harmony, EAT26-Spirit, DUDIT-Spirit, YBOCS-Soul, ASRS-Essence y AQ-Kabbalah. Los asignas desde el catálogo de tests y el consultante los completa en su portal.',
        guideSlug: 'workspaces-del-terapeuta',
        ctaLabel: 'Ver workspaces',
        keywords: ['test', 'holistico', 'sha', 'asrs', 'aq', 'asignar', 'catalogo'],
      },
      {
        id: 'transgeneracional',
        question: '¿Cómo uso el workspace transgeneracional?',
        answer:
          'Abre Transgeneracional Profundo desde el menú, selecciona un consultante activo y usa el panel lateral para añadir personas al árbol con sus campos Armoni (número de orden, fallecido, aborto, rama). La sección Eventos registra hechos históricos observados. Solo observacional — sin inferencias automáticas.',
        guideSlug: 'workspaces-del-terapeuta',
        ctaLabel: 'Ver guía de workspaces',
        keywords: ['transgeneracional', 'arbol', 'genealogia', 'resonancia', 'armoni'],
      },
      {
        id: 'reportes',
        question: '¿Dónde veo los tests completados por mis consultantes?',
        answer:
          'En el panel de Reportes (/dashboard/therapist/reports) verás alertas de tests completados pendientes de revisión, métricas por consultante y export CSV. También puedes ir directamente a la ficha del consultante.',
        guideSlug: 'metricas-y-reportes',
        ctaLabel: 'Ver guía de reportes',
        keywords: ['reportes', 'tests', 'completados', 'alertas', 'csv', 'export'],
      },
    ],
  },
};
