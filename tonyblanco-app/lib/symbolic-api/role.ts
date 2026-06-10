/**
 * Server-side resolution of the symbolic safety role (Modo Híbrido).
 *
 * The role is the single source of truth for whether the clinical lexicon is
 * unlocked, and it is resolved from the Django profile
 * (UserProfile.clinical_mode_enabled / can_use_clinical_lexicon) using the
 * caller's auth token. It is NEVER trusted from the request body. Any failure
 * fails safe to 'observational' (the most restrictive role).
 */

import type { SafetyRole } from '@holistica/symbolic/tree';
import { getDjangoApiBase } from './server';

export interface ClinicalProfileFields {
  user_type?: string | null;
  clinical_mode_enabled?: boolean | null;
  can_use_clinical_lexicon?: boolean | null;
}

/**
 * Pure mapping from Django profile fields to a SafetyRole.
 * 'clinical' only when the backend explicitly grants it; otherwise observational.
 */
export function mapProfileToSafetyRole(
  profile: ClinicalProfileFields | null | undefined,
): SafetyRole {
  if (!profile) return 'observational';
  if (profile.can_use_clinical_lexicon === true) return 'clinical';
  if (profile.user_type === 'therapist' && profile.clinical_mode_enabled === true) {
    return 'clinical';
  }
  return 'observational';
}

/**
 * Resolve the safety role from the Django backend using the caller's token.
 * Fails safe to 'observational'.
 */
export async function resolveSafetyRole(
  authorization: string | null,
): Promise<SafetyRole> {
  if (!authorization) return 'observational';
  try {
    const res = await fetch(`${getDjangoApiBase()}/profile/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
      cache: 'no-store',
    });
    if (!res.ok) return 'observational';
    const profile = (await res.json()) as ClinicalProfileFields;
    return mapProfileToSafetyRole(profile);
  } catch {
    return 'observational';
  }
}
