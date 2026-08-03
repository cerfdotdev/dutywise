import { marqueeItems } from "@/lib/site";

function TickerContent({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <span aria-hidden={ariaHidden} className="flex items-center">
      {marqueeItems.map((item) => (
        <span
          key={item}
          className="flex items-center whitespace-nowrap py-2.5 font-mono text-[0.8125rem] uppercase tracking-[0.18em] text-harbor-navy"
        >
          <span className="px-6 md:px-10">{item}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            className="opacity-70"
          >
            <path d="M6 0L7.35 4.65L12 6L7.35 7.35L6 12L4.65 7.35L0 6L4.65 4.65L6 0Z" fill="#0E2A47" />
          </svg>
        </span>
      ))}
    </span>
  );
}

export function Marquee() {
  return (
    <div
      role="marquee"
      aria-label="DutyWise trust signals: CBP-licensed brokers, AES direct, SOFI integrated, zero handling fees, licensed broker on every filing, no volume minimums"
      className="marquee border-y border-harbor-navy/20 bg-duty-amber"
    >
      <div className="marquee-track">
        <TickerContent />
        <TickerContent ariaHidden />
      </div>
    </div>
  );
}
