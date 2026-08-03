"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/site";

type AccordionProps = {
  items: FaqItem[];
  defaultOpen?: string;
  className?: string;
};

export function Accordion({ items, defaultOpen, className = "" }: AccordionProps) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? items[0]?.id ?? null);

  return (
    <div className={className}>
      {items.map((item, i) => {
        const isOpen = open === item.id;
        const btnId = `faq-btn-${item.id}`;
        const panelId = `faq-panel-${item.id}`;
        return (
          <div key={item.id} className="hairline-b">
            <h3 className="m-0">
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="group flex w-full items-center gap-4 py-5 text-left"
              >
                <span
                  className={`font-mono text-xs tracking-[0.18em] ${
                    isOpen ? "text-signal-blue-deep" : "text-ink-soft/70"
                  }`}
                >
                  0{i + 1}
                </span>
                <span
                  className={`flex-1 font-display text-lg leading-snug transition-colors md:text-xl ${
                    isOpen ? "text-harbor-navy" : "text-ink group-hover:text-harbor-navy"
                  }`}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                    isOpen
                      ? "rotate-45 border-harbor-navy text-harbor-navy"
                      : "border-ink/20 text-ink-soft group-hover:border-ink"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M7 0V14M0 7H14" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className="accordion-panel"
              data-open={isOpen}
            >
              <div>
                <p className="max-w-[68ch] pb-6 pl-9 text-[1.0625rem] leading-[1.7] text-ink-soft">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
