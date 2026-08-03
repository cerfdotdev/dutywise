"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/design/anim";
import { SectionHeading } from "@/components/ui/SectionHeading";

const testimonials = [
  {
    role: "Compliance manager, electronics importer",
    quote:
      "Placeholder quote: filing dropped from days to minutes, and the invoice matched the rate card exactly. Verified first-party quote on its way.",
  },
  {
    role: "CFO, furniture importer",
    quote:
      "Placeholder quote: the refund audit found entries we'd written off. Verified first-party quote on its way.",
  },
  {
    role: "Ops VP, auto-parts distributor",
    quote:
      "Placeholder quote: one flat price across three warehouses changed how we budget freight. Verified first-party quote on its way.",
  },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-quote]",
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.1,
          scrollTrigger: { trigger: section, start: "top 78%" },
        },
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="testimonials-heading" className="bg-ledger-paper">
      <div className="shell py-[clamp(5rem,12vw,9rem)]">
        <SectionHeading
          eyebrow="06 — Word of mouth"
          title="Compliance managers, CFOs, ops VPs."
          id="testimonials-heading"
          sizeClass="text-[clamp(2.25rem,4vw,3.75rem)]"
        />
        <p className="mt-5 max-w-[58ch] font-mono text-xs uppercase leading-relaxed tracking-[0.18em] text-ink-soft">
          Placeholder — first-party quotes are on their way. Layout and length are fixed so real
          copy drops in without shifting the page.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.role}
              data-quote
              className="card flex min-h-[320px] flex-col rounded-lg p-8"
            >
              <div className="flex gap-1" aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 1L10 5.5L15 6.2L11.5 9.6L12.3 14.5L8 12.1L3.7 14.5L4.5 9.6L1 6.2L6 5.5L8 1Z" fill="#F5A623" />
                  </svg>
                ))}
              </div>
              <span aria-hidden="true" className="mt-5 font-display text-6xl leading-none text-signal-blue/30">
                “
              </span>
              <blockquote className="mt-2 flex-1 text-[1.0625rem] leading-[1.7] text-ink">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-hairline pt-4">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal-blue-deep">
                  {t.role}
                </p>
                <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink-soft/70">
                  PLACEHOLDER — awaiting verified quote
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
