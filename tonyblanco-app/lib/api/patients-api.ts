/**
 * API client for consultante data (backend uses 'patient' model)
 * Used to fetch consultantes with MCMI-4 test results for workspace creation
 * Note: Backend models use 'Patient' but UI displays 'Consultante' (holistic, not clinical)
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
 * Fetch all active consultantes for the current therapist
 * Filters for consultantes with MCMI-4 data if filterMcmi4=true
 * (Backend endpoint: /api/therapist/patients/ - 'patient' is internal model name)
 */
export async function fetchPatients(filterMcmi4: boolean = false): Promise<Patient[]> {
  const token = getAuthToken();
  if (!token) {
    console.error('[fetchPatients] No auth token found');
    throw new Error('No authentication token found. Please log in again.');
  }

  console.log('[fetchPatients] Using token:', token.substring(0, 20) + '...');
  const url = `${API_BASE_URL}/therapist/patients/`;
  console.log('[fetchPatients] Fetching from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('[fetchPatients] Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[fetchPatients] HTTP Error:', response.status, errorText);
    throw new Error(`Failed to fetch patients: ${response.status} ${response.statusText}`);
  }

  const data: PatientListResponse = await response.json();
  console.log('[fetchPatients] Response data:', data);
  
  let patients = data.results || [];
  console.log('[fetchPatients] Total consultantes from API:', patients.length);

  // Filter for active consultantes only
  patients = patients.filter(p => p.is_active);
  console.log('[fetchPatients] Active consultantes after filter:', patients.length);

  // If filterMcmi4=true, filter for consultantes with MCMI-4 data
  // TODO: Implement backend filtering or check for TestResult with test_type='mcmi4'
  // For now, return all active consultantes
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
