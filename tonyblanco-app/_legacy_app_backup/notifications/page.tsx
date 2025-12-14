'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AngelNotificationsPanel from '@/components/AngelNotificationsPanel';

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push('/angels')}
          className="mb-6 flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a los 72 Ángeles
        </button>

        <AngelNotificationsPanel />
      </div>
    </div>
  );
}
