'use client';

import { usePathname } from 'next/navigation';
import { LucideIcon, Lock } from 'lucide-react';

interface SidebarItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  locked?: boolean;
  badge?: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

export default function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isLocked = item.locked;

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                isLocked
                  ? 'opacity-50 cursor-not-allowed pointer-events-none text-gray-400'
                  : isActive
                  ? 'font-medium shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              style={
                isActive && !isLocked
                  ? {
                      backgroundColor: 'var(--accent-color)',
                      color: 'white',
                      boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
                    }
                  : {}
              }
            >
              {Icon && (
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive && !isLocked ? 'text-white' : isLocked ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
              )}
              <span className="flex-1">{item.label}</span>
              {isLocked && <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
              {item.badge && !isLocked && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

