import type { Metadata } from 'next';
import { LandingNavbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero';
import { StatsBar } from '@/components/landing/stats-bar';
import { FeaturesSection } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { TestimonialsSection } from '@/components/landing/testimonials';
import { CtaSection } from '@/components/landing/cta';
import { LandingFooter } from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'Sell on Createconomy',
  description:
    'Start selling digital products on Createconomy. Join thousands of creators earning from their passion.',
};

export default function SellerLandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <HowItWorks />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
