import Link from 'next/link';
import { BrandLogo, MarketingContainer } from './brand';

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--ha-line-soft)] px-7 py-11">
      <MarketingContainer className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <BrandLogo size="sm" />
          <nav aria-label="Legal" className="flex flex-wrap gap-6 text-[13.5px] text-[var(--ha-ink-2)]">
            <Link href="/terms" className="rounded-sm hover:text-[var(--ha-acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]">
              Términos
            </Link>
            <Link href="/privacy" className="rounded-sm hover:text-[var(--ha-acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]">
              Privacidad
            </Link>
            <Link href="/cookies" className="rounded-sm hover:text-[var(--ha-acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]">
              Cookies
            </Link>
          </nav>
        </div>
        <p className="max-w-[720px] text-[12.5px] leading-[1.6] text-[var(--ha-ink-3)]">
          Holistica Aplicada es una plataforma de herramientas para profesionales del bienestar
          integral y el desarrollo humano. No ofrece servicios médicos ni sustituye el criterio
          profesional de cada terapeuta.
        </p>
        <p className="text-[12.5px] text-[var(--ha-ink-3)]">
          © {new Date().getFullYear()} Tony Blanco. Todos los derechos reservados.
        </p>
      </MarketingContainer>
    </footer>
  );
}