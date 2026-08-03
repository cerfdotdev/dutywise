"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion, splitIntoLines } from "@/lib/design/anim";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    const h1 = h1Ref.current;
    if (!section || !h1) return;
    let cancelled = false;

    const ctx = gsap.context(() => {
      const run = async () => {
        if (cancelled) return;
        try {
          await document.fonts.ready;
        } catch {
          // fonts API unavailable; split anyway
        }
        if (cancelled) return;
        const split = splitIntoLines(h1);
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(split.lines, { yPercent: 110, duration: 1, stagger: 0.09 }, 0);
        tl.fromTo(
          "[data-hero-underline]",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: "power3.out" },
          0.45,
        );
        tl.fromTo(
          "[data-hero-sub]",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" },
          0.3,
        );
        tl.fromTo(
          "[data-hero-cta]",
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 },
          0.45,
        );
        tl.fromTo(
          "[data-hero-chips]",
          { autoAlpha: 0, scale: 0.85 },
          { autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(1.6)", stagger: 0.06 },
          0.6,
        );
        tl.fromTo("[data-hero-trust]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.8);
      };
      void run();

      gsap.fromTo(
        "[data-hero-bg]",
        { yPercent: 20 },
        {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    }, section);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-harbor-navy text-white"
    >
      <div data-hero-bg aria-hidden="true" className="absolute inset-0 will-change-transform">
        <svg className="h-full w-full" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
          <g stroke="rgba(255,255,255,0.045)" strokeWidth="1">
            {Array.from({ length: 13 }, (_, i) => (
              <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="900" />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 100} x2="1200" y2={i * 100} />
            ))}
          </g>
          <g fill="none" stroke="rgba(184,199,220,0.10)" strokeWidth="1">
            {[
              "M -50 640 Q 200 520 420 600 T 900 540 T 1250 620",
              "M -50 760 Q 260 640 480 720 T 980 660 T 1250 740",
            ].map((d, i) => (
              <path key={`p${i}`} d={d} strokeDasharray="6 10" />
            ))}
          </g>
          <g fill="rgba(245,166,35,0.16)">
            <circle cx="180" cy="170" r="4" />
            <circle cx="1010" cy="210" r="5" />
            <circle cx="620" cy="790" r="4" />
            <circle cx="1150" cy="520" r="3" />
            <circle cx="90" cy="420" r="3" />
          </g>
        </svg>
      </div>

      <div className="shell relative z-10 py-32">
        <p className="eyebrow mb-7 text-duty-amber">AI-native customs brokerage for US importers</p>
        <h1
          ref={h1Ref}
          id="hero-heading"
          className="relative max-w-[14ch] font-display text-[clamp(3.5rem,8vw,7rem)] leading-[1.02] tracking-[-0.02em]"
        >
          Duties, <em className="italic">done right.</em>
          <span
            data-hero-underline
            aria-hidden="true"
            className="absolute bottom-[-0.06em] left-[31%] h-[0.045em] w-[36%] origin-left rounded-full bg-duty-amber"
          />
        </h1>
        <p data-hero-sub className="mt-9 max-w-[58ch] text-[1.0625rem] leading-[1.7] text-mist md:text-lg">
          We file your customs entries with licensed brokers on staff, at a flat $69–$99 per entry
          — no handling fees, no hourly billing, no surprises. When CBP owes you a refund, we file
          it. They pay you.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <span data-hero-cta>
            <Button href="/refund-audit" variant="amber" size="lg" ariaLabel="Get your refund estimate — free">
              Get your refund estimate — free
            </Button>
          </span>
          <span data-hero-cta>
            <Button href="/pricing" variant="dark" size="lg" ariaLabel="See pricing">
              See pricing
            </Button>
          </span>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <span data-hero-chips>
            <Chip tone="amber">$99 / entry</Chip>
          </span>
          <span data-hero-chips>
            <Chip tone="outline">$89 / entry · 2,000+</Chip>
          </span>
          <span data-hero-chips>
            <Chip tone="outline">$69 / entry · 10,000+</Chip>
          </span>
          <span data-hero-chips className="sr-only" />
          <p data-hero-chips className="font-mono text-xs uppercase tracking-[0.18em] text-mist">
            Published rates · $0 handling
          </p>
        </div>
        <p
          data-hero-trust
          className="mt-10 border-t border-white/10 pt-6 font-mono text-xs uppercase tracking-[0.18em] text-mist"
        >
          100% of filings signed by licensed brokers · SOC 2 in progress · CBP-approved software
        </p>
      </div>
    </section>
  );
}
