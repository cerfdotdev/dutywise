"use client";

import { useEffect, useState } from "react";
import { ackAlert, listAlerts, statusLabel, type Alert, type AlertSeverity } from "@/lib/api";
import {
  Card,
  EmptyState,
  ErrorBox,
  SectionTitle,
  Skeleton,
  Spinner,
  StatusChip,
  errorMessage,
  fmtDateTime,
} from "@/components/portal/PortalUi";

type Filter = "all" | "open" | "acknowledged";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "acknowledged", label: "Acknowledged" },
];

const SEVERITY_ORDER: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [reloadKey, setReloadKey] = useState(0);
  const [ackingId, setAckingId] = useState<string | null>(null);
  const [ackError, setAckError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listAlerts(filter === "all" ? undefined : { status: filter });
        if (!cancelled) {
          setAlerts(res);
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
  }, [filter, reloadKey]);

  const sorted = [...alerts].sort((a, b) => {
    const sev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sev !== 0) return sev;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const groups: { severity: AlertSeverity; label: string; items: Alert[] }[] = [
    { severity: "critical", label: "Critical", items: [] },
    { severity: "warning", label: "Watch", items: [] },
    { severity: "info", label: "Info", items: [] },
  ];
  for (const alert of sorted) {
    const group = groups.find((g) => g.severity === alert.severity);
    if (group) group.items.push(alert);
  }

  async function handleAck(id: string) {
    setAckingId(id);
    setAckError(null);
    try {
      await ackAlert(id);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setAckError(errorMessage(err));
    } finally {
      setAckingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle
          sub="Tariff rulings, holds, and deadlines that need your attention."
        >
          Alerts
        </SectionTitle>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter alerts">
          {FILTERS.map((f) => {
            const isActive = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter(f.value)}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.1em] transition-colors ${
                  isActive
                    ? "border-duty-amber bg-duty-amber text-ink"
                    : "border-white/15 text-mist/80 hover:border-white/35 hover:text-paper"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {ackError ? (
        <div className="mt-4">
          <ErrorBox message={ackError} />
        </div>
      ) : null}

      <div className="mt-6 space-y-8">
        {loading ? (
          <Card className="space-y-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </Card>
        ) : error ? (
          <Card>
            <ErrorBox message={error} />
          </Card>
        ) : sorted.length === 0 ? (
          <Card>
            <EmptyState title="All clear" body="No alerts match this filter. New tariff rulings or holds will appear here." />
          </Card>
        ) : (
          groups
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <section key={group.severity} aria-label={`${group.label} alerts`}>
                <h2 className="mb-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mist/60">
                  {group.label} · {group.items.length}
                </h2>
                <div className="space-y-3">
                  {group.items.map((alert) => (
                    <Card key={alert.id} className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusChip status={alert.severity} />
                        <span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-mist/70">
                          {statusLabel(alert.type)}
                        </span>
                        <span className="ml-auto font-mono text-xs text-mist/50">
                          {fmtDateTime(alert.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-[0.9375rem] font-medium text-paper">{alert.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-mist/80">{alert.message}</p>
                      <div className="mt-3">
                        {alert.status === "open" ? (
                          <button
                            type="button"
                            onClick={() => handleAck(alert.id)}
                            disabled={ackingId === alert.id}
                            className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-sm text-paper transition-colors hover:border-white/35 disabled:opacity-60"
                          >
                            {ackingId === alert.id ? <Spinner /> : null}
                            Acknowledge
                          </button>
                        ) : (
                          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-mist/50">
                            {alert.status === "resolved" ? "Resolved" : "Acknowledged"}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))
        )}
      </div>
    </div>
  );
}
