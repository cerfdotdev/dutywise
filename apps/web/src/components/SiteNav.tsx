"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion } from "@/lib/design/anim";
import { navLinks } from "@/lib/site";
import { Button } from "@/components/ui/Button";

export function SiteNav({ sandbox }: { sandbox: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const overlayRef = useRef<HTMLDivElement>(null);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
      );
      gsap.fromTo(
        "[data-overlay-link]",
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: "power4.out", stagger: 0.07, delay: 0.08 },
      );
    }, overlayRef);
    return () => ctx.revert();
  }, [open]);

  const onLight = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-[70]">
      {sandbox ? (
        <p className="bg-duty-amber py-1.5 text-center font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-harbor-navy">
          Sandbox — demo environment. No real filings or refunds are processed.
        </p>
      ) : null}
      <nav
        aria-label="Primary"
        className={`transition-colors duration-300 ${
          onLight
            ? "border-b border-hairline bg-ledger-paper/90 text-ink backdrop-blur-sm"
            : "border-b border-transparent bg-transparent text-white"
        }`}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="group flex flex-col leading-none" aria-label="DutyWise home">
            <span className="font-display text-[1.55rem] font-semibold tracking-tight">
              DutyWise
              <sup className="ml-0.5 font-mono text-[0.55rem] font-normal opacity-60">®</sup>
            </span>
            <span className="mt-1 hidden font-mono text-[0.625rem] uppercase tracking-[0.18em] opacity-60 md:block">
              Duties, done right.
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[0.9375rem] font-medium transition-colors ${
                  onLight ? "text-ink hover:text-signal-blue-deep" : "text-white/85 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button href="/refund-audit" variant="primary" size="sm" ariaLabel="Get your refund estimate — free">
              Get your estimate
            </Button>
          </div>

          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-md lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-4 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 top-0 h-[2px] w-full transition-all duration-300 ${
                  open ? "top-[7px] rotate-45 bg-duty-amber" : onLight ? "bg-ink" : "bg-white"
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-[2px] w-full transition-all duration-300 ${
                  open ? "opacity-0" : onLight ? "bg-ink" : "bg-white"
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-[2px] w-full transition-all duration-300 ${
                  open ? "top-[7px] -rotate-45 bg-duty-amber" : onLight ? "bg-ink" : "bg-white"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {open ? (
        <div
          id="mobile-menu"
          ref={overlayRef}
          className="fixed inset-0 -top-[2px] z-[60] flex flex-col bg-harbor-navy px-6 pb-10 pt-28 lg:hidden"
        >
          <ul className="flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  data-overlay-link
                  className="block border-b border-white/10 py-5 font-display text-4xl text-white"
                  style={{ transitionDelay: `${i * 40}ms` }}
                  onClick={() => setOpen(false)}
                >
                  <span className="mr-4 font-mono text-sm text-duty-amber">0{i + 1}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto" data-overlay-link>
            <Button href="/refund-audit" variant="amber" size="lg" className="w-full">
              Get your refund estimate — free
            </Button>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-mist">
              Licensed customs brokers · Licensed FFMCs
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
