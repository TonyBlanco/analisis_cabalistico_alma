import { MarketingContainer } from './brand';
import { MarketingButton } from './buttons';

export function MarketingCtaBand() {
  return (
    <section className="px-7 py-24" aria-labelledby="cta-heading">
      <MarketingContainer className="max-w-[880px]">
        <div className="relative overflow-hidden rounded-[26px] border border-[var(--ha-line)] bg-[var(--ha-bg-2)] px-8 py-16 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_90%_at_50%_-20%,var(--ha-glow),transparent_70%)]"
            aria-hidden
          />
          <div className="relative flex flex-col items-center gap-[22px]">
            <h2
              id="cta-heading"
              className="font-[family-name:var(--font-cormorant)] text-[clamp(2rem,5vw,2.75rem)] font-semibold leading-[1.12] text-balance text-[var(--ha-ink)]"
            >
              Empieza hoy tu prueba de 14 días
            </h2>
            <p className="text-base text-[var(--ha-ink-2)]">
              Sin compromiso, sin tarjeta de crédito. Configura tu práctica en minutos.
            </p>
            <MarketingButton href="/register/therapist" variant="primary" size="lg">
              Comenzar ahora
            </MarketingButton>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}