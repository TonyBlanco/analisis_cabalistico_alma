/**
 * Profile Gate Hook
 * 
 * Provides a hook to check profile completion before executing analysis.
 * Returns validation state and function to check before executing.
 */

import { useState, useEffect } from 'react';
import { fetchSession } from './session';
import { validateProfileFromUser, ProfileValidationResult } from './profile-validation';

export interface UseProfileGateReturn {
  isProfileComplete: boolean;
  validationResult: ProfileValidationResult | null;
  checkAndExecute: (executeFn: () => void | Promise<void>) => Promise<{ shouldExecute: boolean; missingFields: string[] }>;
}

export function useProfileGate(): UseProfileGateReturn {
  const [user, setUser] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<ProfileValidationResult | null>(null);

  useEffect(() => {
    fetchSession().then((session) => {
      if (session.user) {
        setUser(session.user);
        const validation = validateProfileFromUser(session.user);
        setValidationResult(validation);
      }
    });
  }, []);

  const checkAndExecute = async (executeFn: () => void | Promise<void>): Promise<{ shouldExecute: boolean; missingFields: string[] }> => {
    let currentUser = user;
    
    // If user not loaded yet, fetch it
    if (!currentUser) {
      const session = await fetchSession();
      if (session.user) {
        currentUser = session.user;
        setUser(currentUser);
      }
    }

    const validation = validateProfileFromUser(currentUser);
    setValidationResult(validation);

    if (validation.isValid) {
      await executeFn();
      return { shouldExecute: true, missingFields: [] };
    } else {
      return { shouldExecute: false, missingFields: validation.missingFields };
    }
  };

  const validation = validateProfileFromUser(user);

  return {
    isProfileComplete: validation.isValid,
    validationResult: validationResult || validation,
    checkAndExecute,
  };
}
