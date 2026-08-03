import type { ReactNode } from "react";

type ChipTone = "amber" | "navy" | "outline";

export function Chip({
  children,
  tone = "amber",
  className = "",
}: {
  children: ReactNode;
  tone?: ChipTone;
  className?: string;
}) {
  const tones: Record<ChipTone, string> = {
    amber: "bg-duty-amber text-harbor-navy",
    navy: "bg-harbor-navy text-white",
    outline: "border border-white/25 text-white",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 font-mono text-[0.8125rem] tracking-[0.08em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
