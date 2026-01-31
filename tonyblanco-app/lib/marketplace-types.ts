// Tipos de recursos disponibles en el Marketplace
export const RESOURCE_TYPES = {
  TEST_MODULE: 'test_module',
  ANGEL_GUIDE: 'angel_guide',
  INTERPRETATION: 'interpretation',
  REPORT_TEMPLATE: 'report_template',
  MEDITATION: 'meditation',
  TRAINING: 'training',
} as const;

export type ResourceType = typeof RESOURCE_TYPES[keyof typeof RESOURCE_TYPES];

// Categorías de recursos
export const RESOURCE_CATEGORIES = {
  TESTS: 'tests',
  ANGELS: 'angels',
  INTERPRETATIONS: 'interpretations',
  TOOLS: 'tools',
  EDUCATION: 'education',
} as const;

export type ResourceCategory = typeof RESOURCE_CATEGORIES[keyof typeof RESOURCE_CATEGORIES];

// Niveles de acceso requeridos
export const REQUIRED_ACCESS = {
  FREE: 'free',
  PERSONAL: 'personal',
  PROFESSIONAL: 'professional',
  PREMIUM: 'premium',
} as const;

export type RequiredAccess = typeof REQUIRED_ACCESS[keyof typeof REQUIRED_ACCESS];

// Interface para recurso del Marketplace
export interface MarketplaceResource {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  category: ResourceCategory;
  requiredAccess: RequiredAccess;
  price?: number; // Precio si es compra individual
  icon: string;
  image?: string;
  url?: string; // URL de la página del recurso
  features: string[];
  isPremium: boolean;
  isNew?: boolean;
  usageLimit?: number; // Usos por mes (undefined = ilimitado)
  createdAt: string;
  updatedAt: string;
}

// Interface para recurso de Ángel
export interface AngelResource extends MarketplaceResource {
  angelName: {
    hebrew: string;
    english: string;
  };
  attribute: string;
  godName: string;
  angelicOrder: string;
  presidesOver: [number, number][]; // [mes, día]
  psalms?: string[];
  invocationTime?: string;
  meditation?: string;
  influence?: string;
}

