"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/design/anim";
import { disclaimers } from "@/lib/site";
import { Button } from "@/components/ui/Button";

const rows = [
  { label: "Entry fee", values: ["$99", "$89", "$69"] },
  { label: "Handling fee", values: ["$0", "$0", "$0"] },
  { label: "Volume band", values: ["1–1,999 / quarter", "2,000+ / quarter", "10,000+ / quarter"] },
  { label: "Monthly minimum", values: ["None", "None", "None"] },
  { label: "Broker sign-off", values: ["100% of filings", "100% of filings", "100% of filings"] },
  { label: "Straight-through speed", values: ["<2 min median", "<2 min median", "<2 min median"] },
];

const addOns = [
  {
    name: "ISF filings",
    price: "$35 per filing",
    body: "Importer Security Filing, filed by us from the same data. Required on most ocean shipments.",
  },
  {
    name: "Surety bond",
    price: "From $500 / year",
    body: "Continuous customs bond arranged through our surety partners — no separate broker account needed.",
  },
  {
    name: "Disbursement handling",
    price: "$25 per shipment",
    body: "Duties, fees, and freight paid to CBP and carriers on your behalf, itemized on one invoice.",
  },
  {
    name: "Duty & refund monitoring",
    price: "Included",
    body: "CAPE, IEEPA, and retroactive rate-change watch on every HTS code you file. Claims filed free.",
  },
];

const included = [
  "Refund recovery — included, we never take a % of your refund",
  "Compliance and audit reports — included",
  "Multi-location consolidation — included",
  "Tariff alerts on your HTS codes — included",
];

const comparison: Array<{ trait: string; traditional: string; dutywise: string }> = [
  { trait: "Pricing model", traditional: "Opaque quotes, per-client negotiation", dutywise: "Published: $99 / $89 / $69 per entry" },
  { trait: "Entry fee", traditional: "$40–$120 plus per-line charges", dutywise: "One flat number, on the page and on the invoice" },
  { trait: "Handling fees", traditional: "$15–$40 per entry, common", dutywise: "$0, ever" },
  { trait: "Volume minimums", traditional: "Frequently required, unstated", dutywise: "None — pay per entry" },
  { trait: "Refund filing", traditional: "Sometimes offered, % of refund taken", dutywise: "Filed free, no percentage cut" },
  { trait: "Invoices", traditional: "Surprise line items", dutywise: "The same numbers as this page" },
];

export function RateCard() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-rate-reveal]",
        { y: 36, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root, start: "top 78%" },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="bg-ledger-paper">
      <div className="shell py-[clamp(3rem,6vw,5rem)]">
        <div data-rate-reveal className="card overflow-hidden rounded-lg">
          <div className="grid grid-cols-4 border-b border-hairline">
            <div className="hidden p-6 md:block" />
            {["Starter", "Growth", "Scale"].map((tier, i) => (
              <div
                key={tier}
                className={`p-6 text-center ${i === 1 ? "bg-duty-amber/10" : ""}`}
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">{tier}</p>
                <p className="mt-2 font-display text-4xl text-harbor-navy">
                  {["$99", "$89", "$69"][i]}
                </p>
                {i === 1 ? (
                  <span className="mt-2 inline-block rounded-full bg-duty-amber px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-harbor-navy">
                    Most popular
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-4 border-t border-hairline">
              <p className="p-6 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft md:pl-8">
                {row.label}
              </p>
              {row.values.map((v, i) => (
                <p
                  key={v}
                  className={`flex items-center justify-center border-l border-hairline p-6 text-center font-mono text-sm ${
                    i === 1 ? "bg-duty-amber/10 font-medium text-harbor-navy" : "text-ink"
                  }`}
                >
                  {v}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div data-rate-reveal className="card rounded-lg p-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-green-ink">Included</p>
            <ul className="mt-5 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-snug text-ink">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-green-ink">
                    <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div data-rate-reveal className="card rounded-lg p-8 md:col-span-2">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal-blue-deep">Add-ons, optional</p>
            <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {addOns.map((addon) => (
                <div key={addon.name} className="border-l-2 border-hairline pl-4">
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-harbor-navy">{addon.name}</span>
                    <span className="whitespace-nowrap font-mono text-xs text-signal-blue-deep">{addon.price}</span>
                  </p>
                  <p className="mt-1 text-sm leading-[1.6] text-ink-soft">{addon.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="mt-24 font-display text-[clamp(2rem,3.5vw,3rem)] text-harbor-navy" data-rate-reveal>
          The old math, next to the new math.
        </h2>

        <div data-rate-reveal className="mt-10 overflow-hidden rounded-lg border border-hairline bg-surface">
          <div className="grid grid-cols-3 border-b border-hairline bg-harbor-navy text-white">
            <p className="p-5 font-mono text-xs uppercase tracking-[0.18em] text-mist">Trait</p>
            <p className="p-5 font-mono text-xs uppercase tracking-[0.18em] text-mist">Traditional broker</p>
            <p className="p-5 font-mono text-xs uppercase tracking-[0.18em] text-duty-amber">DutyWise</p>
          </div>
          {comparison.map((row) => (
            <div key={row.trait} className="grid grid-cols-3 border-t border-hairline">
              <p className="p-5 text-sm font-medium text-ink">{row.trait}</p>
              <p className="p-5 text-sm leading-relaxed text-ink-soft">{row.traditional}</p>
              <p className="border-l border-hairline bg-ledger-paper/60 p-5 text-sm leading-relaxed text-ink">
                {row.dutywise}
              </p>
            </div>
          ))}
        </div>

        <div data-rate-reveal className="mt-8 rounded-lg border border-duty-amber/50 bg-duty-amber/10 p-8 md:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">The anchor math</p>
          <p className="mt-4 max-w-[52ch] font-display text-[clamp(1.5rem,2.5vw,2.125rem)] leading-[1.3] text-harbor-navy">
            {disclaimers.anchorMath}
          </p>
          <p className="mt-3 max-w-[64ch] text-sm leading-[1.7] text-ink-soft">
            All-in — entry fees, handling, add-ons, and refunds filed for free. No percentage of
            your refund, ever.
          </p>
        </div>

        <div data-rate-reveal className="mt-14 rounded-lg bg-harbor-navy p-8 text-white md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.2]">
                No-win, no-fee. If CBP rejects a claim we filed, you pay nothing for it.
              </p>
              <p className="mt-4 max-w-[60ch] leading-[1.7] text-mist">
                Cancel anytime — there is no annual contract, no termination fee, no hostage
                clause. If we stop earning your business, we lose it the old-fashioned way.
              </p>
            </div>
            <div className="md:col-span-4">
              <Button href="/refund-audit" variant="amber" size="lg" className="w-full">
                Start at $69/entry
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
