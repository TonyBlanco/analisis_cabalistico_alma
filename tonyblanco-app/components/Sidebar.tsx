'use client';

import { usePathname } from 'next/navigation';

interface SidebarItem {
  href: string;
  label: string;
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
          return (
            <a
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--accent-color)',
                      color: 'white',
                    }
                  : {}
              }
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

