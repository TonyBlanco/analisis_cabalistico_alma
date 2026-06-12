import { MARKETING_FEATURES } from '@/lib/marketing/content';
import { FeatureIcon, MarketingContainer, SectionEyebrow, SectionTitle } from './brand';

export function MarketingFeatureGrid() {
  return (
    <section id="funciones" className="px-7 py-24">
      <MarketingContainer className="flex flex-col gap-12">
        <div className="flex max-w-[640px] flex-col gap-3.5">
          <SectionEyebrow>Funciones</SectionEyebrow>
          <SectionTitle>Todo lo que necesitas para crecer profesionalmente</SectionTitle>
        </div>
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING_FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col gap-3.5 rounded-[18px] border border-[var(--ha-line-soft)] bg-[var(--ha-surface)] p-7 shadow-[var(--ha-shadow)] transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-[var(--ha-acc)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <FeatureIcon paths={feature.iconPaths} />
              <h3 className="text-[17px] font-bold text-[var(--ha-ink)]">{feature.title}</h3>
              <p className="text-[14.5px] leading-[1.55] text-pretty text-[var(--ha-ink-2)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}