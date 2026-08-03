"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { canHoverFine, gsap, prefersReducedMotion } from "@/lib/design/anim";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useLayoutEffect(() => {
    if (!canHoverFine() || prefersReducedMotion()) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -120, y: -120 });
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const hot = Boolean(
        target?.closest?.("a, button, [role='button'], [data-cursor]"),
      );
      gsap.to(ring, {
        width: hot ? 64 : 36,
        height: hot ? 64 : 36,
        backgroundColor: hot ? "rgba(46,111,217,0.08)" : "rgba(46,111,217,0)",
        duration: 0.3,
        ease: "power3.out",
      });
      ring.dataset.hot = hot ? "true" : "false";
    };

    setEnabled(true);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[120] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      <div ref={dotRef} className="absolute left-0 top-0 size-3 rounded-full bg-signal-blue" />
      <div
        ref={ringRef}
        data-hot="false"
        className="group absolute left-0 top-0 flex size-9 items-center justify-center rounded-full border border-signal-blue/60 transition-[background-color] duration-300"
      >
        <span className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-signal-blue opacity-0 transition-opacity duration-300 group-data-[hot=true]:opacity-100">
          View
        </span>
      </div>
    </div>
  );
}
