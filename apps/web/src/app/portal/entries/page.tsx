"use client";

import { Fragment, useEffect, useState } from "react";
import {
  createEntry,
  formatUsd,
  listEntries,
  type Entry,
  type EntryMode,
  type EntryStatus,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  Card,
  Cell,
  DataTable,
  EmptyState,
  ErrorBox,
  Field,
  MiniLabel,
  SectionTitle,
  Skeleton,
  Spinner,
  StatusChip,
  btnPrimary,
  errorMessage,
  fmtDate,
  fmtDateTime,
  inputClass,
} from "@/components/portal/PortalUi";

const FILTERS: { value: EntryStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "processing", label: "Processing" },
  { value: "review", label: "Review" },
  { value: "filed", label: "Filed" },
  { value: "accepted", label: "Accepted" },
  { value: "released", label: "Released" },
  { value: "held", label: "Held" },
  { value: "cancelled", label: "Cancelled" },
];

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState<EntryStatus | "all">("all");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [created, setCreated] = useState<Entry | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    mode: "ocean" as EntryMode,
    hsCode: "",
    description: "",
    quantity: "",
    unitValue: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = {
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          ...(q.trim() ? { q: q.trim() } : {}),
        };
        const res = await listEntries(Object.keys(params).length ? params : undefined);
        if (!cancelled) {
          setEntries(res);
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
  }, [statusFilter, q, reloadKey]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const quantity = Number(form.quantity);
    const unitValue = Number(form.unitValue);
    if (!form.hsCode.trim() || !form.description.trim()) {
      setFormError("HS code and description are required.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFormError("Quantity must be a positive number.");
      return;
    }
    if (!Number.isFinite(unitValue) || unitValue < 0) {
      setFormError("Unit value must be zero or more.");
      return;
    }
    setCreating(true);
    try {
      const entry = await createEntry({
        mode: form.mode,
        hsCode: form.hsCode.trim(),
        description: form.description.trim(),
        quantity,
        unitValue,
      });
      setCreated(entry);
      setShowForm(false);
      setForm({ mode: "ocean", hsCode: "", description: "", quantity: "", unitValue: "" });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionTitle
          sub="Every filing is reviewed and signed by a licensed broker."
        >
          Entries
        </SectionTitle>
        <div className="w-fit">
          <Button
            variant="amber"
            magnetic={false}
            onClick={() => setShowForm((v) => !v)}
            ariaLabel="New entry"
          >
            {showForm ? "Close form" : "New entry"}
          </Button>
        </div>
      </div>

      {created ? (
        <div
          role="status"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-clearance-green/50 bg-clearance-green/10 px-4 py-3"
        >
          <p className="text-sm text-paper">
            Entry <span className="font-mono">{created.entryNumber}</span> created — filing fee{" "}
            <span className="font-mono">{formatUsd(created.fee)}</span>
          </p>
          <button
            type="button"
            onClick={() => setCreated(null)}
            className="font-mono text-xs uppercase tracking-[0.12em] text-mist/70 transition-colors hover:text-paper"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {showForm ? (
        <Card className="mt-4">
          <SectionTitle sub="Duty and fee are computed from quantity × unit value × HS rate.">
            New entry
          </SectionTitle>
          {formError ? (
            <div className="mt-4">
              <ErrorBox message={formError} />
            </div>
          ) : null}
          <form onSubmit={handleCreate} className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Mode">
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value as EntryMode })}
                className={inputClass}
              >
                <option value="ocean">Ocean</option>
                <option value="air">Air</option>
                <option value="truck">Truck</option>
              </select>
            </Field>
            <Field label="HS code">
              <input
                type="text"
                required
                value={form.hsCode}
                onChange={(e) => setForm({ ...form, hsCode: e.target.value })}
                className={inputClass}
                placeholder="e.g. 8517.13.00"
              />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <input
                type="text"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
                placeholder="e.g. Smartphones, other than line phones"
              />
            </Field>
            <Field label="Quantity">
              <input
                type="number"
                required
                min={1}
                step="any"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className={inputClass}
                placeholder="1000"
              />
            </Field>
            <Field label="Unit value (USD)">
              <input
                type="number"
                required
                min={0}
                step="any"
                value={form.unitValue}
                onChange={(e) => setForm({ ...form, unitValue: e.target.value })}
                className={inputClass}
                placeholder="120.00"
              />
            </Field>
            <div className="md:col-span-2">
              <button type="submit" disabled={creating} className={btnPrimary}>
                {creating ? <Spinner /> : null}
                Create entry
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card flush className="mt-6">
        <div className="flex flex-col gap-4 px-5 pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {FILTERS.map((f) => {
              const isActive = statusFilter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setStatusFilter(f.value)}
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
          <form
            className="flex w-full gap-2 md:w-auto"
            onSubmit={(e) => {
              e.preventDefault();
              setQ(qInput);
            }}
            role="search"
          >
            <label className="sr-only" htmlFor="entry-search">
              Search entries
            </label>
            <input
              id="entry-search"
              type="search"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              className={`${inputClass} md:w-56`}
              placeholder="Search entry no. or description"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-mist transition-colors hover:border-white/35 hover:text-paper"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-3 p-5 pt-0">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : error ? (
            <div className="p-5 pt-0">
              <ErrorBox message={error} />
            </div>
          ) : entries.length === 0 ? (
            <div className="p-5 pt-0">
              <EmptyState
                title="No entries match"
                body="Try a different status filter or search term, or file a new entry."
              />
            </div>
          ) : (
            <DataTable
              head={["Entry", "Mode", "Description", "Duty", "Fee", "Status", "Filed"]}
            >
              {entries.map((en) => {
                const open = expandedId === en.id;
                return (
                  <Fragment key={en.id}>
                    <tr className="transition-colors hover:bg-white/[0.03]">
                      <Cell mono>
                        <button
                          type="button"
                          onClick={() => setExpandedId(open ? null : en.id)}
                          aria-expanded={open}
                          className="inline-flex items-center gap-2 text-left font-mono text-[0.8125rem] text-signal-blue transition-colors hover:text-paper"
                        >
                          <span
                            aria-hidden="true"
                            className={`text-[0.625rem] text-mist/70 transition-transform ${open ? "rotate-90" : ""}`}
                          >
                            ▸
                          </span>
                          {en.entryNumber}
                        </button>
                      </Cell>
                      <Cell muted mono>
                        {en.mode}
                      </Cell>
                      <Cell>
                        <span className="block max-w-[260px] truncate">{en.description}</span>
                      </Cell>
                      <Cell mono right>
                        {formatUsd(en.dutyAmount)}
                      </Cell>
                      <Cell mono right>
                        {formatUsd(en.fee)}
                      </Cell>
                      <Cell>
                        <StatusChip status={en.status} />
                      </Cell>
                      <Cell muted mono>
                        {fmtDate(en.createdAt)}
                      </Cell>
                    </tr>
                    {open ? (
                      <tr>
                        <td colSpan={7} className="bg-white/[0.03] px-4 py-4">
                          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
                            <div>
                              <MiniLabel>Signed by</MiniLabel>
                              <dd className="mt-1 font-mono text-sm text-paper">
                                {en.signedBy ?? "—"}
                              </dd>
                            </div>
                            <div>
                              <MiniLabel>Filed</MiniLabel>
                              <dd className="mt-1 font-mono text-sm text-paper">
                                {fmtDateTime(en.createdAt)}
                              </dd>
                            </div>
                            <div>
                              <MiniLabel>Quantity × unit value</MiniLabel>
                              <dd className="mt-1 font-mono text-sm text-paper">
                                {en.quantity.toLocaleString()} × {formatUsd(en.unitValue)}
                              </dd>
                            </div>
                            <div>
                              <MiniLabel>Duty + fee</MiniLabel>
                              <dd className="mt-1 font-mono text-sm text-paper">
                                {formatUsd(en.dutyAmount)} + {formatUsd(en.fee)}
                              </dd>
                            </div>
                          </dl>
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
