"use client";

import { Fragment, useEffect, useState } from "react";
import {
  billingSummary,
  formatUsd,
  listInvoices,
  type BillingSummary,
  type Invoice,
} from "@/lib/api";
import {
  Card,
  Cell,
  DataTable,
  EmptyState,
  ErrorBox,
  SectionTitle,
  Skeleton,
  StatCard,
  StatusChip,
  errorMessage,
  fmtDate,
} from "@/components/portal/PortalUi";

export default function BillingPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sum, inv] = await Promise.all([billingSummary(), listInvoices()]);
        if (!cancelled) {
          setSummary(sum);
          setInvoices(inv);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(errorMessage(err));
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const series = summary?.monthlySeries ?? [];
  const max = Math.max(...series.map((s) => s.total), 1);

  return (
    <div>
      <SectionTitle
        sub="Flat per-entry pricing — $99, $89, or $69. No handling, no line fees, no minimums."
      >
        Billing
      </SectionTitle>

      {loading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Open total" value={summary ? formatUsd(summary.openTotal) : "—"} mono accent="amber" />
          <StatCard label="Paid total" value={summary ? formatUsd(summary.paidTotal) : "—"} mono accent="green" />
          <StatCard label="Current month" value={summary ? formatUsd(summary.currentMonthTotal) : "—"} mono accent="blue" />
        </div>
      )}

      <Card className="mt-6">
        <SectionTitle sub="Total invoiced per month — latest twelve">Monthly activity</SectionTitle>
        {loading ? (
          <div className="mt-4">
            <Skeleton className="h-40" />
          </div>
        ) : series.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No activity yet" body="Charges will appear here once entries are filed." />
          </div>
        ) : (
          <div className="mt-5 flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label="Monthly invoice totals bar chart">
            {series.map((s) => (
              <div key={s.month} className="flex h-full flex-1 flex-col items-center gap-1">
                <span className="hidden font-mono text-[0.625rem] text-mist/50 sm:block">
                  {formatUsd(s.total)}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-sm bg-signal-blue transition-colors hover:bg-duty-amber"
                    style={{ height: `${Math.max((s.total / max) * 100, 4)}%` }}
                    title={`${s.month}: ${formatUsd(s.total)}`}
                  />
                </div>
                <span className="font-mono text-[0.625rem] uppercase tracking-wider text-mist/50">
                  {s.month}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card flush className="mt-6">
        <div className="px-5 pt-5">
          <SectionTitle sub="Every line item is yours — no surprise charges.">Invoices</SectionTitle>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="space-y-3 p-5 pt-0">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : error ? (
            <div className="p-5 pt-0">
              <ErrorBox message={error} />
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-5 pt-0">
              <EmptyState title="No invoices yet" body="Your first invoice is generated after entries are filed." />
            </div>
          ) : (
            <DataTable head={["Number", "Date", "Items", "Total", "Status"]}>
              {invoices.map((inv) => {
                const open = expandedId === inv.id;
                return (
                  <Fragment key={inv.id}>
                    <tr className="transition-colors hover:bg-white/[0.03]">
                      <Cell mono>
                        <button
                          type="button"
                          onClick={() => setExpandedId(open ? null : inv.id)}
                          aria-expanded={open}
                          className="inline-flex items-center gap-2 text-left font-mono text-[0.8125rem] text-signal-blue transition-colors hover:text-paper"
                        >
                          <span
                            aria-hidden="true"
                            className={`text-[0.625rem] text-mist/50 transition-transform ${open ? "rotate-90" : ""}`}
                          >
                            ▸
                          </span>
                          {inv.number}
                        </button>
                      </Cell>
                      <Cell muted mono>
                        {fmtDate(inv.createdAt)}
                      </Cell>
                      <Cell muted>
                        {inv.items.length.toLocaleString()} line{inv.items.length === 1 ? "" : "s"}
                      </Cell>
                      <Cell mono right>
                        {formatUsd(inv.total)}
                      </Cell>
                      <Cell>
                        <StatusChip status={inv.status} />
                      </Cell>
                    </tr>
                    {open ? (
                      <tr>
                        <td colSpan={5} className="bg-white/[0.03] px-4 py-4">
                          <ul className="max-w-2xl">
                            {inv.items.map((item, i) => (
                              <li
                                key={`${item.description}-${i}`}
                                className="flex items-center justify-between gap-4 border-b border-white/10 py-2 font-mono text-xs last:border-0"
                              >
                                <span className="text-mist/80">{item.description}</span>
                                <span className="text-paper">{formatUsd(item.amount)}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </DataTable>
          )}
        </div>
      </Card>
    </div>
  );
}
