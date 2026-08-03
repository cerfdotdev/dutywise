"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap, prefersReducedMotion } from "@/lib/design/anim";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const tiers = [
  {
    name: "Starter",
    price: "$99",
    band: "1–1,999 entries / quarter",
    features: ["Licensed broker on every filing", "AES-direct filing", "Refund monitoring + filing included", "Email support"],
    popular: false,
  },
  {
    name: "Growth",
    price: "$89",
    band: "2,000+ entries / quarter",
    features: ["Everything in Starter", "ERP/EDI integration", "Tariff watch on your HTS codes", "Priority support"],
    popular: true,
  },
  {
    name: "Scale",
    price: "$69",
    band: "10,000+ entries / quarter",
    features: ["Everything in Growth", "Multi-location consolidation", "Dedicated licensed broker", "Custom reporting"],
    popular: false,
  },
];

export function PricingPreview() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-tier]",
        { y: 48, autoAlpha: 0, scale: 0.98 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 1,
          ease: "power4.out",
          stagger: 0.1,
          scrollTrigger: { trigger: section, start: "top 72%" },
        },
      );
      gsap.fromTo(
        "[data-tier-pop]",
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "back.out(2)",
          stagger: 0.06,
          scrollTrigger: { trigger: section, start: "top 72%" },
        },
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="pricing-heading" className="bg-ledger-paper" id="pricing">
      <div className="shell py-[clamp(5rem,12vw,9rem)]">
        <SectionHeading
          eyebrow="04 — Pricing"
          title="No handling fees. No minimums. No 'contact us for pricing'."
          id="pricing-heading"
          sizeClass="text-[clamp(2.25rem,4vw,3.75rem)]"
        />
        <p className="mt-6 max-w-[58ch] text-[1.0625rem] leading-[1.7] text-ink-soft">
          Three rates, published in full. Your invoice shows the same numbers as this page —
          because there is nothing else to add.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              data-tier
              className={`card relative flex flex-col rounded-lg p-8 ${
                tier.popular ? "shadow-amber ring-1 ring-duty-amber/50" : "shadow-sm"
              }`}
            >
              {tier.popular ? (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-duty-amber px-4 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-harbor-navy">
                  Most popular
                </span>
              ) : null}
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">{tier.name}</p>
              <p className="mt-3 font-display text-[clamp(3rem,5vw,4.5rem)] leading-none text-harbor-navy" data-tier-pop>
                {tier.price}
                <span className="ml-2 font-mono text-sm text-ink-soft">/ entry</span>
              </p>
              <p className="mt-2 font-mono text-xs text-signal-blue-deep">{tier.band}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[0.9375rem] leading-snug text-ink">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-green-ink">
                      <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8" data-tier-pop>
                <Button href="/pricing" variant={tier.popular ? "primary" : "secondary"} size="md" className="w-full">
                  {tier.popular ? "Start at $89/entry" : tier.name === "Scale" ? "Get volume pricing" : "Start at $99/entry"}
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
          {["No handling fees", "No monthly minimums", "Refunds filed free — no % cut"].map((line) => (
            <p key={line} className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft" data-tier-pop>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="text-green-ink">
                <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {line}
            </p>
          ))}
          <Link href="/pricing" className="font-medium text-signal-blue-deep underline-offset-4 hover:underline" data-tier-pop>
            Full pricing →
          </Link>
        </div>
      </div>
    </section>
  );
}
