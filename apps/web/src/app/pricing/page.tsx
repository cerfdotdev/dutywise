import type { Metadata } from "next";
import { RateCard } from "@/components/pricing/RateCard";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { pricingFaqItems } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One price. Per entry. No surprises. $99, $89, or $69 per entry — $0 handling, no minimums. ISF, bond, and disbursement add-ons, refund recovery included at no percentage cut.",
};

export default function PricingPage() {
  return (
    <>
      <section aria-labelledby="pricing-hero-heading" className="bg-harbor-navy pt-40 text-white md:pt-48">
        <div className="shell pb-16 md:pb-24">
          <p className="eyebrow text-duty-amber">Pricing</p>
          <h1
            id="pricing-hero-heading"
            className="mt-6 max-w-[14ch] font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.02em]"
          >
            One price. Per entry. No surprises.
          </h1>
          <p className="mt-8 max-w-[58ch] text-[1.0625rem] leading-[1.7] text-mist md:text-lg">
            $99, $89, or $69 per entry depending on volume. Zero handling fees. No monthly
            minimums. No &ldquo;call for a quote.&rdquo; The numbers on this page are the numbers
            on your invoice.
          </p>
        </div>
      </section>

      <RateCard />

      <section aria-labelledby="pricing-faq-heading" className="bg-ledger-paper">
        <div className="shell py-[clamp(5rem,12vw,9rem)]">
          <h2 id="pricing-faq-heading" className="font-display text-[clamp(2rem,3.5vw,3rem)] text-harbor-navy">
            Pricing questions, answered.
          </h2>
          <div className="mt-12">
            <Accordion items={pricingFaqItems} />
          </div>
        </div>
      </section>

      <section aria-labelledby="pricing-cta-heading" className="bg-harbor-navy text-white">
        <div className="shell py-[clamp(5rem,12vw,8rem)] text-center">
          <p className="eyebrow text-duty-amber">Cancel anytime · No annual contract</p>
          <h2
            id="pricing-cta-heading"
            className="mx-auto mt-6 max-w-[14ch] font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05]"
          >
            Start with the free refund audit.
          </h2>
          <div className="mt-10 inline-flex">
            <Button href="/refund-audit" variant="amber" size="lg">
              Run a free refund audit
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
