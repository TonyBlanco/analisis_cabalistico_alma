'use client';

import { useState } from 'react';
import { PLAN_PREMIUM_FEATURES, PLAN_PRO_FEATURES } from '@/lib/marketing/content';
import { MarketingContainer, SectionEyebrow, SectionTitle } from './brand';
import { MarketingButton } from './buttons';
import { cn } from '@/lib/utils';

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-[var(--ha-ink-2)]">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--ha-acc)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
        aria-hidden
      >
        <path d="M4 12.5l4.5 4.5L20 6.5" />
      </svg>
      {children}
    </li>
  );
}

export function MarketingPricing() {
  const [annual, setAnnual] = useState(false);
  const priceSuffix = annual ? '€ / mes · facturado anualmente' : '€ / mes';

  return (
    <section id="planes" className="px-7 py-24" aria-labelledby="pricing-heading">
      <MarketingContainer narrow className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <SectionEyebrow>Planes</SectionEyebrow>
          <SectionTitle id="pricing-heading">Elige cómo quieres trabajar</SectionTitle>
          <p className="text-[15px] text-[var(--ha-ink-2)]">
            Empieza con 14 días gratis en cualquier plan. Sin tarjeta.
          </p>
        </div>

        <div
          className="inline-flex gap-1 rounded-full border border-[var(--ha-line-soft)] bg-[var(--ha-surface)] p-1"
          role="group"
          aria-label="Periodo de facturación"
        >
          <button
            type="button"
            className={cn(
              'rounded-full px-5 py-2 text-[13.5px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]',
              !annual
                ? 'bg-[var(--ha-acc)] text-[var(--ha-acc-ink)]'
                : 'text-[var(--ha-ink-2)]',
            )}
            aria-pressed={!annual}
            onClick={() => setAnnual(false)}
          >
            Mensual
          </button>
          <button
            type="button"
            className={cn(
              'rounded-full px-5 py-2 text-[13.5px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]',
              annual
                ? 'bg-[var(--ha-acc)] text-[var(--ha-acc-ink)]'
                : 'text-[var(--ha-ink-2)]',
            )}
            aria-pressed={annual}
            onClick={() => setAnnual(true)}
          >
            Anual
          </button>
        </div>

        <div className="grid w-full gap-[22px] md:grid-cols-2">
          <article className="flex flex-col gap-[22px] rounded-[20px] border border-[var(--ha-line-soft)] bg-[var(--ha-surface)] p-[34px] shadow-[var(--ha-shadow)]">
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-[var(--ha-ink)]">Profesional</h3>
              <div className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-cormorant)] text-[54px] font-semibold leading-none text-[var(--ha-ink)]">
                  —
                </span>
                <span className="text-sm text-[var(--ha-ink-3)]">{priceSuffix}</span>
              </div>
              <p className="text-xs text-[var(--ha-ink-3)]">Precio por definir</p>
            </div>
            <ul className="flex flex-1 flex-col gap-3">
              {PLAN_PRO_FEATURES.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
            <MarketingButton href="/register/therapist" variant="outline-gold" size="sm">
              Comenzar prueba gratuita
            </MarketingButton>
          </article>

          <article className="relative flex flex-col gap-[22px] rounded-[20px] border-[1.5px] border-[var(--ha-acc)] bg-[var(--ha-surface)] p-[34px] shadow-[0_0_0_4px_var(--ha-ring),var(--ha-shadow)]">
            <span className="absolute right-[18px] top-[18px] rounded-full bg-[image:var(--ha-grad)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--ha-acc-ink)]">
              Popular
            </span>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-[var(--ha-ink)]">Premium</h3>
              <div className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-cormorant)] text-[54px] font-semibold leading-none text-[var(--ha-acc)]">
                  —
                </span>
                <span className="text-sm text-[var(--ha-ink-3)]">{priceSuffix}</span>
              </div>
              <p className="text-xs text-[var(--ha-ink-3)]">Precio por definir</p>
            </div>
            <ul className="flex flex-1 flex-col gap-3">
              {PLAN_PREMIUM_FEATURES.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
            <MarketingButton href="/register/therapist" variant="primary" size="sm">
              Comenzar prueba gratuita
            </MarketingButton>
          </article>
        </div>
      </MarketingContainer>
    </section>
  );
}