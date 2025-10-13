// client/src/components/landing/HomePage.tsx

import React from "react";

// Import the five section components we created
import { HeroSection } from "@/components/landing/HeroSection";
import { GuaranteeSection } from "@/components/landing/GuaranteeSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ProofOfConceptSection } from "@/components/landing/ProofOfConceptSection";
import { ContactFormSection } from "@/components/landing/ContactFormSection";

// This is our new "Coming Soon" homepage component
export default function HomePage() {
    return (
        <main className="flex flex-col min-h-screen">
            {/* This component assembles our five sections in the correct order.
        The global navbar and footer will be handled by the main app layout.
      */}
            <HeroSection />
            <GuaranteeSection />
            <HowItWorksSection />
            <ProofOfConceptSection />
            <ContactFormSection />
        </main>
    );
}