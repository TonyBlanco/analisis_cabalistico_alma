 'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TherapistBackLink() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <Link href="/dashboard/therapist" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </Link>
    </div>
  );
}
