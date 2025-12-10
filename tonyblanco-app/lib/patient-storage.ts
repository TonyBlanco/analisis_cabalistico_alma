// Sistema de Persistencia de Pacientes

import type { PatientInfo, PatientTestResult, TherapistSession } from '@/types/patient';

const PATIENTS_KEY = 'therapist_patients';
const TESTS_KEY = 'patient_tests';
const SESSIONS_KEY = 'therapist_sessions';

// ==================== PACIENTES ====================

export function savePatient(patient: Omit<PatientInfo, 'id' | 'createdAt' | 'updatedAt'>): PatientInfo {
  try {
    const patients = loadAllPatients();
    
    const newPatient: PatientInfo = {
      ...patient,
      id: generatePatientId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    patients.push(newPatient);
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
    
    return newPatient;
  } catch (error) {
    console.error('Error saving patient:', error);
    throw error;
  }
}

export function updatePatient(patientId: string, updates: Partial<PatientInfo>): PatientInfo | null {
  try {
    const patients = loadAllPatients();
    const index = patients.findIndex(p => p.id === patientId);
    
    if (index === -1) return null;

    patients[index] = {
      ...patients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
    return patients[index];
  } catch (error) {
    console.error('Error updating patient:', error);
    return null;
  }
}

export function loadAllPatients(): PatientInfo[] {
  try {
    const stored = localStorage.getItem(PATIENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading patients:', error);
    return [];
  }
}

export function getPatient(patientId: string): PatientInfo | null {
  const patients = loadAllPatients();
  return patients.find(p => p.id === patientId) || null;
}

export function deletePatient(patientId: string): boolean {
  try {
    const patients = loadAllPatients();
    const filtered = patients.filter(p => p.id !== patientId);
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(filtered));
    
    // También eliminar tests y sesiones del paciente
    deletePatientTests(patientId);
    deletePatientSessions(patientId);
    
    return true;
  } catch (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
}

// ==================== TESTS ====================

export function savePatientTest(test: Omit<PatientTestResult, 'id' | 'timestamp'>): PatientTestResult {
  try {
    const tests = loadAllTests();
    
    const newTest: PatientTestResult = {
      ...test,
      id: generateTestId(),
      timestamp: Date.now(),
    };

    tests.unshift(newTest); // Más reciente primero
    localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
    
    // Actualizar fecha de actualización del paciente
    updatePatient(test.patientId, {});
    
    return newTest;
  } catch (error) {
    console.error('Error saving test:', error);
    throw error;
  }
}

export function loadAllTests(): PatientTestResult[] {
  try {
    const stored = localStorage.getItem(TESTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading tests:', error);
    return [];
  }
}

export function getPatientTests(patientId: string): PatientTestResult[] {
  const tests = loadAllTests();
  return tests.filter(t => t.patientId === patientId).sort((a, b) => b.timestamp - a.timestamp);
}

export function getTestsByDateRange(patientId: string, startDate: string, endDate: string): PatientTestResult[] {
  const tests = getPatientTests(patientId);
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return tests.filter(t => {
    const testDate = new Date(t.date).getTime();
    return testDate >= start && testDate <= end;
  });
}

function deletePatientTests(patientId: string): void {
  const tests = loadAllTests();
  const filtered = tests.filter(t => t.patientId !== patientId);
  localStorage.setItem(TESTS_KEY, JSON.stringify(filtered));
}

// ==================== SESIONES ====================

export function saveSession(session: Omit<TherapistSession, 'id'>): TherapistSession {
  try {
    const sessions = loadAllSessions();
    
    const newSession: TherapistSession = {
      ...session,
      id: generateSessionId(),
    };

    sessions.unshift(newSession);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    
    return newSession;
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
}

export function loadAllSessions(): TherapistSession[] {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

export function getPatientSessions(patientId: string): TherapistSession[] {
  const sessions = loadAllSessions();
  return sessions.filter(s => s.patientId === patientId);
}

function deletePatientSessions(patientId: string): void {
  const sessions = loadAllSessions();
  const filtered = sessions.filter(s => s.patientId !== patientId);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
}

// ==================== UTILIDADES ====================

function generatePatientId(): string {
  return `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateTestId(): string {
  return `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateSessionId(): string {
  return `SES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== BÚSQUEDA ====================

export function searchPatients(query: string): PatientInfo[] {
  const patients = loadAllPatients();
  const lowerQuery = query.toLowerCase();
  
  return patients.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.email?.toLowerCase().includes(lowerQuery) ||
    p.phone?.includes(query)
  );
}
