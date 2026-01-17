/**
 * API client for patient data
 * Used to fetch patients with MCMI-4 test results for workspace creation
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Patient {
  id: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  birth_date?: string;
  is_active: boolean;
  therapist?: number;
  has_mcmi4_data?: boolean; // Flag to indicate if patient has completed MCMI-4
}

export interface PatientListResponse {
  results: Patient[];
  count: number;
}

/**
 * Get auth token from localStorage
 * Uses 'authToken' key (standard in this app)
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Fetch all active patients for the current therapist
 * Filters for patients with MCMI-4 data if filterMcmi4=true
 */
export async function fetchPatients(filterMcmi4: boolean = false): Promise<Patient[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = `${API_BASE_URL}/therapist/patients/`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch patients: ${response.statusText}`);
  }

  const data: PatientListResponse = await response.json();
  let patients = data.results || [];

  // Filter for active patients only
  patients = patients.filter(p => p.is_active);

  // If filterMcmi4=true, filter for patients with MCMI-4 data
  // TODO: Implement backend filtering or check for TestResult with test_type='mcmi4'
  // For now, return all active patients
  if (filterMcmi4) {
    // Future: call /api/therapist/patients/?has_mcmi4=true
    // For now, we trust the SWM backend will validate mcmi4_source_data_id
  }

  return patients;
}

/**
 * Fetch a single patient by ID
 */
export async function fetchPatientById(patientId: number): Promise<Patient> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = `${API_BASE_URL}/therapist/patients/${patientId}/`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch patient: ${response.statusText}`);
  }

  return response.json();
}
