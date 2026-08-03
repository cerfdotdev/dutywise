"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/design/anim";
import { SectionHeading } from "@/components/ui/SectionHeading";

const pillars = [
  {
    n: "01",
    title: "Transparent by design",
    body: "Published per-entry pricing: $99, $89, or $69 by volume. Zero handling fees. No minimums, no 'call for a quote', no line-item surprises. The price on this page is the price you pay.",
    tag: "The price on this page is the price you pay.",
  },
  {
    n: "02",
    title: "Licensed brokers on every filing",
    body: "AI reads your data and drafts the entry. A licensed broker reviews and signs 100% of filings. Speed of software, accountability of a licensed professional — you get both.",
    tag: "100% of filings broker-signed.",
  },
  {
    n: "03",
    title: "Straight-through processing",
    body: "Your entries file in minutes, not days. AES-direct, tied into your ERP or a simple CSV upload. Fewer keystrokes, fewer errors, and every filing tracked to the penny.",
    tag: "Median filing time under 2 minutes.",
  },
];

export function Pillars() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-pillar]",
        { y: 48, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "power4.out",
          stagger: 0.12,
          scrollTrigger: { trigger: section, start: "top 80%" },
        },
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="pillars-heading" className="bg-surface hairline-t hairline-b">
      <div className="shell py-[clamp(5rem,12vw,9rem)]">
        <SectionHeading
          eyebrow="02 — The Fix"
          title="Three ways we're not like your last broker."
          id="pillars-heading"
          sizeClass="text-[clamp(2.25rem,4vw,3.75rem)]"
        />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.n}
              data-pillar
              className="card group flex flex-col rounded-lg p-8 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="stamp grid size-14 place-items-center font-mono text-sm text-harbor-navy transition-transform duration-300 group-hover:rotate-3">
                  {pillar.n}
                </span>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="text-signal-blue">
                  <path d="M5 14 H23 M14 5 V23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                </svg>
              </div>
              <h3 className="mt-8 font-display text-[1.5rem] leading-tight text-harbor-navy">
                {pillar.title}
              </h3>
              <p className="mt-4 flex-1 text-[1.0625rem] leading-[1.7] text-ink-soft">{pillar.body}</p>
              <p className="mt-6 border-t border-hairline pt-4 font-mono text-xs uppercase tracking-[0.18em] text-signal-blue-deep">
                {pillar.tag}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
