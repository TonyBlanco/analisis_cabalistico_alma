/**
 * Active Patient Context Management
 * 
 * Provides a simple way to manage the currently active patient in the therapist dashboard.
 * Uses localStorage for persistence with in-memory fallback.
 * 
 * This is FRONTEND-ONLY state management - no backend calls.
 */

const ACTIVE_PATIENT_ID_KEY = 'therapist_active_patient_id';
const ACTIVE_PATIENT_NAME_KEY = 'therapist_active_patient_name';

// In-memory fallback (for SSR/initial render)
let inMemoryPatientId: number | null = null;
let inMemoryPatientName: string | null = null;

/**
 * Get the currently active patient ID
 * 
 * @returns Patient ID (number) or null if no patient is active
 */
export function getActivePatientId(): number | null {
  // Only run in browser
  if (typeof window === 'undefined') {
    return inMemoryPatientId;
  }

  try {
    const stored = localStorage.getItem(ACTIVE_PATIENT_ID_KEY);
    if (stored) {
      const id = parseInt(stored, 10);
      if (!isNaN(id)) {
        return id;
      }
    }
  } catch (error) {
    console.warn('Error reading active patient ID from localStorage:', error);
    return inMemoryPatientId;
  }

  return null;
}

/**
 * Get the currently active patient name (for UI display)
 * 
 * @returns Patient name (string) or null if no patient is active or name not stored
 */
export function getActivePatientName(): string | null {
  // Only run in browser
  if (typeof window === 'undefined') {
    return inMemoryPatientName;
  }

  try {
    const stored = localStorage.getItem(ACTIVE_PATIENT_NAME_KEY);
    if (stored) {
      return stored;
    }
  } catch (error) {
    console.warn('Error reading active patient name from localStorage:', error);
    return inMemoryPatientName;
  }

  return null;
}

/**
 * Set the active patient ID and optionally the name
 * 
 * @param patientId - Patient ID (number)
 * @param patientName - Optional patient name for UI display
 */
export function setActivePatientId(patientId: number, patientName?: string | null): void {
  // Only run in browser
  if (typeof window === 'undefined') {
    inMemoryPatientId = patientId;
    if (patientName) {
      inMemoryPatientName = patientName;
    }
    return;
  }

  try {
    localStorage.setItem(ACTIVE_PATIENT_ID_KEY, patientId.toString());
    
    if (patientName) {
      localStorage.setItem(ACTIVE_PATIENT_NAME_KEY, patientName);
      inMemoryPatientName = patientName;
    } else {
      // If name not provided, try to keep existing name or clear if patient changed
      const existingId = getActivePatientId();
      if (existingId !== patientId) {
        // Different patient - clear name if new ID
        localStorage.removeItem(ACTIVE_PATIENT_NAME_KEY);
        inMemoryPatientName = null;
      }
    }
    
    inMemoryPatientId = patientId;
  } catch (error) {
    console.warn('Error setting active patient ID in localStorage:', error);
    // Fallback to in-memory
    inMemoryPatientId = patientId;
    if (patientName) {
      inMemoryPatientName = patientName;
    }
  }
}

/**
 * Clear the active patient (reset to no active patient)
 */
export function clearActivePatientId(): void {
  // Only run in browser
  if (typeof window === 'undefined') {
    inMemoryPatientId = null;
    inMemoryPatientName = null;
    return;
  }

  try {
    localStorage.removeItem(ACTIVE_PATIENT_ID_KEY);
    localStorage.removeItem(ACTIVE_PATIENT_NAME_KEY);
  } catch (error) {
    console.warn('Error clearing active patient from localStorage:', error);
  }

  inMemoryPatientId = null;
  inMemoryPatientName = null;
}

/**
 * Get active patient info as an object
 * 
 * @returns Object with id and name, or null if no active patient
 */
export function getActivePatient(): { id: number; name: string | null } | null {
  const id = getActivePatientId();
  if (id === null) {
    return null;
  }

  return {
    id,
    name: getActivePatientName(),
  };
}
