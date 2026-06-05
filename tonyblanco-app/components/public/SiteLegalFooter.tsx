'use client';

import Link from 'next/link';

type SiteLegalFooterProps = {
  compact?: boolean;
};

export default function SiteLegalFooter({ compact = false }: SiteLegalFooterProps) {
  return (
    <footer className={compact ? 'mt-8 border-t border-gray-200 pt-6' : 'mt-16 border-t border-gray-200 bg-white'}>
      <div className={compact ? 'text-center' : 'mx-auto max-w-6xl px-4 py-8 text-center'}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
          <Link href="/terms" className="hover:text-violet-700 hover:underline">
            Términos
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/privacy" className="hover:text-violet-700 hover:underline">
            Privacidad
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/cookies" className="hover:text-violet-700 hover:underline">
            Cookies
          </Link>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          © {new Date().getFullYear()} Studios33. Uso profesional y personal con enfoque de privacidad.
        </p>
      </div>
    </footer>
  );
}
