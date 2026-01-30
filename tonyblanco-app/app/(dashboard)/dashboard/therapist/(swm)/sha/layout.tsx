import type { ReactNode } from 'react';

export default function SHALayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
