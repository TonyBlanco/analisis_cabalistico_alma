// Sistema de Gestión de Pacientes para Terapistas Profesionales

export interface PatientInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  birthTime?: string; // Hora de nacimiento (formato HH:MM)
  birthCity?: string; // Ciudad de nacimiento
  birthCountry?: string; // País de nacimiento
  birthLatitude?: number; // Latitud del lugar de nacimiento
  birthLongitude?: number; // Longitud del lugar de nacimiento
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  
  // Información cabalística (para cross-reference)
  kabbalisticProfile?: {
    soulNumber?: number;
    lifePath?: number;
    weaknesses?: string[];
    strengths?: string[];
    guardianAngel?: string;
    calculatedAt?: string;
  };
}

export interface PatientTestResult {
  id: string;
  patientId: string;
  testType: 'wellness' | 'kabbalistic' | 'biomagnetic' | 'financial-abundance' | 'complete-numerology' | 'cabalistic-astrology';
  date: string;
  timestamp: number;
  
  // Wellness Test Data
  wellnessData?: {
    answers: Record<number, number>;
    systemScores: {
      system: string;
      score: number;
      maxScore: number;
      percentage: number;
      status: 'Óptimo' | 'Normal' | 'Regular' | 'Crítico';
    }[];
    aiAnalysis?: string;
    completedIn: number;
  };
  
  // Financial/Kabbalistic Test Data
  resultData?: any; // Datos completos del resultado (mapa cabalístico, cálculos financieros, etc.)
  summary?: string; // Resumen del test
  backendResultId?: number; // ID del resultado en el backend
  
  // Observaciones del terapeuta
  therapistNotes?: string;
  recommendations?: string[];
  followUpDate?: string;
}

export interface PatientComparison {
  patientId: string;
  tests: PatientTestResult[];
  timeRange: {
    start: string;
    end: string;
  };
  trends: {
    system: string;
    direction: 'improving' | 'stable' | 'declining';
    changePercentage: number;
  }[];
  correlations?: {
    kabbalisticWeakness: string;
    wellnessIssue: string;
    matchStrength: 'high' | 'medium' | 'low';
    notes: string;
  }[];
}

export interface TherapistSession {
  id: string;
  patientId: string;
  date: string;
  duration: number; // minutos
  type: 'initial' | 'follow-up' | 'emergency';
  findings: string;
  treatment: string;
  nextSession?: string;
}
