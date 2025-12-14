'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/lib/session';
import { clearAuthState } from '@/lib/auth-state';
import Link from 'next/link';

/**
 * Profile Menu Component
 * 
 * Shows user avatar/name in header with dropdown menu:
 * - "Mi perfil"
 * - "Cerrar sesión"
 */
export default function ProfileMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSession().then((session) => {
      if (session.user) {
        setUser(session.user);
      }
    });
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      // Hard reset: Clear ALL authentication state
      clearAuthState();
      
      // Redirect to login
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, clear everything and redirect
      clearAuthState();
      router.replace('/login');
    }
  };

  if (!user) {
    return null;
  }

  const displayName = user.full_name || user.first_name || user.username || 'Usuario';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        {/* Avatar circle with initials */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {displayName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          <Link
            href="/dashboard/account"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Mi cuenta
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
