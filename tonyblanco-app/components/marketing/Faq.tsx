'use client';

import { useState } from 'react';
import { MARKETING_FAQ_GROUPS } from '@/lib/marketing/content';
import { MarketingContainer, SectionEyebrow, SectionTitle } from './brand';
import { cn } from '@/lib/utils';

export function MarketingFaq() {
  const [openKey, setOpenKey] = useState<string | null>('0-0');

  return (
    <section
      id="faq"
      className="border-t border-[var(--ha-line-soft)] bg-[var(--ha-bg-2)] px-7 py-[88px]"
      aria-labelledby="faq-heading"
    >
      <MarketingContainer className="max-w-[820px] flex flex-col gap-10">
        <div className="flex flex-col gap-3.5">
          <SectionEyebrow>Preguntas frecuentes</SectionEyebrow>
          <SectionTitle id="faq-heading">Todo lo que quieres saber antes de empezar</SectionTitle>
        </div>
        <div className="flex flex-col gap-10">
          {MARKETING_FAQ_GROUPS.map((group, groupIndex) => (
            <div key={group.category} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ha-acc)]">
                {group.category}
              </h3>
              <div>
                {group.items.map((faq, itemIndex) => {
                  const key = `${groupIndex}-${itemIndex}`;
                  const isOpen = openKey === key;
                  const panelId = `faq-panel-${key}`;
                  const buttonId = `faq-button-${key}`;

                  return (
                    <div key={faq.question} className="border-b border-[var(--ha-line-soft)]">
                      <button
                        id={buttonId}
                        type="button"
                        className="flex w-full items-center justify-between gap-4 px-1 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenKey(isOpen ? null : key)}
                      >
                        <span className="text-base font-semibold text-[var(--ha-ink)]">{faq.question}</span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--ha-acc)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={cn(
                            'shrink-0 transition-transform duration-200 motion-reduce:transition-none',
                            isOpen && 'rotate-180',
                          )}
                          aria-hidden
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        hidden={!isOpen}
                        className="max-w-[680px] px-1 pb-[22px] text-[15px] leading-[1.6] text-pretty text-[var(--ha-ink-2)]"
                      >
                        {faq.answer}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
