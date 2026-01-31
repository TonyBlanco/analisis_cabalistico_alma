/**
 * Active Consultante Context Management
 * 
 * Provides a unified way to manage the currently active consultante in the therapist dashboard.
 * Uses localStorage for persistence with in-memory fallback.
 * 
 * This replaces active-patient.ts with support for UUID-based consultantes.
 * Legacy functions are provided for backward compatibility.
 * 
 * Ver: docs/UNIFIED_CONSULTANTE_ARCHITECTURE.md
 */

const ACTIVE_CONSULTANTE_KEY = 'therapist_active_consultante';

// Legacy keys (for backward compatibility)
const LEGACY_PATIENT_ID_KEY = 'therapist_active_patient_id';
const LEGACY_PATIENT_NAME_KEY = 'therapist_active_patient_name';

// ==============================================================================
// TYPES
// ==============================================================================

export interface ActiveConsultante {
  uuid: string;        // Primary identifier (UUID)
  id: number;          // Compatibility (user_id) for assignments
  name: string;        // Display name
}

// In-memory fallback (for SSR/initial render)
let inMemoryConsultante: ActiveConsultante | null = null;

// ==============================================================================
// MAIN FUNCTIONS (NEW API)
// ==============================================================================

/**
 * Get the currently active consultante
 * 
 * @returns ActiveConsultante object or null if no consultante is active
 */
export function getActiveConsultante(): ActiveConsultante | null {
  // Only run in browser
  if (typeof window === 'undefined') {
    return inMemoryConsultante;
  }

  try {
    const stored = localStorage.getItem(ACTIVE_CONSULTANTE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate required fields
      if (parsed && parsed.uuid && parsed.id && parsed.name) {
        return parsed as ActiveConsultante;
      }
    }
    
    // Try to migrate from legacy format
    const legacyId = localStorage.getItem(LEGACY_PATIENT_ID_KEY);
    const legacyName = localStorage.getItem(LEGACY_PATIENT_NAME_KEY);
    
    if (legacyId) {
      const id = parseInt(legacyId, 10);
      if (!isNaN(id)) {
        return {
          uuid: '',  // Will need to be resolved
          id,
          name: legacyName || `Consultante #${id}`,
        };
      }
    }
  } catch (error) {
    console.warn('Error reading active consultante from localStorage:', error);
    return inMemoryConsultante;
  }

  return null;
}

/**
 * Set the active consultante
 * 
 * @param consultante - ActiveConsultante object
 */
export function setActiveConsultante(consultante: ActiveConsultante): void {
  // Only run in browser
  if (typeof window === 'undefined') {
    inMemoryConsultante = consultante;
    return;
  }

  try {
    localStorage.setItem(ACTIVE_CONSULTANTE_KEY, JSON.stringify(consultante));
    
    // Also update legacy keys for backward compatibility
    localStorage.setItem(LEGACY_PATIENT_ID_KEY, consultante.id.toString());
    localStorage.setItem(LEGACY_PATIENT_NAME_KEY, consultante.name);
    
    inMemoryConsultante = consultante;
    
    // Dispatch event for listeners
    window.dispatchEvent(new CustomEvent('activeConsultanteChanged', { 
      detail: consultante 
    }));
  } catch (error) {
    console.warn('Error setting active consultante in localStorage:', error);
    // Fallback to in-memory
    inMemoryConsultante = consultante;
  }
}

/**
 * Clear the active consultante (reset to no active consultante)
 */
export function clearActiveConsultante(): void {
  // Only run in browser
  if (typeof window === 'undefined') {
    inMemoryConsultante = null;
    return;
  }

  try {
    localStorage.removeItem(ACTIVE_CONSULTANTE_KEY);
    // Also clear legacy keys
    localStorage.removeItem(LEGACY_PATIENT_ID_KEY);
    localStorage.removeItem(LEGACY_PATIENT_NAME_KEY);
    
    // Dispatch event for listeners
    window.dispatchEvent(new CustomEvent('activeConsultanteChanged', { 
      detail: null 
    }));
  } catch (error) {
    console.warn('Error clearing active consultante from localStorage:', error);
  }

  inMemoryConsultante = null;
}

/**
 * Get the active consultante's user ID (for assignments)
 * 
 * @returns User ID (number) or null
 */
export function getActiveConsultanteUserId(): number | null {
  const consultante = getActiveConsultante();
  return consultante?.id ?? null;
}

/**
 * Get the active consultante's UUID
 * 
 * @returns UUID (string) or null
 */
export function getActiveConsultanteUuid(): string | null {
  const consultante = getActiveConsultante();
  return consultante?.uuid ?? null;
}

/**
 * Get the active consultante's display name
 * 
 * @returns Name (string) or null
 */
export function getActiveConsultanteName(): string | null {
  const consultante = getActiveConsultante();
  return consultante?.name ?? null;
}

// ==============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// ==============================================================================

/**
 * Get the currently active patient ID (LEGACY)
 * 
 * @deprecated Use getActiveConsultante() instead
 * @returns Patient ID (number) or null
 */
export function getActivePatientId(): number | null {
  const consultante = getActiveConsultante();
  return consultante?.id ?? null;
}

/**
 * Get the currently active patient name (LEGACY)
 * 
 * @deprecated Use getActiveConsultante() instead
 * @returns Patient name (string) or null
 */
export function getActivePatientName(): string | null {
  const consultante = getActiveConsultante();
  return consultante?.name ?? null;
}

/**
 * Set the active patient ID (LEGACY)
 * 
 * @deprecated Use setActiveConsultante() instead
 * @param patientId - Patient ID (number)
 * @param patientName - Optional patient name
 */
export function setActivePatientId(patientId: number, patientName?: string | null): void {
  setActiveConsultante({
    uuid: '',  // Will need to be resolved by backend
    id: patientId,
    name: patientName || `Consultante #${patientId}`,
  });
}

/**
 * Clear the active patient (LEGACY)
 * 
 * @deprecated Use clearActiveConsultante() instead
 */
export function clearActivePatientId(): void {
  clearActiveConsultante();
}

/**
 * Get active patient info (LEGACY)
 * 
 * @deprecated Use getActiveConsultante() instead
 * @returns Object with id and name, or null
 */
export function getActivePatient(): { id: number; name: string | null } | null {
  const consultante = getActiveConsultante();
  if (!consultante) return null;
  
  return {
    id: consultante.id,
    name: consultante.name,
  };
}

// ==============================================================================
// EVENT LISTENERS
// ==============================================================================

/**
 * Subscribe to active consultante changes
 * 
 * @param callback - Function to call when active consultante changes
 * @returns Unsubscribe function
 */
export function subscribeToActiveConsultante(
  callback: (consultante: ActiveConsultante | null) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: CustomEvent<ActiveConsultante | null>) => {
    callback(event.detail);
  };

  window.addEventListener('activeConsultanteChanged', handler as EventListener);

  return () => {
    window.removeEventListener('activeConsultanteChanged', handler as EventListener);
  };
}
