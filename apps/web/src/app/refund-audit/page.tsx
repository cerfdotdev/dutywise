import type { Metadata } from "next";
import { AuditFlow } from "@/components/refund/AuditFlow";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { auditFaqItems } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free refund audit",
  description:
    "Is CBP holding your money? CAPE and IEEPA rulings retroactively lowered duties on thousands of products. Upload your entries for a free eligibility estimate — we file, CBP pays.",
};

export default function RefundAuditPage() {
  return (
    <>
      <section aria-labelledby="audit-hero-heading" className="bg-ledger-paper pt-40 md:pt-48">
        <div className="shell pb-12">
          <p className="eyebrow text-signal-blue-deep">Free refund audit · No card · No broker switch</p>
          <h1
            id="audit-hero-heading"
            className="mt-6 max-w-[14ch] font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.02em] text-harbor-navy"
          >
            Is CBP holding your money?
          </h1>
          <p className="mt-8 max-w-[62ch] text-[1.0625rem] leading-[1.7] text-ink-soft md:text-lg">
            CAPE and IEEPA rulings retroactively lowered duties on thousands of products. If you
            paid the old rate, you may be owed a refund — most importers never learn.
          </p>
        </div>
      </section>

      <AuditFlow />

      <section aria-labelledby="how-refunds-heading" className="bg-surface hairline-t">
        <div className="shell py-[clamp(4rem,8vw,6rem)]">
          <h2 id="how-refunds-heading" className="font-display text-[clamp(2rem,3.5vw,3rem)] text-harbor-navy">
            How refunds work.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "A rate drops retroactively",
                b: "CBP or the courts lower a duty rate and apply it to past entries. You paid the old, higher rate.",
              },
              {
                n: "02",
                t: "We file the claim",
                b: "Post-Summary Correction or protest, prepared from your entries and signed by a licensed broker.",
              },
              {
                n: "03",
                t: "CBP pays you",
                b: "Eligibility is CBP's call. When they approve, they pay you directly — we never take a percentage.",
              },
            ].map((step) => (
              <article key={step.n} className="card rounded-lg p-8">
                <p className="font-display text-5xl text-signal-blue/25">{step.n}</p>
                <h3 className="mt-4 font-display text-xl text-harbor-navy">{step.t}</h3>
                <p className="mt-3 text-[0.9375rem] leading-[1.7] text-ink-soft">{step.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="audit-faq-heading" className="bg-ledger-paper">
        <div className="shell py-[clamp(4rem,8vw,6rem)]">
          <h2 id="audit-faq-heading" className="font-display text-[clamp(2rem,3.5vw,3rem)] text-harbor-navy">
            Audit questions, answered.
          </h2>
          <div className="mt-12">
            <Accordion items={auditFaqItems} />
          </div>
        </div>
      </section>

      <section aria-labelledby="audit-cta-heading" className="bg-harbor-navy text-white">
        <div className="shell py-[clamp(5rem,12vw,8rem)] text-center">
          <p className="eyebrow text-duty-amber">30-day data deletion · Encrypted · No training on your data</p>
          <h2
            id="audit-cta-heading"
            className="mx-auto mt-6 max-w-[14ch] font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05]"
          >
            Your entries. Your refunds. Our work.
          </h2>
          <div className="mt-10 inline-flex">
            <Button href="/pricing" variant="amber" size="lg">
              See pricing
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
