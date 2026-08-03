"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/design/anim";

const steps = [
  {
    n: "01",
    title: "Scan",
    body: "Connect your data — ERP, invoices, or a simple upload. AI classifies your goods and flags duty, HTS, and risk before anyone files anything.",
    receipt: [
      ["ENTRY 123-4567890-1", "RECEIVED"],
      ["HTS 8471.30.01", "CLASSIFIED"],
      ["DUTY 3.4%", "ESTIMATED"],
      ["RISK", "CLEAR"],
    ],
  },
  {
    n: "02",
    title: "File",
    body: "A licensed broker reviews and signs. The entry files in minutes, AES-direct, and you can track it end-to-end to the penny.",
    receipt: [
      ["ENTRY 123-4567890-1", "SIGNED"],
      ["BROKER J. MENDOZA", "LIC #5821"],
      ["AES TRANSMISSION", "SENT"],
      ["STATUS", "FILED 11:42 AM"],
    ],
  },
  {
    n: "03",
    title: "Refund",
    body: "We monitor CAPE, IEEPA, and retroactive rate changes on your HTS codes. When duties are refundable, we file — CBP pays you, not us.",
    receipt: [
      ["HTS 8471.30.01", "RATE DROP"],
      ["CAPE RULING", "APPLIES"],
      ["CLAIM FILED", "PSC #88-0112"],
      ["CBP PAYS", "YOU — NOT US"],
    ],
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const track = section.querySelector<HTMLElement>("[data-hiw-track]");
        const rail = section.querySelector<HTMLElement>("[data-hiw-rail]");
        if (!track || !rail) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            pin: true,
            start: "top top",
            end: () => `+=${track.offsetWidth * 0.8}`,
            scrub: 1,
            anticipatePin: 1,
          },
          defaults: { ease: "none" },
        });
        tl.fromTo(
          track,
          { xPercent: 0 },
          { xPercent: -66.6667, duration: 1 },
          0,
        );
        tl.fromTo(rail, { scaleX: 0 }, { scaleX: 1, duration: 1, transformOrigin: "left center" }, 0);

        gsap.utils.toArray<HTMLElement>("[data-hiw-panel]").forEach((panel, i) => {
          const pos = i * 0.5;
          tl.fromTo(
            panel.querySelectorAll<HTMLElement>("[data-reveal]"),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.22, stagger: 0.045 },
            pos + 0.02,
          );
        });
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-hiw-card]").forEach((card) => {
          gsap.fromTo(
            card,
            { y: 40, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.9,
              ease: "power4.out",
              scrollTrigger: { trigger: card, start: "top 85%" },
            },
          );
        });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hiw-heading"
      className="relative overflow-hidden bg-harbor-navy text-white"
      id="how-it-works"
    >
      <div className="shell relative z-10 py-[clamp(5rem,12vw,9rem)] lg:hidden">
        <p className="eyebrow mb-5 text-duty-amber">03 — How it works</p>
        <h2 id="hiw-heading" className="font-display text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.05]">
          Scan. File. Refund.
        </h2>
        <div className="mt-12 space-y-8">
          {steps.map((step) => (
            <article key={step.n} data-hiw-card className="rounded-lg border border-white/10 bg-white/[0.04] p-8">
              <p className="font-display text-6xl text-white/15">{step.n}</p>
              <h3 className="mt-4 font-display text-3xl">{step.title}</h3>
              <p className="mt-3 max-w-[46ch] leading-[1.7] text-mist">{step.body}</p>
              <div className="mt-6 space-y-1.5 rounded-md bg-navy-deep/60 p-4 font-mono text-sm">
                {step.receipt.map(([k, v]) => (
                  <p key={k} className="flex justify-between gap-4">
                    <span className="text-mist">{k}</span>
                    <span className="text-clearance-green">{v}</span>
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 origin-left bg-duty-amber" data-hiw-rail />
        <div className="shell relative z-10 flex h-[100svh] flex-col justify-center">
          <div data-hiw-track className="flex w-[300%] will-change-transform">
            {steps.map((step) => (
              <div key={step.n} data-hiw-panel className="w-[33.3333%] pr-16">
                <div className="flex items-baseline gap-6">
                  <p className="font-display text-[clamp(6rem,14vw,12rem)] leading-none text-white/10">
                    {step.n}
                  </p>
                  <h3 className="font-display text-[clamp(2.5rem,4vw,4rem)]" data-reveal>
                    {step.title}
                  </h3>
                </div>
                <p className="mt-8 max-w-[52ch] text-lg leading-[1.7] text-mist" data-reveal>
                  {step.body}
                </p>
                <div className="mt-10 max-w-[560px] rounded-md border border-white/10 bg-navy-deep/70 p-6 font-mono text-sm shadow-lg" data-reveal>
                  {step.receipt.map(([k, v]) => (
                    <p
                      key={k}
                      className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3 last:border-b-0"
                    >
                      <span className="text-mist">{k}</span>
                      <span className="tracking-wide text-clearance-green">{v}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute left-0 top-[45%] z-0 -translate-y-1/2">
          <p className="rotate-180 font-display text-[clamp(8rem,20vw,16rem)] leading-none text-white/[0.04] [writing-mode:vertical-rl]">
            Scan — File — Refund
          </p>
        </div>
      </div>
    </section>
  );
}
