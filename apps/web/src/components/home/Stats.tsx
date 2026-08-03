"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/design/anim";
import { Counter } from "@/components/ui/Counter";

type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  bar: "amber" | "green";
};

const stats: Stat[] = [
  { value: 2, prefix: "≤", suffix: " min", label: "average filing time, data to ACE", bar: "amber" },
  { value: 0, prefix: "$", suffix: "", label: "handling fees, ever", bar: "green" },
  { value: 100, prefix: "", suffix: "%", label: "filings signed by a licensed broker", bar: "amber" },
  { value: 12.4, prefix: "$", suffix: "M", decimals: 1, label: "refunds recovered*", bar: "green" },
];

export function Stats() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-stat]",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power4.out",
          stagger: 0.09,
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        },
      );
      gsap.fromTo(
        "[data-stat-bar]",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.1,
          ease: "power3.inOut",
          stagger: 0.12,
          transformOrigin: "left center",
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        },
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-label="DutyWise by the numbers" className="bg-ledger-paper">
      <div className="shell grid grid-cols-1 gap-y-12 py-[clamp(5rem,12vw,9rem)] sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} data-stat className="border-l-2 border-hairline pl-6">
            <p className="font-display text-[clamp(2.5rem,4vw,3.5rem)] font-medium leading-none text-harbor-navy">
              <Counter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals ?? 0}
              />
            </p>
            <div
              data-stat-bar
              aria-hidden="true"
              className={`mt-5 h-1.5 w-24 origin-left rounded-full ${
                stat.bar === "amber" ? "bg-duty-amber" : "bg-clearance-green"
              }`}
            />
            <p className="mt-4 max-w-[22ch] text-[0.9375rem] leading-[1.6] text-ink-soft">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      <p className="shell pb-10 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft/70">
        *Placeholder — verify with first-party data before public use.
      </p>
    </section>
  );
}
