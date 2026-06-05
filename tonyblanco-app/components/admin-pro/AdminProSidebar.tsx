'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdminSectionKind } from '@/lib/contracts/adminWorkspace.v2_1';
import { scrollToPageSection } from '@/lib/reset-page-scroll';
import { ADMIN_HEADER_HEIGHT_PX } from './admin-layout';

type Section = { id: string; title: string; enabled: boolean; kind: AdminSectionKind };

const groupTitles: Record<AdminSectionKind, string> = {
  system: 'SISTEMA',
  users: 'USUARIOS & AUTH',
  platform: 'PLATAFORMA',
  lms: 'LMS',
  config: 'CONFIG',
};

export function AdminProSidebar(props: { sections: Section[]; headerOffsetPx?: number; variant?: 'side' | 'mobile' }) {
  const { sections, headerOffsetPx = ADMIN_HEADER_HEIGHT_PX, variant = 'side' } = props;
  const [activeId, setActiveId] = useState<string>('dashboard');

  const enabled = useMemo(() => sections.filter((s) => s.enabled), [sections]);

  useEffect(() => {
    const ids = enabled.map((s) => s.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));
        const first = visible[0];
        if (first?.target && (first.target as HTMLElement).id) {
          setActiveId((first.target as HTMLElement).id);
        }
      },
      {
        root: null,
        rootMargin: `-${headerOffsetPx + 8}px 0px -70% 0px`,
        threshold: [0.05, 0.2, 0.4],
      }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, headerOffsetPx]);

  const scrollTo = (id: string) => {
    setActiveId(id);
    scrollToPageSection(id, headerOffsetPx);
  };

  const groups = useMemo(() => {
    const byKind: Record<string, Section[]> = {};
    for (const s of enabled) {
      const key = s.kind;
      byKind[key] = byKind[key] || [];
      byKind[key].push(s);
    }
    return byKind as Record<AdminSectionKind, Section[]>;
  }, [enabled]);

  const orderedKinds: AdminSectionKind[] = ['system', 'users', 'platform', 'lms', 'config'];

  const navItems = orderedKinds.flatMap((kind) => {
    const items = groups[kind] || [];
    return items.map((item) => ({ ...item, kind }));
  });

  if (variant === 'mobile') {
    return (
      <nav
        aria-label="Secciones admin"
        className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 [scrollbar-gutter:stable] md:hidden"
      >
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium ${
                isActive
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.title}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white lg:block xl:w-64">
      <div
        className="sticky flex max-h-[calc(100dvh-52px)] flex-col overscroll-contain"
        style={{ top: headerOffsetPx }}
      >
        <div className="shrink-0 border-b border-slate-200 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Admin Pro</div>
          <div className="mt-0.5 text-xs text-slate-700">Backoffice</div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-gutter:stable]">
          {orderedKinds.map((kind) => {
            const items = groups[kind] || [];
            if (!items.length) return null;

            return (
              <div key={kind} className="mb-3 rounded-md border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  {groupTitles[kind]}
                </div>
                <ul className="p-1">
                  {items.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => scrollTo(item.id)}
                          className={`w-full text-left text-sm ${
                            isActive
                              ? 'border-l-4 border-blue-600 bg-slate-100 py-1 pl-3 text-slate-900'
                              : 'border-l-4 border-transparent py-1 pl-3 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {item.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
