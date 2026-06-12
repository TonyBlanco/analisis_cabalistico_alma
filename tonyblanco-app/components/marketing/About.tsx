import { MarketingContainer, SectionEyebrow, SectionTitle } from './brand';
import { MARKETING_ABOUT } from '@/lib/marketing/content';

export function MarketingAbout() {
  return (
    <section id="que-es" className="px-7 py-24">
      <MarketingContainer className="flex flex-col gap-12">
        <div className="flex max-w-[760px] flex-col gap-4">
          <SectionEyebrow>{MARKETING_ABOUT.eyebrow}</SectionEyebrow>
          <SectionTitle>{MARKETING_ABOUT.title}</SectionTitle>
          <p className="text-[17px] leading-[1.6] text-pretty text-[var(--ha-ink-2)]">
            {MARKETING_ABOUT.lead}
          </p>
        </div>
        <div className="grid gap-[18px] sm:grid-cols-3">
          {MARKETING_ABOUT.points.map((point) => (
            <div
              key={point.title}
              className="flex flex-col gap-2.5 rounded-[18px] border border-[var(--ha-line-soft)] bg-[var(--ha-surface)] p-7 shadow-[var(--ha-shadow)]"
            >
              <h3 className="text-[17px] font-bold text-[var(--ha-ink)]">{point.title}</h3>
              <p className="text-[14.5px] leading-[1.55] text-pretty text-[var(--ha-ink-2)]">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
