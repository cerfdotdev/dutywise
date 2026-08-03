"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { canHoverFine, gsap, prefersReducedMotion } from "@/lib/design/anim";

export type ButtonVariant = "primary" | "secondary" | "dark" | "ghost" | "amber";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  ariaLabel?: string;
  magnetic?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-signal-blue text-white shadow-md hover:shadow-lg",
  amber: "bg-duty-amber text-ink shadow-amber hover:shadow-lg",
  secondary: "border border-ink/25 bg-transparent text-ink hover:border-ink",
  dark: "bg-white text-harbor-navy shadow-md hover:shadow-lg",
  ghost: "bg-transparent text-signal-blue-deep hover:text-harbor-navy",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-6 py-3 text-[0.9375rem]",
  lg: "px-8 py-4 text-base",
};

export function Button({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  ariaLabel,
  magnetic = true,
}: ButtonProps) {
  const outerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!magnetic || prefersReducedMotion() || !canHoverFine()) return;
    const outer = outerRef.current;
    if (!outer) return;
    const xTo = gsap.quickTo(outer, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(outer, "y", { duration: 0.4, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const rect = outer.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      xTo(Math.max(-8, Math.min(8, dx / 2)));
      yTo(Math.max(-8, Math.min(8, dy / 2)));
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    outer.addEventListener("pointermove", move);
    outer.addEventListener("pointerleave", leave);
    return () => {
      outer.removeEventListener("pointermove", move);
      outer.removeEventListener("pointerleave", leave);
    };
  }, [magnetic]);

  const pill = variant === "primary" || variant === "amber";
  const classes = `btn-base inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,box-shadow,background-color,border-color] duration-300 hover:scale-[1.03] ${
    pill ? "rounded-full" : "rounded-[12px]"
  } ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const inner = href ? (
    <Link href={href} className={classes} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <button type={type} className={classes} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  );

  return <span ref={outerRef} className="inline-flex will-change-transform">{inner}</span>;
}
