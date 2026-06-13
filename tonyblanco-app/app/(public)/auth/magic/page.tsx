'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyMagicLink } from '@/lib/api/auth-advanced';
import { completeAuthFromToken } from '@/lib/finishAuthSession';
import { BrandLogo } from '@/components/marketing/brand';
import { ArrowLeft, Loader2 } from 'lucide-react';

function MagicLinkRedeem() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Enlace inválido. Solicita uno nuevo desde el login.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await verifyMagicLink(token);
        if (cancelled) return;
        const path = await completeAuthFromToken(res.token, res.role);
        router.replace(path);
      } catch (err: unknown) {
        if (cancelled) return;
        const response = (err as { response?: { message?: string } })?.response;
        setError(response?.message || 'El enlace expiró o ya fue usado.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ha-bg)] p-8">
      <div className="w-full max-w-md text-center">
        <BrandLogo />
        {error ? (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-[#F87171]">{error}</p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ha-acc)] hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>
          </div>
        ) : (
          <div className="mt-8 inline-flex items-center gap-2 text-sm text-[var(--ha-ink-2)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verificando enlace mágico...
          </div>
        )}
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando...</div>}>
      <MagicLinkRedeem />
    </Suspense>
  );
}