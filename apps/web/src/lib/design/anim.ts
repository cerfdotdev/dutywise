"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip);

export { gsap, ScrollTrigger, SplitText, Flip, CustomEase };

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const canHoverFine = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export type SmoothScroll = { lenis: Lenis; ticker: (t: number) => void };

export function initLenis(): SmoothScroll | null {
  if (prefersReducedMotion()) return null;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  const ticker = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);
  return { lenis, ticker };
}

export function destroySmoothScroll(smooth: SmoothScroll | null): void {
  if (!smooth) return;
  gsap.ticker.remove(smooth.ticker);
  smooth.lenis.destroy();
}

export function stopSmoothScroll(smooth: SmoothScroll | null): void {
  smooth?.lenis.stop();
}

export function startSmoothScroll(smooth: SmoothScroll | null): void {
  smooth?.lenis.start();
}

export function splitIntoLines(el: HTMLElement): SplitText {
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "st-line",
    aria: "auto",
  });
}

export function fadeUp(
  targets: gsap.TweenTarget,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  return gsap.from(targets, {
    y: 48,
    autoAlpha: 0,
    duration: 1,
    ease: "power4.out",
    stagger: 0.08,
    ...vars,
  });
}

export function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}
