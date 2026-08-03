"use client";

import { useLayoutEffect, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/design/anim";

export function Preloader() {
  const [gone, setGone] = useState(false);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      const id = requestAnimationFrame(() => setGone(true));
      return () => cancelAnimationFrame(id);
    }
    if (sessionStorage.getItem("dw:seeded")) {
      const id = requestAnimationFrame(() => setGone(true));
      return () => cancelAnimationFrame(id);
    }
    sessionStorage.setItem("dw:seeded", "1");

    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const countEl = document.querySelector<HTMLElement>("[data-preloader-count]");
      const tl = gsap.timeline({ onComplete: () => setGone(true) });
      tl.to(
        counter,
        {
          v: 100,
          duration: 0.7,
          ease: "power2.inOut",
          snap: { v: 1 },
          onUpdate: () => {
            if (countEl) countEl.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        },
        0,
      );
      tl.to(
        "[data-preloader-ring]",
        { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
        0,
      );
      tl.to("[data-preloader]", { yPercent: -100, duration: 0.6, ease: "expo.inOut" }, 0.72);
      tl.set("[data-preloader]", { display: "none" }, ">");
    });

    return () => ctx.revert();
  }, []);

  if (gone) return null;

  return (
    <div
      data-preloader
      aria-hidden="true"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-harbor-navy"
    >
      <div className="relative flex flex-col items-center">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-6">
          <circle
            cx="60"
            cy="60"
            r="52"
            stroke="#F5A623"
            strokeWidth="2"
            strokeDasharray="1"
            strokeDashoffset="1"
            pathLength={1}
            data-preloader-ring
          />
          <circle cx="60" cy="60" r="44" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 6" />
          <text
            x="60"
            y="60"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FAF8F4"
            fontSize="30"
            fontWeight="600"
            fontFamily="var(--font-fraunces), serif"
          >
            DW
          </text>
        </svg>
        <p className="font-display text-2xl text-white">DutyWise</p>
        <p
          data-preloader-count
          className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-mist"
        >
          000
        </p>
      </div>
    </div>
  );
}
