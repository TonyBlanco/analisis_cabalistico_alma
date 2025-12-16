'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from './session';

type Role = 'admin' | 'therapist' | 'personal' | 'patient';

interface RoleGuardOptions {
  allowedRoles: Role[];
  redirectTo?: string;
}

/**
 * useRoleGuard - Hook simplificado que valida SOLO el rol del usuario
 * 
 * Reglas:
 * - Obtiene el rol automáticamente desde /api/me
 * - Valida SOLO si role está en allowedRoles
 * - NO hace verificaciones adicionales (no has_special_access, no test ownership)
 * - NO redirige si el rol es correcto
 * - Retorna: { role, loading, authorized }
 * - CRITICAL: fetchSession runs ONLY ONCE on mount (useRef guard)
 */
export function useRoleGuard({
  allowedRoles,
  redirectTo = '/login',
}: RoleGuardOptions) {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  
  // CRITICAL: useRef to ensure fetchSession runs ONLY ONCE
  const hasRunRef = useRef(false);

  useEffect(() => {
    // CRITICAL: Only run once on mount
    if (hasRunRef.current) {
      return;
    }
    hasRunRef.current = true;

    let isMounted = true;

    const checkRole = async () => {
      setLoading(true);
      try {
        // fetchSession NEVER throws - always returns safe response
        const session = await fetchSession();
        
        if (!isMounted) return;

        if (!session.isAuthenticated || !session.user) {
          setRole(null);
          setAuthorized(false);
          setLoading(false);
          // Solo redirigir si no hay token (network errors should not trigger redirect)
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (!token) {
              // No token = definitely not authenticated, safe to redirect
              router.replace(redirectTo);
            }
            // If token exists but session fetch failed (network error), 
            // don't redirect - let component render with role=null
          }
          return;
        }

        const user = session.user;
        // Prioridad: profile.user_type > profile.role > user.role > user.user_type
        const userRole = (user.profile?.user_type || 
                         user.profile?.role || 
                         user.role || 
                         user.user_type) as Role | undefined;

        if (!isMounted) return;

        if (userRole && allowedRoles.includes(userRole)) {
          setRole(userRole);
          setAuthorized(true);
        } else if (userRole) {
          // Rol existe pero no está permitido - redirigir al dashboard correcto
          setRole(userRole);
          setAuthorized(false);
          
          // Determine correct dashboard based on role
          const roleDashboardMap: Record<Role, string> = {
            admin: '/dashboard/admin',
            therapist: '/dashboard/therapist',
            personal: '/dashboard/personal',
            patient: '/dashboard/patient',
          };
          
          const correctDashboard = roleDashboardMap[userRole] || redirectTo;
          router.replace(correctDashboard);
        } else {
          // No se pudo determinar el rol
          setRole(null);
          setAuthorized(false);
        }
      } catch (error) {
        // Extra safety: fetchSession should never throw, but catch just in case
        if (!isMounted) return;
        console.warn('Unexpected error in useRoleGuard (should not happen):', error);
        // Never break render - set safe defaults
        setRole(null);
        setAuthorized(false);
        // Don't redirect on unexpected errors - let component handle it
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkRole();

    return () => {
      isMounted = false;
    };
  }, []); // CRITICAL: Empty deps - run ONLY on mount

  return {
    role,
    loading,
    authorized,
  };
}
