/**
 * Cabala Qliphoth Cycles API - Helpers para Frontend
 * 
 * Funciones de utilidad para interactuar con el API de ciclos Qliphoth.
 * ÉTICO: Solo mapea datos históricos, nunca predicciones.
 */

import { getApiBaseUrl } from '@/lib/api-base';

export interface QliphothCyclesData {
  consultante_uuid: string;
  consultante_name: string;
  birth_date: string;
  current_qliphoth: string;
  cycle_year: number;
  corresponding_sefira: string;
  shadow_manifestation: string;
  biographical_shadow_map: QliphothEvent[];
  shadow_patterns: ShadowPatterns;
  alerts: ShadowAlert[];
  qliphoth_info: QliphothInfo;
  integration_path: string;
  disclaimer: string;
  ethical_notice: string;
}

export interface QliphothEvent {
  year: number;
  date: string;
  age: number;
  qliphoth: string;
  corresponding_sefira: string;
  events: EventDetail[];
  detected_pattern: string;
}

export interface EventDetail {
  type: string;
  name: string;
  code: string;
  severity: string;
  score?: number;
  date: string;
  is_crisis: boolean;
}

export interface ShadowPatterns {
  qliphoth_crisis_correlation: Record<string, number>;
  cycle_repetition: CycleRepetition[];
  total_events: number;
  crisis_events: number;
  most_challenging_qliphoth?: string;
  insufficient_data?: boolean;
  message?: string;
}

export interface CycleRepetition {
  qliphoth: string;
  years: number[];
  pattern: string;
}

export interface ShadowAlert {
  type: 'historical_pattern' | 'cycle_repetition' | 'current_awareness';
  qliphoth: string;
  next_entry_date: string;
  days_until: number;
  message: string;
  suggestion: string;
}

export interface QliphothInfo {
  hebrewName: string;
  spanishName: string;
  meaning: string;
  archetype: string;
  shadowExpression: string;
  integrationPath: string;
  keywords: string[];
  correspondingSefira: string;
}

/**
 * Obtiene el análisis completo de ciclos Qliphoth para un consultante.
 * 
 * @param consultanteUuid UUID del consultante
 * @returns Promise con los datos de ciclos Qliphoth
 */
export async function fetchQliphothCycles(consultanteUuid: string): Promise<QliphothCyclesData> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/consultantes/${consultanteUuid}/qliphoth-cycles/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Guarda un análisis de ciclos Qliphoth como AnalysisRecord.
 * 
 * @param consultanteUuid UUID del consultante
 * @param analysisData Datos del análisis a guardar
 * @returns Promise con la respuesta del servidor
 */
