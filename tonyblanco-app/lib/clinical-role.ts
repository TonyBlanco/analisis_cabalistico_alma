/**
 * Client-side resolution of the symbolic safety role (Modo Híbrido).
 *
 * This is for UI gating and display ONLY. The authoritative gate is enforced
 * server-side at the BFF (see lib/symbolic-api/role.ts + the interpret route),
 * where the role is resolved from the Django profile using the auth token.
 *
 * The pure mapping (mapProfileToSafetyRole) is shared with the server module so
 * the client and server agree on the policy. Any failure fails safe to
 * 'observational'.
 */

'use client';

import type { SafetyRole } from '@holistica/symbolic/tree';
import { fetchMyProfile } from './profile-api';
import { mapProfileToSafetyRole } from './symbolic-api/role';

export async function resolveClientSafetyRole(): Promise<SafetyRole> {
  try {
    const profile = await fetchMyProfile();
    return mapProfileToSafetyRole(profile);
  } catch {
    return 'observational';
  }
}
