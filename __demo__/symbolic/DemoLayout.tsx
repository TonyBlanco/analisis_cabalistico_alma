'use client';

import type { ReactNode } from 'react';

interface DemoLayoutProps {
  children: ReactNode;
}

export default function DemoLayout({ children }: DemoLayoutProps) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
      <div
        style={{
          border: '2px solid #111827',
          padding: '12px 16px',
          marginBottom: '16px',
          background: '#fef3c7',
          color: '#111827',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        DEMO MODE – SYMBOLIC VISUALIZATION
      </div>
      {children}
    </div>
  );
}
