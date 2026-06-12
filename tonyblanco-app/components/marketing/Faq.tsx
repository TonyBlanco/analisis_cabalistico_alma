'use client';

import { useState } from 'react';
import { MARKETING_FAQS } from '@/lib/marketing/content';
import { MarketingContainer, SectionEyebrow, SectionTitle } from './brand';
import { cn } from '@/lib/utils';

export function MarketingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="border-t border-[var(--ha-line-soft)] bg-[var(--ha-bg-2)] px-7 py-[88px]"
      aria-labelledby="faq-heading"
    >
      <MarketingContainer className="max-w-[760px] flex flex-col gap-9">
        <div className="flex flex-col gap-3.5">
          <SectionEyebrow>Preguntas frecuentes</SectionEyebrow>
          <SectionTitle id="faq-heading">Antes de empezar</SectionTitle>
        </div>
        <div>
          {MARKETING_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={faq.question} className="border-b border-[var(--ha-line-soft)]">
                <button
                  id={buttonId}
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-1 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
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
                  className="max-w-[640px] px-1 pb-[22px] text-[15px] leading-[1.6] text-pretty text-[var(--ha-ink-2)]"
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </MarketingContainer>
    </section>
  );
}