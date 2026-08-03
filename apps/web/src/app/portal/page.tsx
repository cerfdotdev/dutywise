"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  formatUsd,
  getAuditSample,
  listEntries,
  monitoringSummary,
  type Audit,
  type Entry,
  type MonitoringSummary,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
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

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [monitoring, setMonitoring] = useState<MonitoringSummary | null>(null);
  const [sample, setSample] = useState<Audit | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [e, m, s] = await Promise.allSettled([
        listEntries(),
        monitoringSummary(),
        getAuditSample(),
      ]);
      if (cancelled) return;
      const nextErrors: Record<string, string> = {};
      if (e.status === "fulfilled") setEntries(e.value);
      else nextErrors.entries = errorMessage(e.reason);
      if (m.status === "fulfilled") setMonitoring(m.value);
      else nextErrors.monitoring = errorMessage(m.reason);
      if (s.status === "fulfilled") setSample(s.value);
      else nextErrors.sample = errorMessage(s.reason);
      setErrors(nextErrors);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();
  const ym = now.toISOString().slice(0, 7);
  const filedEntries = entries.filter((en) => en.status === "filed");
  const filedThisMonth = filedEntries.filter(
    (en) => new Date(en.createdAt).toISOString().slice(0, 7) === ym,
  );
  const thisMonthEntries = entries.filter(
    (en) => new Date(en.createdAt).toISOString().slice(0, 7) === ym,
  );
  const dutyThisMonth = thisMonthEntries.reduce((sum, en) => sum + (en.dutyAmount ?? 0), 0);
  const recent = entries.slice(0, 5);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              label="Entries filed"
              value={filedEntries.length.toLocaleString()}
              sub={`${filedThisMonth.length.toLocaleString()} filed this month`}
            />
            <StatCard
              label="Open alerts"
              value={monitoring ? monitoring.openAlerts.toLocaleString() : "—"}
              sub={
                monitoring
                  ? `${monitoring.criticalAlerts.toLocaleString()} critical`
                  : errors.monitoring ?? undefined
              }
              accent={monitoring && monitoring.criticalAlerts > 0 ? "amber" : "blue"}
            />
            <StatCard
              label="Duty paid this month"
              value={formatUsd(dutyThisMonth)}
              mono
              sub={`across ${thisMonthEntries.length.toLocaleString()} entries`}
            />
            <StatCard
              label="Refund estimate available"
              value={sample ? formatUsd(sample.totalEstimate) : "—"}
              mono
              accent="green"
              sub={sample ? "from your free sample audit" : errors.sample ?? "run an audit to find out"}
            />
          </>
        )}
      </div>

      {Object.keys(errors).length > 0 ? (
        <div className="mt-6 space-y-2">
          {Object.entries(errors).map(([key, msg]) => (
            <ErrorBox key={key} message={msg} />
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card flush className="lg:col-span-2">
          <div className="flex items-center justify-between gap-4 px-5 pt-5">
            <SectionTitle sub="Your five most recent entries">Recent entries</SectionTitle>
            <Link
              href="/portal/entries"
              className="whitespace-nowrap text-sm font-medium text-signal-blue transition-colors hover:text-paper"
            >
              View all →
            </Link>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="space-y-3 p-5 pt-0">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="p-5 pt-0">
                <EmptyState
                  title="No entries yet"
                  body="File your first entry from the Entries page — a licensed broker signs every filing."
                />
              </div>
            ) : (
              <DataTable head={["Entry", "Mode", "Description", "Status", "Duty", "Filed"]}>
                {recent.map((en) => (
                  <tr key={en.id}>
                    <Cell mono className="text-signal-blue">
                      {en.entryNumber}
                    </Cell>
                    <Cell muted mono>
                      {en.mode}
                    </Cell>
                    <Cell>
                      <span className="block max-w-[240px] truncate">{en.description}</span>
                    </Cell>
                    <Cell>
                      <StatusChip status={en.status} />
                    </Cell>
                    <Cell mono right>
                      {formatUsd(en.dutyAmount)}
                    </Cell>
                    <Cell muted mono>
                      {fmtDate(en.createdAt)}
                    </Cell>
                  </tr>
                ))}
              </DataTable>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle sub="Matched to your HS codes">Active tariff changes</SectionTitle>
            {monitoring && monitoring.activeChanges.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="Nothing changing" body="No active tariff changes are hitting your HS codes right now." />
              </div>
            ) : !monitoring ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : (
              <div className="mt-4">
                {monitoring.activeChanges.slice(0, 4).map((c) => (
                  <div key={`${c.hsCode}-${c.effectiveDate}`} className="border-b border-white/10 py-3 first:pt-0 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-signal-blue">{c.hsCode}</span>
                      <span className="font-mono text-xs text-mist/70">
                        {c.oldRate} → <span className="text-duty-amber">{c.newRate}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-paper">{c.description}</p>
                    <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-mist/50">
                      Effective {fmtDate(c.effectiveDate)} · {c.matchedSkus.length.toLocaleString()} SKU
                      {c.matchedSkus.length === 1 ? "" : "s"} matched
                    </p>
                  </div>
                ))}
                {monitoring.activeChanges.length > 4 ? (
                  <p className="mt-3 font-mono text-xs text-mist/50">
                    +{monitoring.activeChanges.length - 4} more — see Alerts for the full list
                  </p>
                ) : null}
              </div>
            )}
          </Card>

          <Card className="border-duty-amber/40 bg-duty-amber/[0.06]">
            <SectionTitle sub="Free, no commitment — we file, CBP pays">Run a free refund audit</SectionTitle>
            <p className="mt-2 text-sm leading-relaxed text-mist/80">
              Paste your entries or upload a CSV. We&apos;ll estimate refunds under CAPE, IEEPA,
              and retroactive rate changes — you keep what CBP pays.
            </p>
            <div className="mt-5 w-fit">
              <Button href="/portal/refund-audit" variant="amber" magnetic={false} ariaLabel="Run a free refund audit">
                Run free refund audit
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
