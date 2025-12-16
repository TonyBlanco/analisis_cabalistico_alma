'use client';

import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';

interface SidebarItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  locked?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  onClose?: () => void;
}

export default function Sidebar({ items, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Only render sidebar if there are items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 shadow-lg lg:shadow-none">
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          const isLocked = item.locked === true;

          // Determine if this is a personal role sidebar (soft indigo/violet accent)
          // Check if any item has /personal or /resources in href, or if items include locked items (personal-specific)
          const isPersonalSidebar = items.some(i => 
            i.href.includes('/personal') || 
            i.href.includes('/resources') ||
            i.locked === true
          );
          // Soft indigo (#6366f1) for personal, default accent for others
          const accentColor = isPersonalSidebar ? '#6366f1' : 'var(--accent-color)';

          return (
            <div key={item.href}>
              {isLocked ? (
                <div
                  className="block px-3 py-2 rounded-md text-sm text-gray-400 cursor-not-allowed opacity-60"
                  title="Próximamente"
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                    <span className="flex-1">{item.label}</span>
                    <Lock className="w-3 h-3 flex-shrink-0 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-400 ml-6 mt-0.5 block">Próximamente</span>
                </div>
              ) : (
                <a
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (onClose && window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                    isActive
                      ? 'font-medium'
                      : isPersonalSidebar
                      ? 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: accentColor,
                          color: 'white',
                          boxShadow: `0 0 0 1px ${accentColor}20, 0 2px 8px ${accentColor}25`,
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2">
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive 
                            ? 'text-white' 
                            : isPersonalSidebar
                            ? 'text-indigo-500'
                            : 'text-gray-500'
                        }`}
                      />
                    )}
                    <span>{item.label}</span>
                  </div>
                </a>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

