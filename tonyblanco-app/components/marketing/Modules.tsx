import { MARKETING_MODULES } from '@/lib/marketing/content';
import { FeatureIcon, MarketingContainer, SectionEyebrow, SectionTitle } from './brand';

export function MarketingModules() {
  return (
    <section
      id="modulos"
      className="border-y border-[var(--ha-line-soft)] bg-[var(--ha-bg-2)] px-7 py-[88px]"
    >
      <MarketingContainer className="flex flex-col gap-12">
        <div className="flex max-w-[680px] flex-col gap-3.5">
          <SectionEyebrow>Módulos de trabajo</SectionEyebrow>
          <SectionTitle>Qué hace por ti y por las personas que acompañas</SectionTitle>
        </div>
        <div className="grid gap-[18px] lg:grid-cols-2">
          {MARKETING_MODULES.map((module) => (
            <article
              key={module.title}
              className="flex flex-col gap-4 rounded-[18px] border border-[var(--ha-line-soft)] bg-[var(--ha-surface)] p-7 shadow-[var(--ha-shadow)]"
            >
              <div className="flex items-center gap-3.5">
                <FeatureIcon paths={module.iconPaths} />
                <h3 className="text-[18px] font-bold text-[var(--ha-ink)]">{module.title}</h3>
              </div>
              <p className="text-[14.5px] leading-[1.55] text-pretty text-[var(--ha-ink-2)]">
                {module.summary}
              </p>
              <dl className="mt-1 flex flex-col gap-3 border-t border-[var(--ha-line-soft)] pt-4">
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ha-acc)]">
                    Para ti
                  </dt>
                  <dd className="text-[14px] leading-[1.5] text-pretty text-[var(--ha-ink-2)]">
                    {module.forYou}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ha-acc)]">
                    Para tu consultante
                  </dt>
                  <dd className="text-[14px] leading-[1.5] text-pretty text-[var(--ha-ink-2)]">
                    {module.forClient}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
