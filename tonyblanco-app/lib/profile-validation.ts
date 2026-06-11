/**
 * Profile Validation Utilities
 * 
 * Functions to validate user profile completion before allowing analysis execution.
 */

import { fetchSession } from './session';

export interface ProfileValidationResult {
  isValid: boolean;
  missingFields: string[];
  message?: string;
}

/**
 * Checks if user profile has all required data for analysis execution.
 * 
 * Required fields:
 * - full_name (must contain at least 2 words)
 * - birth_date
 * - birth_city
 * - birth_country
 * 
 * @returns ProfileValidationResult with validation status and missing fields
 */
export async function validateProfileForAnalysis(): Promise<ProfileValidationResult> {
  try {
    const session = await fetchSession();
    
    if (!session.user) {
      return {
        isValid: false,
        missingFields: ['Usuario no autenticado'],
        message: 'Debes estar autenticado para ejecutar análisis',
      };
    }

    const missingFields: string[] = [];
    const user = session.user;
    const birthData = user.birth_data || {};

    // Check full_name (must exist and have at least 2 words)
    const fullName = user.full_name || user.profile?.full_name || '';
    if (!fullName.trim()) {
      missingFields.push('nombre completo');
    } else {
      const nameWords = fullName.trim().split(/\s+/).filter((w: string) => w.length > 0);
      if (nameWords.length < 2) {
        missingFields.push('nombre completo (debe contener al menos nombre y apellido)');
      }
    }

    // Check birth_date
    const birthDate = user.birth_date || birthData.birth_date;
    if (!birthDate) {
      missingFields.push('fecha de nacimiento');
    }

    // Check birth_city
    if (!birthData.birth_city || !birthData.birth_city.trim()) {
      missingFields.push('ciudad de nacimiento');
    }

    // Check birth_country
    if (!birthData.birth_country || !birthData.birth_country.trim()) {
      missingFields.push('país de nacimiento');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      message: missingFields.length > 0
        ? 'Tu perfil necesita información adicional para ejecutar análisis precisos'
        : undefined,
    };
  } catch (error) {
    console.error('Error validating profile:', error);
    return {
      isValid: false,
      missingFields: ['Error al validar perfil'],
      message: 'Error al verificar tu información. Por favor, intenta de nuevo.',
    };
  }
}

/**
 * Synchronous version that checks validation from already-fetched session data.
 * Useful when session is already available in component state.
 */
export function validateProfileFromUser(user: any): ProfileValidationResult {
  if (!user) {
    return {
      isValid: false,
      missingFields: ['Usuario no disponible'],
      message: 'Usuario no disponible',
    };
  }

  const missingFields: string[] = [];
  const birthData = user.birth_data || {};

  // Check full_name
  const fullName = user.full_name || user.profile?.full_name || '';
  if (!fullName.trim()) {
    missingFields.push('nombre completo');
  } else {
    const nameWords = fullName.trim().split(/\s+/).filter((w: string) => w.length > 0);
    if (nameWords.length < 2) {
      missingFields.push('nombre completo (debe contener al menos nombre y apellido)');
    }
  }

  // Check birth_date
  const birthDate = user.birth_date || birthData.birth_date;
  if (!birthDate) {
    missingFields.push('fecha de nacimiento');
  }

  // Check birth_city
  if (!birthData.birth_city || !birthData.birth_city.trim()) {
    missingFields.push('ciudad de nacimiento');
  }

  // Check birth_country
  if (!birthData.birth_country || !birthData.birth_country.trim()) {
    missingFields.push('país de nacimiento');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    message: missingFields.length > 0
      ? 'Tu perfil necesita información adicional para ejecutar análisis precisos'
      : undefined,
  };
}

/**
 * Validates a consultante/patient record for therapist-clinical analysis execution.
 * Uses patient fields from therapist/patients API — NOT the logged-in therapist session.
 */
export function validatePatientForAnalysis(patient: {
  full_name?: string | null;
  first_name?: string | null;
  birth_date?: string | null;
  birth_city?: string | null;
  birth_country?: string | null;
} | null | undefined): ProfileValidationResult {
  if (!patient) {
    return {
      isValid: false,
      missingFields: ['Datos del consultante no disponibles'],
      message: 'Selecciona un consultante activo antes de ejecutar el análisis.',
    };
  }

  const missingFields: string[] = [];
  const fullName = patient.full_name || patient.first_name || '';

  if (!fullName.trim()) {
    missingFields.push('nombre completo');
  } else {
    const nameWords = fullName.trim().split(/\s+/).filter((w) => w.length > 0);
    if (nameWords.length < 2) {
      missingFields.push('nombre completo (debe contener al menos nombre y apellido)');
    }
  }

  if (!patient.birth_date) {
    missingFields.push('fecha de nacimiento');
  }

  if (!patient.birth_city?.trim()) {
    missingFields.push('ciudad de nacimiento');
  }

  if (!patient.birth_country?.trim()) {
    missingFields.push('país de nacimiento');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    message:
      missingFields.length > 0
        ? 'El consultante necesita información adicional para ejecutar análisis precisos'
        : undefined,
  };
}
