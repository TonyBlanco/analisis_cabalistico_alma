'use client';

import { useEffect, useState } from 'react';
import { getUserRole } from '@/lib/getUserRole';
import RoleBadge from './RoleBadge';
import ProfileMenu from './ProfileMenu';

interface HeaderProps {
  realUserRole: string | null;
  activeDashboardRole?: string | null;
}

export default function Header({ realUserRole, activeDashboardRole }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Kabbalah Aplicada & Psicoterapias del Alma
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {realUserRole && (
            <RoleBadge 
              realUserRole={realUserRole} 
              activeDashboardRole={activeDashboardRole}
            />
          )}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

