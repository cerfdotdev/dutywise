"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, splitIntoLines } from "@/lib/design/anim";
import { ApiError, createLead } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export function FinalCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

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
    }, section);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (status !== "done") return;
    const t = window.setTimeout(() => setStatus("idle"), 6000);
    return () => window.clearTimeout(t);
  }, [status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setMessage("");
    try {
      await createLead({ email });
      setStatus("done");
      setMessage("You're on the list — check your inbox for your refund check.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    }
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden bg-harbor-navy text-white"
    >
      <div
        aria-hidden="true"
        className="stamp-dark absolute -right-24 -top-24 grid size-80 animate-spin-slow place-items-center text-center"
      >
        <span className="font-mono text-xs uppercase tracking-[0.24em] text-white/25">
          Duties done right · Free refund audit · Duties done right · Free refund audit ·
        </span>
      </div>

      <div className="shell relative py-[clamp(6rem,14vw,10rem)]">
        <p className="eyebrow mb-6 text-duty-amber">Free · No broker switch required · Your data stays yours</p>
        <h2
          ref={h2Ref}
          id="final-cta-heading"
          className="max-w-[12ch] font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.02em]"
        >
          Know your duties. Keep your refunds.
        </h2>

        <div className="mt-12 flex flex-wrap items-center gap-6">
          <Button href="/refund-audit" variant="amber" size="lg" ariaLabel="Run a free refund audit">
            Run a free refund audit
          </Button>
          <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-3" aria-label="Get your refund estimate by email">
            <label htmlFor="final-email" className="sr-only">
              Work email
            </label>
            <input
              id="final-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Work email — we'll send your check"
              className="h-[52px] w-72 rounded-[12px] border border-white/20 bg-white/5 px-4 font-mono text-sm text-white placeholder:text-mist/60 focus:border-duty-amber"
            />
            <Button type="submit" variant="dark" size="md" magnetic={false}>
              {status === "sending" ? "Sending…" : "Get my estimate by email"}
            </Button>
          </form>
        </div>

        <p aria-live="polite" className={`mt-5 min-h-5 font-mono text-sm ${status === "error" ? "text-[#ff9d8a]" : "text-clearance-green"}`}>
          {message}
        </p>
      </div>
    </section>
  );
}
