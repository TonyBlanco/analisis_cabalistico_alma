'use client';

import { useEffect, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';

interface ContextualMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  badge?: string | number;
  disabled?: boolean;
}

interface ContextualSlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: ContextualMenuItem[];
  /**
   * Desktop/Tablet: slide panel lateral derecho
   * Móvil: overlay fullscreen o bottom sheet
   */
  variant?: 'desktop' | 'mobile';
}

export default function ContextualSlideMenu({
  isOpen,
  onClose,
  title,
  items,
  variant = 'desktop',
}: ContextualSlideMenuProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  if (!isOpen) return null;

  const effectiveVariant = variant === 'mobile' || isMobile ? 'mobile' : 'desktop';

  // Mobile: Full overlay
  if (effectiveVariant === 'mobile') {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        {/* Slide panel from right */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Menu items */}
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {items.map((item) => {
                const content = (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 flex-1">
                      {item.icon && (
                        <span className="text-gray-500">{item.icon}</span>
                      )}
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.href && (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                );

                if (item.disabled) {
                  return (
                    <li key={item.id}>
                      <div className="px-3 py-2.5 rounded-md text-gray-400 cursor-not-allowed opacity-60">
                        {content}
                      </div>
                    </li>
                  );
                }

                if (item.href) {
                  return (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        onClick={onClose}
                        className="block px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {content}
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        item.onClick?.();
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {content}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    );
  }

  // Desktop/Tablet: Slide panel lateral derecho
  return (
    <div className="fixed right-0 top-0 bottom-0 z-40 hidden lg:block">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      {/* Slide panel */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {items.map((item) => {
              const content = (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 flex-1">
                    {item.icon && (
                      <span className="text-gray-500">{item.icon}</span>
                    )}
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.href && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              );

              if (item.disabled) {
                return (
                  <li key={item.id}>
                    <div className="px-3 py-2.5 rounded-md text-gray-400 cursor-not-allowed opacity-60">
                      {content}
                    </div>
                  </li>
                );
              }

              if (item.href) {
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      onClick={onClose}
                      className="block px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {content}
                    </a>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      item.onClick?.();
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {content}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
