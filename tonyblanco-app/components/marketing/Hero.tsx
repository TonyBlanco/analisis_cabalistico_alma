import { DashboardMockup, MarketingContainer } from './brand';
import { MarketingButton } from './buttons';

export function MarketingHero() {
  return (
    <header className="relative overflow-hidden px-7 pb-[84px] pt-[116px] text-center">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,var(--ha-glow),transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[-340px] h-[880px] w-[880px] -translate-x-1/2 rounded-full border border-[rgba(212,175,55,0.10)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[-260px] h-[640px] w-[640px] -translate-x-1/2 rounded-full border border-[rgba(212,175,55,0.14)]"
        aria-hidden
      />

      <MarketingContainer className="relative flex max-w-[880px] flex-col items-center gap-[26px]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ha-acc)]">
          Para terapeutas, coaches y guías
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,8vw,4.5rem)] font-semibold leading-[1.06] tracking-[-0.005em] text-balance text-[var(--ha-ink)]">
          Potencia tu práctica con{' '}
          <em className="font-medium not-italic text-[var(--ha-acc)]">análisis simbólico profundo</em>
        </h1>
        <p className="max-w-[620px] text-[19px] leading-[1.55] text-pretty text-[var(--ha-ink-2)]">
          Herramientas profesionales de análisis cabalístico para acompañar a tus pacientes con
          contexto, estructura y rigor — todo en un espacio de trabajo pensado para tu práctica.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3.5">
          <MarketingButton href="/register/therapist" variant="primary" size="lg">
            Comenzar prueba gratuita
          </MarketingButton>
          <MarketingButton href="/login" variant="secondary" size="lg">
            Ya tengo cuenta
          </MarketingButton>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-[18px] text-[13px] text-[var(--ha-ink-3)]">
          <span>Sin tarjeta de crédito</span>
          <span className="text-[rgba(212,175,55,0.5)]" aria-hidden>
            ·
          </span>
          <span>14 días completos</span>
          <span className="text-[rgba(212,175,55,0.5)]" aria-hidden>
            ·
          </span>
          <span>Cancela cuando quieras</span>
        </div>

        <div className="mt-6 w-full max-w-[720px]">
          <DashboardMockup />
        </div>
      </MarketingContainer>
    </header>
  );
}