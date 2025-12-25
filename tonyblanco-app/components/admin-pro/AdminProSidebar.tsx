'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdminSectionKind } from '@/lib/contracts/adminWorkspace.v2';

type Section = { id: string; title: string; enabled: boolean; kind: AdminSectionKind };

const groupTitles: Record<AdminSectionKind, string> = {
  system: 'SISTEMA',
  users: 'USUARIOS & AUTH',
  platform: 'PLATAFORMA',
  lms: 'LMS',
  config: 'CONFIG',
};

export function AdminProSidebar(props: { sections: Section[]; headerOffsetPx?: number }) {
  const { sections, headerOffsetPx = 56 } = props;
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
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white md:block">
      <div className="sticky" style={{ top: headerOffsetPx }}>
        <div className="border-b px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Admin Pro</div>
          <div className="mt-0.5 text-xs text-gray-700">Backoffice</div>
        </div>

        <nav className="p-2">
          {orderedKinds.map((kind) => {
            const items = groups[kind] || [];
            if (!items.length) return null;

            return (
              <div key={kind} className="mb-3 rounded-md border">
                <div className="border-b bg-gray-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
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
                          className={`w-full rounded-md px-2.5 py-2 text-left text-xs font-medium ${
                            isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
