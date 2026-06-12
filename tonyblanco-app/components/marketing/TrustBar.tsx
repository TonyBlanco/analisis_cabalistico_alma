import { MarketingContainer } from './brand';

const TRUST_ITEMS = [
  {
    label: 'Conexión cifrada (HTTPS)',
    icon: (
      <>
        <path d="M12 3.5 5 6v6c0 4.4 3 7.4 7 8.5 4-1.1 7-4.1 7-8.5V6l-7-2.5Z" />
        <path d="M9.2 12l2 2 3.6-3.8" />
      </>
    ),
  },
  {
    label: 'Confidencialidad profesional',
    icon: (
      <>
        <rect x="5" y="10.5" width="14" height="9" rx="2" />
        <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
      </>
    ),
  },
  {
    label: 'Sin permanencia',
    icon: (
      <>
        <path d="M19 12a7 7 0 1 1-2-4.9" />
        <path d="M19 4.5V8h-3.5" />
      </>
    ),
  },
];

export function MarketingTrustBar() {
  return (
    <section
      aria-label="Sellos de confianza"
      className="border-y border-[var(--ha-line-soft)] bg-[var(--ha-bg-2)]"
    >
      <MarketingContainer className="flex flex-wrap items-center justify-center gap-10 py-[22px] sm:gap-14">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 text-sm font-medium text-[var(--ha-ink-2)]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ha-acc)"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {item.icon}
            </svg>
            {item.label}
          </div>
        ))}
      </MarketingContainer>
    </section>
  );
}