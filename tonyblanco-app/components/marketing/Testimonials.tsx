import { MARKETING_TESTIMONIALS } from '@/lib/marketing/content';
import { MarketingContainer, SectionEyebrow, SectionTitle } from './brand';

export function MarketingTestimonials() {
  return (
    <section
      className="border-y border-[var(--ha-line-soft)] bg-[var(--ha-bg-2)] px-7 py-[88px]"
      aria-labelledby="testimonials-heading"
    >
      <MarketingContainer className="flex flex-col gap-11">
        <div className="flex max-w-[640px] flex-col gap-3.5">
          <SectionEyebrow>Quienes ya lo usan</SectionEyebrow>
          <SectionTitle id="testimonials-heading">
            Profesionales que acompañan con más contexto
          </SectionTitle>
          <p className="text-[13px] text-[var(--ha-ink-3)]">
            Testimonios de ejemplo — pendientes de casos reales.
          </p>
        </div>
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING_TESTIMONIALS.map((item) => (
            <figure
              key={item.initials}
              className="flex flex-col gap-[18px] rounded-[18px] border border-[var(--ha-line-soft)] bg-[var(--ha-surface)] p-7 shadow-[var(--ha-shadow)]"
            >
              <span
                className="font-[family-name:var(--font-cormorant)] text-[30px] leading-[0.6] text-[var(--ha-acc)]"
                aria-hidden
              >
                &ldquo;
              </span>
              <blockquote className="flex-1 text-[15.5px] leading-[1.6] text-pretty text-[var(--ha-ink)]">
                {item.text}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--ha-line)] text-[13px] font-bold text-[var(--ha-acc)]">
                  {item.initials}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-[var(--ha-ink)]">{item.name}</span>
                  <span className="text-[12.5px] text-[var(--ha-ink-3)]">{item.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}