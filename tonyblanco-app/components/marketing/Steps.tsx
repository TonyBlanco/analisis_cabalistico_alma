import { MARKETING_STEPS } from '@/lib/marketing/content';
import { MarketingContainer, SectionEyebrow, SectionTitle } from './brand';

export function MarketingSteps() {
  return (
    <section
      id="como-funciona"
      className="border-y border-[var(--ha-line-soft)] bg-[var(--ha-bg-2)] px-7 py-[88px]"
    >
      <MarketingContainer className="flex flex-col gap-12">
        <div className="flex max-w-[640px] flex-col gap-3.5">
          <SectionEyebrow>Cómo funciona</SectionEyebrow>
          <SectionTitle>De cero a tu primera sesión acompañada</SectionTitle>
        </div>
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING_STEPS.map((step) => (
            <li
              key={step.number}
              className="flex flex-col gap-3 border-t border-[var(--ha-line)] pt-[22px]"
            >
              <span
                className="font-[family-name:var(--font-cormorant)] text-[44px] font-semibold leading-none text-[var(--ha-acc)]"
                aria-hidden
              >
                {step.number}
              </span>
              <h3 className="text-[17px] font-bold text-[var(--ha-ink)]">{step.title}</h3>
              <p className="text-[14.5px] leading-[1.55] text-pretty text-[var(--ha-ink-2)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </MarketingContainer>
    </section>
  );
}