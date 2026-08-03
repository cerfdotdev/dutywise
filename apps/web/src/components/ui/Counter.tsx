"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/design/anim";

type CounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
};

function formatValue(value: number, prefix: string, suffix: string, decimals: number): string {
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

export function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.2,
  className = "",
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = formatValue(value, prefix, suffix, decimals);
      return;
    }
    el.textContent = formatValue(0, prefix, suffix, decimals);
    const proxy = { v: 0 };
    const tween = gsap.to(proxy, {
      v: value,
      duration,
      ease: "power2.out",
      snap: { v: 1 / Math.pow(10, decimals) },
      onUpdate: () => {
        el.textContent = formatValue(proxy.v, prefix, suffix, decimals);
      },
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, prefix, suffix, decimals, duration]);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={formatValue(value, prefix, suffix, decimals)}
      data-count
    >
      {formatValue(value, prefix, suffix, decimals)}
    </span>
  );
}
