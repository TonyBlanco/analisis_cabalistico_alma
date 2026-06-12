import { MarketingContainer, SectionEyebrow, SectionTitle } from './brand';

type ShowcaseSlotProps = {
  title: string;
  todo: string;
};

function ShowcaseSlot({ title, todo }: ShowcaseSlotProps) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[var(--ha-line-soft)] bg-[var(--ha-surface)] shadow-[var(--ha-shadow)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--ha-line-soft)] px-4 py-3">
        <span className="h-[9px] w-[9px] rounded-full bg-[var(--ha-ink-3)] opacity-50" aria-hidden />
        <span className="h-[9px] w-[9px] rounded-full bg-[var(--ha-ink-3)] opacity-50" aria-hidden />
        <span className="h-[9px] w-[9px] rounded-full bg-[var(--ha-ink-3)] opacity-50" aria-hidden />
        <span className="ml-2 text-xs text-[var(--ha-ink-3)]">{title}</span>
      </div>
      <div
        className="flex h-[330px] flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),rgba(212,175,55,0.06))] px-6 text-center"
        role="img"
        aria-label={`Placeholder: ${title}`}
      >
        <span className="rounded-full border border-dashed border-[var(--ha-line)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ha-acc)]">
          TODO
        </span>
        <p className="max-w-xs text-sm leading-relaxed text-[var(--ha-ink-2)]">{todo}</p>
      </div>
    </div>
  );
}

export function MarketingShowcase() {
  return (
    <section className="px-7 py-24" aria-labelledby="showcase-heading">
      <MarketingContainer className="flex flex-col gap-12">
        <div className="flex max-w-[640px] flex-col gap-3.5">
          <SectionEyebrow>El producto</SectionEyebrow>
          <SectionTitle id="showcase-heading">Así se ve por dentro</SectionTitle>
          <p className="text-[15px] text-[var(--ha-ink-3)]">
            Sustituye estos marcos por capturas reales del producto cuando estén disponibles.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ShowcaseSlot
            title="Dashboard del terapeuta"
            todo="Captura del dashboard del terapeuta"
          />
          <ShowcaseSlot
            title="Centro de Aprendizaje"
            todo="Captura del Centro de Aprendizaje"
          />
        </div>
      </MarketingContainer>
    </section>
  );
}