'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { BrandLogo, MarketingContainer } from './brand';
import { MarketingButton } from './buttons';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '#funciones', label: 'Funciones' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#planes', label: 'Planes' },
  { href: '#faq', label: 'FAQ' },
];

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[var(--ha-line-soft)] bg-[var(--ha-nav-bg)] backdrop-blur-2xl"
      aria-label="Principal"
    >
      <MarketingContainer className="flex h-[68px] items-center justify-between gap-6">
        <Link href="/" className="shrink-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]">
          <BrandLogo />
        </Link>

        <div className="hidden items-center gap-[26px] text-sm font-medium text-[var(--ha-ink-2)] lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm transition-colors hover:text-[var(--ha-acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          <MarketingButton href="/login" variant="ghost" size="sm">
            Iniciar sesión
          </MarketingButton>
          <MarketingButton href="/register/therapist" variant="primary" size="sm">
            Prueba gratis 14 días
          </MarketingButton>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ha-line-soft)] text-[var(--ha-ink)] lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="marketing-mobile-menu"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </MarketingContainer>

      <div
        id="marketing-mobile-menu"
        className={cn(
          'border-t border-[var(--ha-line-soft)] bg-[var(--ha-bg)] lg:hidden',
          mobileOpen ? 'block' : 'hidden',
        )}
      >
        <MarketingContainer className="flex flex-col gap-4 py-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--ha-ink-2)] hover:text-[var(--ha-acc)]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2.5 pt-2">
            <MarketingButton href="/login" variant="ghost" size="sm">
              Iniciar sesión
            </MarketingButton>
            <MarketingButton href="/register/therapist" variant="primary" size="sm">
              Prueba gratis 14 días
            </MarketingButton>
          </div>
        </MarketingContainer>
      </div>
    </nav>
  );
}