// Recursos del Marketplace
export const MARKETPLACE_RESOURCES: MarketplaceResource[] = [
  // TESTS PROFESIONALES
  {
    id: 'test-pai',
    name: 'Mapa Integrativo de Personalidad (Profesional)',
    description: 'Lectura estructurada de rasgos y patrones para acompañamiento profesional',
    type: 'test_module',
    category: 'tests',
    requiredAccess: 'professional',
    icon: '🧾',
    features: [
      'Escalas estructuradas completas',
      'Interpretación profesional',
      'Reporte para consultantes',
      'Marco metodológico',
    ],
    isPremium: true,
    usageLimit: 50,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'test-mcmi-iv',
    name: 'Matriz Multiaxial — Perfil (Profesional)',
    description: 'Lectura multieje de patrones y estilos para acompañamiento profesional',
    type: 'test_module',
    category: 'tests',
    requiredAccess: 'professional',
    icon: '🧩',
    features: [
      '14 escalas de personalidad',
      '10 escalas adicionales',
      'Algoritmo avanzado de síntesis',
      'Marco estructurado',
    ],
    isPremium: true,
    usageLimit: 30,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'test-scid5',
    name: 'Guía Estructurada (Profesional)',
    description: 'Guía de conversación estructurada para exploración profesional',
    type: 'test_module',
    category: 'tests',
    requiredAccess: 'professional',
    icon: '🔎',
    features: [
      'Protocolo de exploración estructurada y toma de notas',
      'Guía de entrevista paso a paso para profesionales',
      'Soporte para elaboración de hipótesis clínicas sin automatismos',
      'Reporte integrativo orientado al acompañamiento profesional',
    ],
    isPremium: true,
    usageLimit: 40,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },

  // TESTS PERSONALES
  {
    id: 'test-basic',
    name: 'Análisis Cabalístico Básico',
    description: 'Análisis numerológico cabalístico con Árbol de la Vida y Letras del Alma',
    type: 'test_module',
    category: 'tests',
    requiredAccess: 'free',
    icon: '📊',
    features: [
      'Números principales',
      'Inclusión de Base',
      'Árbol de la Vida',
      'Letras del Alma',
      'Recomendaciones básicas',
    ],
    isPremium: false,
    usageLimit: undefined,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'test-wellness',
    name: 'Test de Bienestar Integral',
    description: 'Evaluación completa de 38 indicadores corporales en 6 sistemas principales',
    type: 'test_module',
    category: 'tests',
    requiredAccess: 'free',
    icon: '❤️',
    url: '/wellness',
    features: [
      '38 preguntas científicamente diseñadas',
      'Evaluación de 6 sistemas corporales',
      'Visualización con gráficos anatómicos',
      'Identificación de áreas críticas',
      'Análisis detallado por sistema',
      'Reporte visual completo',
    ],
    isPremium: false,
    usageLimit: undefined,
    createdAt: '2024-12-09',
    updatedAt: '2024-12-09',
    isNew: true,
  },
  {
    id: 'test-numerology',
    name: 'Numerología Completa Avanzada',
    description: 'Análisis numerológico profundo con predicciones y ciclos',
    type: 'test_module',
    category: 'tests',
    requiredAccess: 'personal',
    icon: '🔢',
    features: [
      'Todo lo del análisis básico',
      'Ciclos personales',
      'Años personales',
      'Compatibilidades avanzadas',
      'Predicciones anuales',
      'Interpretación IA profunda',
    ],
    isPremium: true,
    price: 29.99,
    usageLimit: 10,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'test-compatibility',
    name: 'Compatibilidad de Pareja',
    description: 'Análisis profundo de compatibilidad numerológica entre dos personas',
    type: 'test_module',
    category: 'tests',
    requiredAccess: 'personal',
    icon: '💑',
    features: [
      'Score de compatibilidad total',
      'Análisis por áreas (amor, comunicación, finanzas)',
      'Fortalezas y desafíos',
      'Recomendaciones para la relación',
    ],
    isPremium: true,
    price: 19.99,
    usageLimit: 5,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },

  // ÁNGELES (72 GENIOS)
  {
    id: 'angels-guardian',
    name: 'Tu Ángel Guardián Personal',
    description: 'Descubre tu ángel guardián según tu fecha de nacimiento',
    type: 'angel_guide',
    category: 'angels',
    requiredAccess: 'free',
    icon: '👼',
    features: [
      'Ángel según fecha de nacimiento',
      'Atributo divino',
      'Salmo de invocación',
      'Horario favorable',
    ],
    isPremium: false,
    usageLimit: undefined,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'angels-72-complete',
    name: 'Los 72 Nombres de Dios - Sistema Completo',
    description: 'Acceso completo a los 72 ángeles con meditaciones y invocaciones',
    type: 'angel_guide',
    category: 'angels',
    requiredAccess: 'premium',
    icon: 'Sparkles',
    url: '/angels',
    features: [
      'Los 72 ángeles completos con nombres hebreos',
      'Atributos divinos y nombres de Dios',
      'Invocaciones y salmos específicos',
      'Calendario de presidencia (365 días)',
      '9 órdenes angélicos',
      'Textos sagrados completos',
    ],
    isPremium: true,
    price: 49.99,
    usageLimit: undefined,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isNew: true,
  },

  // INTERPRETACIONES CON IA
  {
    id: 'interpretation-basic',
    name: 'Interpretación IA Básica',
    description: 'Interpretación automática de tus resultados con IA',
    type: 'interpretation',
    category: 'interpretations',
    requiredAccess: 'personal',
    icon: '🤖',
    features: [
      'Interpretación automática',
      'Lenguaje claro y comprensible',
      'Recomendaciones personalizadas',
    ],
    isPremium: true,
    usageLimit: 20,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'interpretation-professional',
    name: 'Interpretación IA Profesional',
    description: 'Interpretación avanzada con lenguaje clínico para profesionales',
    type: 'interpretation',
    category: 'interpretations',
    requiredAccess: 'professional',
    icon: '🧠',
    features: [
      'Lenguaje clínico especializado',
      'Referencias bibliográficas',
      'Diagnósticos diferenciales',
      'Recomendaciones terapéuticas',
      'Formato reporte profesional',
    ],
    isPremium: true,
    usageLimit: 100,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },

  // HERRAMIENTAS
  {
    id: 'tool-report-generator',
    name: 'Generador de Reportes PDF',
    description: 'Genera reportes profesionales en PDF con tu branding',
    type: 'report_template',
    category: 'tools',
    requiredAccess: 'professional',
    icon: '📄',
    features: [
      'Plantillas personalizables',
      'Tu logo y branding',
      'Exportación PDF de alta calidad',
      'Firma digital',
    ],
    isPremium: true,
    price: 39.99,
    usageLimit: undefined,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },

  // EDUCACIÓN
  {
    id: 'training-kabbalah-basics',
    name: 'Curso: Fundamentos de Cábala Práctica',
    description: 'Aprende los fundamentos de la Cábala y la numerología hebrea',
    type: 'training',
    category: 'education',
    requiredAccess: 'personal',
    icon: '📚',
    features: [
      '12 módulos de aprendizaje',
      'Videos explicativos',
      'Ejercicios prácticos',
      'Certificado de finalización',
    ],
    isPremium: true,
    price: 99.99,
    usageLimit: undefined,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'training-professional',
    name: 'Certificación Profesional en Análisis Cabalístico',
    description: 'Conviértete en analista cabalístico certificado',
    type: 'training',
    category: 'education',
    requiredAccess: 'professional',
    icon: '🎓',
    features: [
      'Programa completo 6 meses',
      'Mentoría personalizada',
      'Prácticas supervisadas',
      'Certificación oficial',
      'Acceso a comunidad profesional',
    ],
    isPremium: true,
    price: 499.99,
    usageLimit: undefined,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isNew: true,
  },
];

// Función para filtrar recursos por nivel de acceso
export function getResourcesByAccess(userAccessLevel: RequiredAccess): MarketplaceResource[] {
  const accessHierarchy = {
    free: 0,
    personal: 1,
    professional: 2,
    premium: 3,
  };

  const userLevel = accessHierarchy[userAccessLevel];

  return MARKETPLACE_RESOURCES.filter((resource) => {
    const resourceLevel = accessHierarchy[resource.requiredAccess];
    return userLevel >= resourceLevel;
  });
}

// Función para filtrar por categoría
export function getResourcesByCategory(category: ResourceCategory): MarketplaceResource[] {
  return MARKETPLACE_RESOURCES.filter((resource) => resource.category === category);
}

// Función para obtener recursos premium
export function getPremiumResources(): MarketplaceResource[] {
  return MARKETPLACE_RESOURCES.filter((resource) => resource.isPremium);
}

// Función para obtener recursos nuevos
export function getNewResources(): MarketplaceResource[] {
  return MARKETPLACE_RESOURCES.filter((resource) => resource.isNew);
}
