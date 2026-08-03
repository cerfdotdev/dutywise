"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/design/anim";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { faqItems } from "@/lib/site";

export function Faq() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-faq-head]",
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power4.out",
          scrollTrigger: { trigger: section, start: "top 80%", once: true },
        },
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="faq-heading" className="bg-surface hairline-t">
      <div className="shell py-[clamp(5rem,12vw,9rem)]">
        <div data-faq-head>
          <SectionHeading
            eyebrow="07 — Questions"
            title="Asked and answered, plainly."
            id="faq-heading"
            sizeClass="text-[clamp(2.25rem,4vw,3.75rem)]"
          />
        </div>
        <div data-faq-head className="mt-14">
          <Accordion items={faqItems} />
        </div>
        <p data-faq-head className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
          Still unsure? Talk to a licensed broker, not a bot — M–F 8–6 ET ·{" "}
          <a href="mailto:hello@dutywise.example" className="text-signal-blue-deep underline underline-offset-4 hover:text-harbor-navy">
            hello@dutywise.example
          </a>
        </p>
      </div>
    </section>
  );
}
