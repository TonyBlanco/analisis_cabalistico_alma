import type { Metadata } from 'next';
import {
  MarketingAbout,
  MarketingCtaBand,
  MarketingFaq,
  MarketingFeatureGrid,
  MarketingFooter,
  MarketingHero,
  MarketingModules,
  MarketingNav,
  MarketingPricing,
  MarketingShowcase,
  MarketingSteps,
  MarketingTestimonials,
  MarketingTrustBar,
} from '@/components/marketing';
import { MARKETING_METADATA } from '@/lib/marketing/content';

export const metadata: Metadata = {
  title: MARKETING_METADATA.title,
  description: MARKETING_METADATA.description,
  openGraph: {
    title: MARKETING_METADATA.openGraph.title,
    description: MARKETING_METADATA.openGraph.description,
    type: 'website',
    locale: 'es_ES',
    siteName: 'Holistica Aplicada',
  },
  twitter: {
    card: 'summary_large_image',
    title: MARKETING_METADATA.openGraph.title,
    description: MARKETING_METADATA.openGraph.description,
  },
};

export default function TherapistLandingPage() {
  return (
    <>
      <MarketingNav />
      <main>
        <MarketingHero />
        <MarketingTrustBar />
        <MarketingAbout />
        <MarketingFeatureGrid />
        <MarketingModules />
        <MarketingSteps />
        <MarketingShowcase />
        <MarketingTestimonials />
        <MarketingPricing />
        <MarketingFaq />
        <MarketingCtaBand />
      </main>
      <MarketingFooter />
    </>
  );
}
