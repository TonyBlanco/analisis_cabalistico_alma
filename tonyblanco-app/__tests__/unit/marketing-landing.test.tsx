import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarketingFaq } from '@/components/marketing/Faq';
import {
  MARKETING_FAQS,
  MARKETING_FEATURES,
  MARKETING_METADATA,
} from '@/lib/marketing/content';

describe('marketing content', () => {
  it('exposes SEO metadata for the landing', () => {
    expect(MARKETING_METADATA.title).toContain('Holistica Aplicada');
    expect(MARKETING_METADATA.description.length).toBeGreaterThan(20);
  });

  it('lists six verifiable feature cards', () => {
    expect(MARKETING_FEATURES).toHaveLength(6);
    expect(MARKETING_FEATURES.some((f) => f.title.includes('Centro de Aprendizaje'))).toBe(true);
  });

  it('does not promise per-element report explanations in FAQ', () => {
    const cabalaFaq = MARKETING_FAQS[0].answer.toLowerCase();
    expect(cabalaFaq).not.toContain('explica cada elemento');
  });
});

describe('MarketingFaq', () => {
  it('toggles aria-expanded on click', async () => {
    const user = userEvent.setup();
    render(<MarketingFaq />);

    const firstButton = screen.getByRole('button', {
      name: MARKETING_FAQS[0].question,
    });
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  });
});