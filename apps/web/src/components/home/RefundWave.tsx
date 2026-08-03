"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion, splitIntoLines } from "@/lib/design/anim";
import { Button } from "@/components/ui/Button";

const quarters = [
  { label: "Q3 '25", value: 32, amount: "$1.9M" },
  { label: "Q4 '25", value: 48, amount: "$2.6M" },
  { label: "Q1 '26", value: 41, amount: "$2.3M" },
  { label: "Q2 '26", value: 67, amount: "$3.4M" },
  { label: "Q3 '26", value: 84, amount: "$4.1M" },
  { label: "Q4 '26", value: 100, amount: "$5.2M" },
];

const tickerAmounts = [
  "$124,400 recovered — importer, electronics",
  "$86,020 recovered — importer, furniture",
  "$312,750 recovered — importer, machinery",
  "$48,210 recovered — importer, apparel",
  "$201,900 recovered — importer, auto parts",
];

export function RefundWave() {
  const sectionRef = useRef<HTMLElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    const h2 = h2Ref.current;
    if (!section || !h2) return;
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
        const split = splitIntoLines(h2);
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 1,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: h2, start: "top 82%" },
          onComplete: () => split.revert(),
        });
      };
      void run();

      gsap.fromTo(
        "[data-wave-bar]",
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.4,
          ease: "none",
          stagger: 0.08,
          transformOrigin: "bottom center",
          scrollTrigger: { trigger: section, start: "top 70%", end: "top 15%", scrub: 1 },
        },
      );

      const ticker = section.querySelector<HTMLElement>("[data-wave-ticker]");
      if (ticker) {
        const proxy = { i: 0 };
        gsap.to(proxy, {
          i: tickerAmounts.length - 1,
          duration: tickerAmounts.length * 1.8,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            ticker.textContent = tickerAmounts[Math.round(proxy.i) % tickerAmounts.length];
          },
        });
      }

      gsap.fromTo(
        "[data-wave-fade]",
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: section, start: "top 70%" },
        },
      );
    }, section);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="wave-heading" className="relative overflow-hidden bg-harbor-navy text-white">
      <div className="shell py-[clamp(5rem,12vw,9rem)]">
        <p className="eyebrow mb-5 text-duty-amber" data-wave-fade>
          05 — The refund wave
        </p>
        <h2
          ref={h2Ref}
          id="wave-heading"
          className="max-w-[16ch] font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-[-0.02em]"
        >
          When duty rates fall, importers lose millions. We get it back.
        </h2>

        <div className="mt-16 grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="flex h-64 items-end gap-4 md:h-80" role="img" aria-label="Illustrative bar chart: refunds recovered per quarter, rising from Q3 2025 to Q4 2026">
              {quarters.map((q) => (
                <div key={q.label} className="flex flex-1 flex-col items-center gap-3">
                  <span className="font-mono text-xs text-clearance-green">{q.amount}</span>
                  <div
                    data-wave-bar
                    className="w-full rounded-t-sm bg-clearance-green/80"
                    style={{ height: `${q.value}%` }}
                  />
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-mist">
                    {q.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-mist/70">
              Illustrative data — placeholder until first-party numbers land.
            </p>
          </div>

          <div className="md:col-span-5">
            <p className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.2]">
              We file. <span className="italic text-clearance-green">CBP pays.</span>
            </p>
            <p className="mt-5 max-w-[46ch] leading-[1.7] text-mist">
              CAPE, IEEPA, retroactive rate changes — we monitor the rulings that touch your HTS
              codes and file the claim on your behalf. We never take a percentage of your refund.
              You keep what CBP pays.
            </p>
            <p className="mt-6 border-l-2 border-clearance-green pl-4 font-mono text-xs uppercase tracking-[0.18em] text-mist">
              No-win, no-fee — if CBP rejects a claim we filed, you pay nothing.
            </p>
            <p
              data-wave-ticker
              aria-live="off"
              className="mt-6 min-h-6 border-t border-white/10 pt-5 font-mono text-sm text-duty-amber"
            >
              {tickerAmounts[0]}
            </p>
            <div className="mt-8" data-wave-fade>
              <Button href="/refund-audit" variant="amber" size="lg" ariaLabel="See if you are owed money — run a free refund audit">
                See if you&apos;re owed money
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
