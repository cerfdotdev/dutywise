"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/design/anim";
import { SectionHeading } from "@/components/ui/SectionHeading";

const paragraphs = [
  "Per-entry pricing hides behind quotes. Your broker emails a rate sheet; the invoice shows something else. Entry fees, handling fees, minimums, line items no one explained.",
  "Refunds sit on the table. CAPE and IEEPA rulings retroactively lowered duties on thousands of products. Most brokers never tell you. Most importers never learn they were overcharged.",
  "You find out at the worst moment — a hold, a surprise bill, an entry that cost three times the quote — and there is no plain-English answer on the other end of the phone.",
  "You shouldn't need a spreadsheet to know what your broker costs. You shouldn't need a lawyer to get your money back.",
];

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      const mazePath = section.querySelector<SVGPathElement>("[data-maze-path]");
      if (mazePath) {
        gsap.fromTo(
          mazePath,
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 65%",
              end: "bottom 75%",
              scrub: 1,
            },
          },
        );
      }
      gsap.fromTo(
        "[data-maze-stamp]",
        { scale: 0, autoAlpha: 0, rotate: -12 },
        {
          scale: 1,
          autoAlpha: 1,
          rotate: -6,
          duration: 0.6,
          ease: "back.out(1.8)",
          scrollTrigger: {
            trigger: section,
            start: "bottom 70%",
            once: true,
          },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-problem-p]").forEach((p) => {
        gsap.fromTo(
          p,
          { autoAlpha: 0.18, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: p,
              start: "top 78%",
              end: "top 42%",
              scrub: 1,
            },
          },
        );
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="problem-heading"
      className="bg-ledger-paper"
    >
      <div className="shell grid gap-14 py-[clamp(5rem,12vw,9rem)] md:grid-cols-12">
        <div className="md:col-span-5 md:sticky md:top-32 md:self-start">
          <SectionHeading
            eyebrow="01 — The Problem"
            title="Customs brokerage shouldn't be a black box."
            id="problem-heading"
            sizeClass="text-[clamp(2.25rem,4vw,3.75rem)]"
          />
          <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-[1.7] text-ink-soft">
            Your broker charges you for every line. We charge one flat price. That simple.
          </p>
        </div>

        <div className="md:col-span-7">
          <div className="space-y-10">
            {paragraphs.map((text, i) => (
              <p
                key={i}
                data-problem-p
                className="max-w-[52ch] font-display text-[clamp(1.5rem,2.5vw,2.125rem)] leading-[1.35] text-harbor-navy"
              >
                {text}
              </p>
            ))}
          </div>

          <div className="relative mt-16 h-56 overflow-hidden rounded-md border border-hairline bg-surface md:h-72">
            <svg
              className="h-full w-full"
              viewBox="0 0 800 300"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                data-maze-path
                d="M20 150 H180 Q240 150 240 90 Q240 30 320 30 H500 Q560 30 560 90 Q560 150 620 150 Q680 150 680 210 Q680 270 760 270 H780"
                fill="none"
                stroke="#2E6FD9"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1"
                pathLength={1}
              />
              <circle cx="20" cy="150" r="5" fill="#F5A623" />
              <circle cx="780" cy="270" r="5" fill="#2E6FD9" />
            </svg>
            <span
              data-maze-stamp
              aria-hidden="true"
              className="stamp absolute right-6 top-6 flex size-32 flex-col items-center justify-center bg-ledger-paper/95 text-center md:size-40"
            >
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ink-soft">
                The maze
              </span>
              <span className="mt-1 px-4 font-display text-lg leading-tight text-harbor-navy md:text-xl">
                You don&apos;t know the cost
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
