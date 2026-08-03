"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion, splitIntoLines } from "@/lib/design/anim";

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  dark?: boolean;
  align?: "left" | "center";
  className?: string;
  sizeClass?: string;
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  as: Tag = "h2",
  dark = false,
  align = "left",
  className = "",
  sizeClass = "text-[clamp(2.5rem,5vw,4.5rem)]",
  id,
}: SectionHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
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
        const split = splitIntoLines(el);
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 1,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 82%" },
          onComplete: () => split.revert(),
        });
      };
      void run();
    }, el);
    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);

  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
      {eyebrow ? (
        <p className={`eyebrow mb-5 ${dark ? "text-duty-amber" : "text-signal-blue-deep"}`}>
          {eyebrow}
        </p>
      ) : null}
      <Tag
        ref={ref}
        id={id}
        className={`font-display leading-[1.05] tracking-[-0.02em] ${sizeClass} ${
          dark ? "text-white" : "text-harbor-navy"
        }`}
      >
        {title}
      </Tag>
    </div>
  );
}
