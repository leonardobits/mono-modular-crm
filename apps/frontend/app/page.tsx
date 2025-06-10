"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { FeaturesSection } from "./components/landing/features-section";
import { Footer } from "./components/landing/footer";
import { Header } from "./components/landing/header";
import { HeroSection } from "./components/landing/hero-section";
import { TechStackSection } from "./components/landing/tech-stack-section";
import { ContributorsSection } from "./components/landing/contributors-section";

export default function ProfessionalLandingPage() {
  return (
    <>
      <Header />
      <AuroraBackground>
        <main className="flex w-full flex-col items-center">
          <HeroSection />
          <FeaturesSection />
          <TechStackSection />
          <ContributorsSection />
          {/* Futuras seções serão adicionadas aqui: */}
          {/* <ModularAdvantageSection /> */}
          {/* <TestimonialsSection /> */}
          {/* <PricingSection /> */}
          <Footer />
        </main>
      </AuroraBackground>
    </>
  );
}
