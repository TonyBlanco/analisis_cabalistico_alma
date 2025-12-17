'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, FileText, Folder, TrendingUp, User } from 'lucide-react';

export default function PatientSidebar() {
  const pathname = usePathname();

  const items = [
    { href: '/dashboard/patient', label: 'Inicio', icon: Home },
    { href: '/dashboard/patient/tests', label: 'Tests', icon: ClipboardList },
    { href: '/dashboard/patient/results', label: 'Resultados', icon: FileText },
    { href: '/dashboard/patient/resources', label: 'Recursos', icon: Folder },
    { href: '/dashboard/patient/process', label: 'Proceso', icon: TrendingUp },
    { href: '/dashboard/patient/account', label: 'Cuenta', icon: User },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Panel de Paciente</h2>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                isActive
                  ? 'bg-violet-100 text-violet-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-violet-600' : 'text-gray-500'}`} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
