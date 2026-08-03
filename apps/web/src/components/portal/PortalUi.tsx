import type { ReactNode } from "react";
import { ApiError, statusLabel } from "@/lib/api";

export const inputClass =
  "w-full rounded-md border border-white/15 bg-harbor-navy px-3.5 py-2.5 text-sm text-paper placeholder:text-mist/40 transition-colors focus:border-signal-blue focus:outline-none focus:ring-1 focus:ring-signal-blue";

export const btnAmber =
  "inline-flex w-full items-center justify-center gap-2 rounded-md bg-duty-amber px-5 py-3 text-sm font-medium text-ink transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60";

export const btnPrimary =
  "inline-flex w-full items-center justify-center gap-2 rounded-md bg-signal-blue px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-signal-blue-deep disabled:cursor-not-allowed disabled:opacity-60";

export const btnSmall =
  "inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-sm text-paper transition-colors hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-60";

export function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Something went wrong. Try again.";
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function Card({
  children,
  className = "",
  flush = false,
}: {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.05] ${flush ? "" : "p-5"} ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  mono = false,
  accent,
  className = "",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  mono?: boolean;
  accent?: "amber" | "green" | "blue";
  className?: string;
}) {
  const dots: Record<string, string> = {
    amber: "bg-duty-amber",
    green: "bg-clearance-green",
    blue: "bg-signal-blue",
  };
  return (
    <Card className={className}>
      <p className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-mist/70">
        {accent ? <span aria-hidden="true" className={`size-1.5 rounded-full ${dots[accent]}`} /> : null}
        {label}
      </p>
      <p
        className={`mt-2.5 text-paper ${
          mono ? "font-mono text-[1.625rem] leading-none tracking-tight" : "font-display text-[1.75rem] leading-none"
        }`}
      >
        {value}
      </p>
      {sub ? <p className="mt-2 text-xs text-mist/60">{sub}</p> : null}
    </Card>
  );
}

const chipTones: Record<string, string> = {
  filed: "bg-clearance-green text-ink",
  released: "bg-clearance-green text-ink",
  cleared: "bg-clearance-green text-ink",
  paid: "bg-clearance-green text-ink",
  held: "bg-duty-amber text-ink",
  delayed: "bg-duty-amber text-ink",
  review: "bg-duty-amber text-ink",
  open: "bg-duty-amber text-ink",
  critical: "bg-duty-amber text-ink",
  processing: "bg-signal-blue text-white",
  accepted: "bg-signal-blue text-white",
  booked: "bg-signal-blue text-white",
  in_transit: "bg-signal-blue text-white",
  warning: "bg-duty-amber/20 text-mist border border-duty-amber/50",
  info: "bg-white/10 text-mist border border-white/15",
  draft: "bg-white/10 text-mist border border-white/15",
  void: "bg-ink/40 text-mist",
  cancelled: "bg-ink/40 text-mist",
};

export function StatusChip({ status }: { status: string }) {
  const tone = chipTones[status] ?? "bg-white/10 text-mist border border-white/15";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[0.6875rem] uppercase leading-none tracking-[0.08em] ${tone}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function DataTable({
  head,
  children,
  className = "",
}: {
  head: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[780px] border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            {head.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-3 text-left font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-mist/60"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.07]">{children}</tbody>
      </table>
    </div>
  );
}

export function Cell({
  children,
  mono = false,
  right = false,
  muted = false,
  className = "",
}: {
  children: ReactNode;
  mono?: boolean;
  right?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-3.5 align-top text-sm ${right ? "text-right" : "text-left"} ${
        mono ? "font-mono text-[0.8125rem]" : muted ? "text-mist/70" : "text-paper"
      } ${className}`}
    >
      {children}
    </td>
  );
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-mist/70">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs leading-relaxed text-mist/60">{hint}</span> : null}
    </label>
  );
}

export function SectionTitle({
  children,
  sub,
  className = "",
}: {
  children: ReactNode;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="font-display text-xl leading-tight text-paper">{children}</h2>
      {sub ? <p className="mt-1 text-sm text-mist/70">{sub}</p> : null}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 px-6 py-10 text-center">
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-mist/60">{title}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-relaxed text-mist/70">{body}</p>
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-paper ${className}`}
    />
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-white/10 ${className}`} />;
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-duty-amber/50 bg-duty-amber/10 px-4 py-3"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-duty-amber font-mono text-[0.625rem] font-bold text-ink"
      >
        !
      </span>
      <p className="text-sm leading-relaxed text-paper">{message}</p>
    </div>
  );
}

export function MiniLabel({ children }: { children: ReactNode }) {
  return (
    <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-mist/50">{children}</dt>
  );
}
