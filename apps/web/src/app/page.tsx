import { Hero } from "@/components/home/Hero";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { Stats } from "@/components/home/Stats";
import { Problem } from "@/components/home/Problem";
import { Pillars } from "@/components/home/Pillars";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PricingPreview } from "@/components/home/PricingPreview";
import { RefundWave } from "@/components/home/RefundWave";
import { Testimonials } from "@/components/home/Testimonials";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustMarquee />
      <Stats />
      <Problem />
      <Pillars />
      <HowItWorks />
      <PricingPreview />
      <RefundWave />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
