// Tipos de tests disponibles
export const TEST_TYPES = {
  BASIC: 'basic',
  NUMEROLOGY: 'numerology',
  COMPATIBILITY: 'compatibility',
  CAREER: 'career',
  SPIRITUAL: 'spiritual',
  HEALTH: 'health',
  FINANCIAL: 'financial',
  FAMILY: 'family',
  PURPOSE: 'purpose',
  PAST_LIFE: 'past_life',
  PAI: 'pai',
  SCL90: 'scl90',
  STAI: 'stai',
  MCMIIV: 'mcmi-iv',
  SCID5: 'scid5',
  BDI: 'bdi',
  BAI: 'bai',
} as const;

export type TestType = typeof TEST_TYPES[keyof typeof TEST_TYPES];

// Niveles de acceso
export const ACCESS_LEVELS = {
  FREE: 'free',
  PERSONAL: 'personal',
  PROFESSIONAL: 'professional',
  PREMIUM: 'premium',
} as const;

export type AccessLevel = typeof ACCESS_LEVELS[keyof typeof ACCESS_LEVELS];

// Jerarquía de acceso (para comparaciones)
export const ACCESS_HIERARCHY: Record<AccessLevel, number> = {
  free: 0,
  personal: 1,
  professional: 2,
  premium: 3,
};

// Interface para módulo de test
export interface TestModule {
  id: number;
  code: string;
  name: string;
  description: string;
  test_type: TestType;
  required_access_level: AccessLevel;
  is_active: boolean;
  available_for_therapists: boolean;
  available_for_personal: boolean;
  uses_per_month: number | null;
  icon: string;
  order: number;
  estimated_duration: number;
  is_available: boolean;
  user_access: UserTestAccess | null;
}

// Interface para acceso de usuario a un test
export interface UserTestAccess {
  can_use: boolean;
  uses_count: number;
  current_month_uses: number;
  monthly_limit: number | null;
  last_used: string | null;
  has_special_access: boolean;
}

// Interface para resultado de test
export interface TestResult {
  id: number;
  // Backend returns embedded module object; align for UI usage
  test_module: {
    id: number;
    code: string;
    name: string;
    description?: string;
    test_type: TestType;
  };
  // Legacy fields (optional) for backward compatibility
  test_module_name?: string;
  test_module_code?: string;
  input_data: Record<string, any>;
  result_data: Record<string, any>;
  client_name?: string;
  client_birth_date?: string;
  notes?: string;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

// Interface para ejecutar un test
export interface ExecuteTestRequest {
  test_module_code: string;
  input_data: Record<string, any>;
  client_name?: string;
  client_birth_date?: string;
  patient_id?: number; // Required for therapist_clinical mode
  save_result?: boolean;
}

// Interface para respuesta de ejecución de test
export interface ExecuteTestResponse {
  success: boolean;
  result: Record<string, any>;
  uses_remaining: number | null;
  result_id?: number;
}

// Interface para estadísticas de usuario
export interface UserTestStats {
  total_tests_available: number;
  total_tests_used: number;
  total_uses: number;
  tests: Array<{
    code: string;
    name: string;
    uses_count: number;
    current_month_uses: number;
    last_used: string | null;
    can_use_now: boolean;
  }>;
}

// Nombres legibles para tipos de tests
export const TEST_TYPE_NAMES: Record<TestType, string> = {
  basic: 'Análisis Básico',
  numerology: 'Numerología Completa',
  compatibility: 'Compatibilidad de Pareja',
  career: 'Orientación Profesional',
  spiritual: 'Camino Espiritual',
  health: 'Salud y Bienestar',
  financial: 'Abundancia Financiera',
  family: 'Relaciones Familiares',
  purpose: 'Propósito de Vida',
  past_life: 'Vidas Pasadas',
  pai: 'PAI - Evaluación Profesional',
  scl90: 'SCL-90-R - Lista de Síntomas Revisada',
  stai: 'STAI - Ansiedad Estado-Rasgo',
  'mcmi-iv': 'MCMI-IV - Evaluación de Personalidad',
  scid5: 'SCID-5-RV - Entrevista DSM-5',
  bdi: 'BDI-II - Depresión (Beck)',
  bai: 'BAI - Ansiedad (Beck)',
};

// Nombres legibles para niveles de acceso
export const ACCESS_LEVEL_NAMES: Record<AccessLevel, string> = {
  free: 'Gratuito',
  personal: 'Personal',
  professional: 'Profesional',
  premium: 'Premium',
};

// Iconos para tipos de tests
export const TEST_TYPE_ICONS: Record<TestType, string> = {
  basic: '📊',
  numerology: '🔢',
  compatibility: '💑',
  career: '💼',
  spiritual: '🕉️',
  health: '🏥',
  financial: '💰',
  family: '👨‍👩‍👧‍👦',
  purpose: '🎯',
  past_life: '🔮',
  pai: '🧾',
  scl90: '📋',
  stai: '⚖️',
  'mcmi-iv': '🧩',
  scid5: '🔎',
  bdi: '🧠',
  bai: '⚠️',
};
