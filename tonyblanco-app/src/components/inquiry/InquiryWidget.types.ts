// components/inquiry/InquiryWidget.types.ts

/**
 * Módulos SWM soportados por el Active Inquiry Engine
 */
export type ModuleCode = 
  | 'astrology' 
  | 'cabala' 
  | 'transgenerational' 
  | 'bioemotional'
  | 'mshe';

/**
 * Posición del widget en la interfaz
 */
export type WidgetPosition = 'footer' | 'sidebar' | 'header' | 'modal';

/**
 * Prioridad del gap de conocimiento
 */
export type GapPriority = 'critical' | 'important' | 'optional';

/**
 * Tipo de pregunta
 */
export type QuestionType = 
  | 'scale_1_10' 
  | 'text_long' 
  | 'text_short' 
  | 'choice_single' 
  | 'choice_multi' 
  | 'yes_no'
  | 'date'
  | 'date_range'
  | 'body_map';

/**
 * Información de un gap de conocimiento
 */
export interface KnowledgeGap {
  /** Código único del inquiry (ej: "astro_current_life_events") */
  code: string;
  /** Título corto para el widget */
  title: string;
  /** Descripción/ayuda para el terapeuta */
  description: string;
  /** Pregunta completa sugerida */
  questionText: string;
  /** Prioridad visual */
  priority: GapPriority;
  /** Tipo de respuesta esperada */
  questionType: QuestionType;
  /** Opciones si es choice_single o choice_multi */
  choices?: Array<{ value: string; label: string; metadata?: Record<string, any> }>;
  /** Placeholder para campos de texto */
  placeholder?: string;
  /** Validación */
  validation?: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  /** Gap padre si es follow-up condicional */
  followUpTriggeredBy?: string;
  /** Condición que activó este follow-up */
  followUpCondition?: string;
  /** Si es un gap dinámico (por entidad) */
  dynamic?: boolean;
  entityType?: string;
  entityId?: number;
  entityLabel?: string;
  /** Si hay respuesta previa expirada */
  previousResponse?: {
    value: any;
    collectedAt: string;
    expiredReason: 'time_expired' | 'manual_invalidation';
  };
}

/**
 * Respuesta registrada para un gap
 */
export interface GapResponse {
  gapCode: string;
  value: string | number | string[];
  collectedAt: string; // ISO date
  collectedBy: 'therapist_session' | 'patient_self' | 'pre_session';
  notes?: string;
}

/**
 * Props principales del InquiryWidget
 */
export interface InquiryWidgetProps {
  /** ID del paciente actual */
  patientId: number;
  
  /** Código del módulo SWM que está abierto */
  moduleCode: ModuleCode;
  
  /** Posición del widget en la interfaz */
  position?: WidgetPosition;
  
  /** Si inicia expandido (default: false para footer, true para sidebar) */
  defaultExpanded?: boolean;
  
  /** Máximo de gaps a mostrar antes de "Ver más" (default: 5) */
  maxVisibleGaps?: number;
  
  /** Ocultar gaps opcionales (default: false) */
  hideOptional?: boolean;
  
  /** Callback cuando se resuelve un gap en sesión */
  onGapResolved?: (gapCode: string, response: GapResponse) => void;
  
  /** Callback cuando se envía cuestionario */
  onQuestionnaireSent?: (gapCodes: string[], batchId: string) => void;
  
  /** Callback cuando se ignora un gap */
  onGapIgnored?: (gapCode: string) => void;
  
  /** Callback cuando cambia el estado de expansión */
  onExpandChange?: (isExpanded: boolean) => void;
  
  /** Override de estilos para el contenedor */
  className?: string;
  
  /** Texto personalizado para el título colapsado */
  collapsedTitle?: string;
}

/**
 * Estados posibles del widget
 */
export type WidgetState = 
  | 'loading'        // Cargando gaps desde API
  | 'error'          // Error al cargar
  | 'empty'          // No hay gaps definidos para este módulo
  | 'has_gaps'       // Hay gaps pendientes
  | 'all_resolved'   // Todos los gaps han sido respondidos
  | 'asking'         // Modal de "Preguntar Ahora" abierto
  | 'sending'        // Preparando envío de cuestionario
  | 'success';       // Acción completada exitosamente

/**
 * Estado interno completo del widget
 */
export interface InquiryWidgetState {
  /** Estado actual del widget */
  status: WidgetState;
  
  /** Si el widget está expandido */
  isExpanded: boolean;
  
  /** Lista de gaps detectados */
  gaps: KnowledgeGap[];
  
  /** Gaps ignorados para esta sesión (codes) */
  ignoredGaps: Set<string>;
  
  /** Gaps seleccionados para cuestionario (codes) */
  selectedForQuestionnaire: Set<string>;
  
  /** Gap actualmente siendo respondido (si asking) */
  activeGap: KnowledgeGap | null;
  
  /** Respuesta en progreso */
  draftResponse: string;
  
  /** Mensaje de error si hay */
  errorMessage: string | null;
  
  /** Timestamp de última actualización */
  lastFetch: Date | null;
}

/**
 * Contadores para el badge
 */
export interface GapCounts {
  critical: number;
  important: number;
  optional: number;
  total: number;
}

/**
 * Response del endpoint GET /api/inquiry/gaps/
 */
export interface GapsApiResponse {
  gaps: KnowledgeGap[];
  resolved_count: number;
  total_count: number;
}

/**
 * Request para POST /api/inquiry/responses/
 */
export interface SaveResponseRequest {
  patient_id: number;
  inquiry_code: string;
  response_value: any;
  collected_by: 'therapist_session' | 'patient_self' | 'pre_session';
  session_id?: number;
  notes?: string;
}

/**
 * Request para POST /api/inquiry/batches/
 */
export interface CreateBatchRequest {
  patient_id: number;
  inquiry_codes: string[];
  expires_in_days?: number;
  send_email?: boolean;
}

/**
 * Response de POST /api/inquiry/batches/
 */
export interface CreateBatchResponse {
  batch_id: string;
  access_token: string;
  public_url: string;
}