export async function saveQliphothAnalysis(
  consultanteUuid: string, 
  analysisData: {
    method_id: string;
    method_name: string;
    method_output: any;
    tree_state: any;
  }
): Promise<any> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/consultantes/${consultanteUuid}/cabala-aplicada/records/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(analysisData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene los ciclos de Sefirot con opción de incluir análisis de sombra.
 * 
 * @param consultanteUuid UUID del consultante
 * @param includeShadow Si incluir análisis de sombra en la respuesta
 * @returns Promise con los datos de ciclos
 */
export async function fetchCabalaaCycles(
  consultanteUuid: string, 
  includeShadow: boolean = false
): Promise<any> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/consultantes/${consultanteUuid}/cabala-cycles/${includeShadow ? '?include_shadow=true' : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Calcula la Qliphoth activa para una edad específica.
 * Útil para mostrar información sin hacer llamadas al servidor.
 * 
 * @param age Edad de la persona
 * @returns Información de la Qliphoth correspondiente
 */
export function calculateQliphothForAge(age: number): {
  qliphoth: string;
  cycleYear: number;
  position: number;
} {
  const position = age % 10;
  
  const qliphothMap: Record<number, string> = {
    0: 'lilith',
    1: 'gamaliel', 
    2: 'samael',
    3: 'arab_zaraq',
    4: 'thagirion',
    5: 'golachab',
    6: 'gamchicoth',
    7: 'satariel',
    8: 'ghagiel',
    9: 'thaumiel'
  };

  return {
    qliphoth: qliphothMap[position],
    cycleYear: position + 1,
    position
  };
}

/**
 * Genera una línea temporal de Qliphoth para un rango de años.
 * 
 * @param birthYear Año de nacimiento
 * @param startYear Año de inicio del timeline
 * @param endYear Año de fin del timeline  
 * @returns Array con información de cada año
 */
export function generateQliphothTimeline(
  birthYear: number, 
  startYear?: number, 
  endYear?: number
): Array<{
  year: number;
  age: number;
  qliphoth: string;
  cycleYear: number;
}> {
  const start = startYear || birthYear;
  const end = endYear || new Date().getFullYear() + 1;
  const timeline = [];

  for (let year = start; year <= end; year++) {
    const age = year - birthYear;
    if (age >= 0) {
      const qliphothInfo = calculateQliphothForAge(age);
      timeline.push({
        year,
        age,
        qliphoth: qliphothInfo.qliphoth,
        cycleYear: qliphothInfo.cycleYear
      });
    }
  }

  return timeline;
}

/**
 * Filtra eventos por tipo de crisis.
 * 
 * @param events Array de eventos
 * @param includeMinorEvents Si incluir eventos menores
 * @returns Eventos filtrados
 */
export function filterCrisisEvents(
  events: QliphothEvent[], 
  includeMinorEvents: boolean = true
): QliphothEvent[] {
  if (includeMinorEvents) return events;
  
  return events.filter(event => 
    event.events.some(e => e.is_crisis)
  );
}

/**
 * Agrupa eventos por Qliphoth para análisis estadístico.
 * 
 * @param events Array de eventos
 * @returns Eventos agrupados por Qliphoth
 */
export function groupEventsByQliphoth(events: QliphothEvent[]): Record<string, QliphothEvent[]> {
  return events.reduce((groups, event) => {
    const qliphoth = event.qliphoth;
    if (!groups[qliphoth]) {
      groups[qliphoth] = [];
    }
    groups[qliphoth].push(event);
    return groups;
  }, {} as Record<string, QliphothEvent[]>);
}

/**
 * Calcula estadísticas de crisis por Qliphoth.
 * 
 * @param events Array de eventos
 * @returns Estadísticas de crisis
 */
export function calculateCrisisStatistics(events: QliphothEvent[]): {
  totalEvents: number;
  crisisEvents: number;
  crisisRate: number;
  qliphothCrisisCount: Record<string, number>;
  mostChallengingQliphoth?: string;
} {
  const totalEvents = events.length;
  const crisisEvents = events.filter(event => 
    event.events.some(e => e.is_crisis)
  ).length;
  
  const crisisRate = totalEvents > 0 ? (crisisEvents / totalEvents) * 100 : 0;
  
  const qliphothCrisisCount = events.reduce((counts, event) => {
    const hasCrisis = event.events.some(e => e.is_crisis);
    if (hasCrisis) {
      counts[event.qliphoth] = (counts[event.qliphoth] || 0) + 1;
    }
    return counts;
  }, {} as Record<string, number>);
  
  const mostChallengingQliphoth = Object.entries(qliphothCrisisCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  return {
    totalEvents,
    crisisEvents,
    crisisRate,
    qliphothCrisisCount,
    mostChallengingQliphoth
  };
}

/**
 * Valida que los datos de Qliphoth sean correctos.
 * 
 * @param data Datos a validar
 * @returns true si los datos son válidos
 */
export function validateQliphothData(data: any): data is QliphothCyclesData {
  return (
    data &&
    typeof data.consultante_uuid === 'string' &&
    typeof data.current_qliphoth === 'string' &&
    typeof data.cycle_year === 'number' &&
    Array.isArray(data.biographical_shadow_map) &&
    Array.isArray(data.alerts) &&
    typeof data.disclaimer === 'string'
  );
}

export default {
  fetchQliphothCycles,
  saveQliphothAnalysis,
  fetchCabalaaCycles,
  calculateQliphothForAge,
  generateQliphothTimeline,
  filterCrisisEvents,
  groupEventsByQliphoth,
  calculateCrisisStatistics,
  validateQliphothData
};