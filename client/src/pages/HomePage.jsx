import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import GlassBoxSection from '@/components/landing/GlassBoxSection';
import UseCasesSection from '@/components/landing/UseCasesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FinalCTASection from '@/components/landing/FinalCTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <GlassBoxSection />
        <UseCasesSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
    </div>
  );
}
