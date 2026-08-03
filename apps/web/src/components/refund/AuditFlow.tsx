"use client";

import { useRef, useState } from "react";
import { ApiError, createAudit, getAudit, type Audit, type AuditEntryResult } from "@/lib/api";
import { formatCurrency } from "@/lib/design/anim";

type Row = { entryNumber: string; amountPaid: string };
type Phase = "input" | "sending" | "report" | "error";

const MAX_ENTRIES = 5000;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseCsv(text: string): Row[] {
  const rows: Row[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const cols = parseCsvLine(trimmed).map((c) => c.trim());
    if (!cols[0]) continue;
    if (/^entry_number$/i.test(cols[0]) || /^entry_no$/i.test(cols[0])) continue;
    rows.push({ entryNumber: cols[0], amountPaid: (cols[1] ?? "").replace(/[$,\s]/g, "") });
  }
  return rows;
}

function amountOrUndefined(raw: string): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function AuditFlow() {
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [manualEntry, setManualEntry] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [report, setReport] = useState<Audit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.size > MAX_FILE_BYTES) {
      setError("That file is over 2 MB. Trim it to your entry numbers and try again.");
      return;
    }
    const text = await file.text();
    const parsed = parseCsv(text);
    if (!parsed.length) {
      setError("No entries found. Expect columns: entry_number, amount_paid.");
      return;
    }
    if (parsed.length > MAX_ENTRIES) {
      setError(`That file has ${parsed.length.toLocaleString()} entries — the limit is ${MAX_ENTRIES.toLocaleString()}. Split it and run two audits.`);
      return;
    }
    setRows(parsed);
    setFileName(file.name);
  }

  function addManualEntry() {
    const entryNumber = manualEntry.trim();
    if (!entryNumber) return;
    setRows((prev) => [...prev, { entryNumber, amountPaid: manualAmount.trim() }]);
    setManualEntry("");
    setManualAmount("");
  }

  async function pollAudit(id: string, tries: number, delayMs: number): Promise<Audit> {
    for (let i = 0; i < tries; i++) {
      try {
        const audit = await getAudit(id);
        if (audit.status === "completed") return audit;
      } catch (err) {
        if (!(err instanceof ApiError) || err.status !== 404) throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    throw new ApiError(0, "The report is taking longer than usual. Check your email — we'll send the results there too.");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rows.length || !email) return;
    setError(null);
    setPhase("sending");
    try {
      const { auditId } = await createAudit({
        email,
        companyName: companyName || undefined,
        entries: rows.map((r) => ({
          entryNumber: r.entryNumber,
          amountPaid: amountOrUndefined(r.amountPaid),
        })),
      });
      const result = await pollAudit(auditId, 15, 800);
      setReport(result);
      setPhase("report");
    } catch (err) {
      setPhase("error");
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    }
  }

  function reset() {
    setRows([]);
    setFileName(null);
    setReport(null);
    setPhase("input");
    setError(null);
  }

  const totalEstimate = report?.totalEstimate ?? 0;
  const eligibleCount = report?.eligibleCount ?? report?.entries.filter((e) => e.eligible).length ?? 0;

  return (
    <section aria-labelledby="audit-tool-heading" className="bg-ledger-paper pb-[clamp(4rem,8vw,6rem)]">
      <div className="shell">
        <div className="overflow-hidden rounded-lg border border-hairline bg-surface shadow-md">
          <div className="border-b border-hairline bg-harbor-navy px-6 py-4 md:px-10">
            <h2 id="audit-tool-heading" className="font-display text-xl text-white">
              Run the free audit
            </h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-mist">
              Upload → Review → Get report
            </p>
          </div>

          {phase === "report" && report ? (
            <div className="p-6 md:p-10">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="eyebrow text-clearance-green">Eligibility estimate — not a claim</p>
                  <p className="mt-3 font-display text-[clamp(2.5rem,5vw,4rem)] leading-none text-harbor-navy">
                    {formatCurrency(totalEstimate)}
                  </p>
                  <p className="mt-2 font-mono text-sm text-ink-soft">
                    Estimated refund across{" "}
                    <span className="text-harbor-navy">{eligibleCount} eligible</span> of{" "}
                    {report.entries.length.toLocaleString()} entries
                    {report.interestEstimate ? ` · ${formatCurrency(report.interestEstimate)} estimated interest` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-ink/25 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
                >
                  Run another audit
                </button>
              </div>

              <p className="mt-6 max-w-[72ch] text-sm leading-[1.7] text-ink-soft">{report.summary}</p>

              <div className="mt-8 overflow-x-auto rounded-md border border-hairline">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <caption className="sr-only">
                    Per-entry audit results: entry number, status, estimate, reason
                  </caption>
                  <thead>
                    <tr className="border-b border-hairline bg-ledger-paper">
                      <th scope="col" className="p-4 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">Entry number</th>
                      <th scope="col" className="p-4 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">Status</th>
                      <th scope="col" className="p-4 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">Estimate</th>
                      <th scope="col" className="p-4 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.entries.map((entry: AuditEntryResult) => (
                      <tr key={entry.entryNumber} className="border-b border-hairline last:border-b-0">
                        <td className="p-4 font-mono text-sm text-harbor-navy">{entry.entryNumber}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] ${
                              entry.eligible ? "text-clearance-green" : "text-ink-soft"
                            }`}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                              {entry.eligible ? (
                                <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              ) : (
                                <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                              )}
                            </svg>
                            {entry.eligible ? "Eligible" : "No claim"}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-sm text-ink">
                          {entry.eligible ? formatCurrency(entry.estimate) : "—"}
                        </td>
                        <td className="p-4 text-sm text-ink-soft">{entry.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 space-y-3 rounded-md bg-ledger-paper p-6">
                <p className="max-w-[80ch] text-sm leading-[1.7] text-ink-soft">{report.disclaimer}</p>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
                  We file, CBP pays — we never take a % of your refund. Uploaded data is deleted
                  within 30 days.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="p-6 md:p-10">
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload a CSV of your entries"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) void handleFile(file);
                }}
                className={`flex min-h-44 flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed p-8 text-center transition-colors ${
                  dragOver ? "border-signal-blue bg-signal-blue/5" : "border-hairline hover:border-ink-soft"
                }`}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="text-signal-blue">
                  <path d="M20 27V8M20 8L12 16M20 8L28 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 27V31C7 32.1 7.9 33 9 33H31C32.1 33 33 32.1 33 31V27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p className="max-w-[40ch] text-[0.9375rem] leading-relaxed text-ink">
                  {fileName ? (
                    <>
                      <span className="font-mono text-sm text-clearance-green">{fileName}</span>
                      <br />
                      Loaded {rows.length.toLocaleString()} entries. Drop a new file to replace, or click to re-upload.
                    </>
                  ) : (
                    <>
                      Drag your entries CSV here, or <span className="underline underline-offset-4">browse</span>
                    </>
                  )}
                </p>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
                  Columns: entry_number, amount_paid · Max {MAX_ENTRIES.toLocaleString()} rows
                </p>
                <a href="/sample-entries.csv" download className="font-mono text-xs text-signal-blue-deep underline underline-offset-4 hover:text-harbor-navy">
                  Download sample CSV
                </a>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,text/csv"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                  e.currentTarget.value = "";
                }}
              />

              <div className="mt-8">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">Or add entries by hand</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <label className="sr-only" htmlFor="manual-entry">Entry number</label>
                  <input
                    id="manual-entry"
                    type="text"
                    value={manualEntry}
                    onChange={(e) => setManualEntry(e.target.value)}
                    placeholder="123-4567890-1"
                    className="h-11 w-52 rounded-sm border border-hairline bg-ledger-paper px-4 font-mono text-sm text-ink focus:border-signal-blue"
                  />
                  <label className="sr-only" htmlFor="manual-amount">Amount paid</label>
                  <input
                    id="manual-amount"
                    type="text"
                    inputMode="decimal"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="Amount paid ($)"
                    className="h-11 w-40 rounded-sm border border-hairline bg-ledger-paper px-4 font-mono text-sm text-ink focus:border-signal-blue"
                  />
                  <button
                    type="button"
                    onClick={addManualEntry}
                    className="h-11 rounded-full border border-ink/25 px-5 font-mono text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
                  >
                    Add entry
                  </button>
                </div>
                {rows.length > 0 ? (
                  <div className="mt-4 max-h-44 overflow-y-auto rounded-md border border-hairline">
                    <ul>
                      {rows.slice(0, 200).map((row, i) => (
                        <li key={`${row.entryNumber}-${i}`} className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-2 last:border-b-0">
                          <span className="font-mono text-sm text-harbor-navy">{row.entryNumber}</span>
                          <span className="font-mono text-xs text-ink-soft">
                            {row.amountPaid ? `$${Number(row.amountPaid).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "no amount"}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove entry ${row.entryNumber}`}
                            onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-ink-soft transition-colors hover:text-ink"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {rows.length > 200 ? (
                      <p className="px-4 py-2 font-mono text-xs text-ink-soft">
                        …and {rows.length - 200} more (all included in the audit)
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="audit-email" className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Work email *
                  </label>
                  <input
                    id="audit-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-12 w-full rounded-sm border border-hairline bg-ledger-paper px-4 font-mono text-sm text-ink focus:border-signal-blue"
                  />
                </div>
                <div>
                  <label htmlFor="audit-company" className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Company (optional)
                  </label>
                  <input
                    id="audit-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Imports, Inc."
                    className="h-12 w-full rounded-sm border border-hairline bg-ledger-paper px-4 font-mono text-sm text-ink focus:border-signal-blue"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <button
                  type="submit"
                  disabled={!rows.length || !email || phase === "sending"}
                  className="inline-flex select-none items-center justify-center gap-2 rounded-full bg-duty-amber px-8 py-4 text-base font-medium text-ink shadow-amber transition-[transform,box-shadow,opacity] duration-300 hover:scale-[1.03] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {phase === "sending" ? "Checking your entries…" : "Check my entries"}
                </button>
                <p className="font-mono text-xs uppercase leading-relaxed tracking-[0.18em] text-ink-soft">
                  No broker switch required · No card required · We only get paid if you do — and
                  never a % of your refund
                </p>
              </div>

              <p aria-live="polite" className="mt-6 min-h-5 text-sm text-[#b3362e]">
                {error}
              </p>
            </form>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Encrypted in transit and at rest", "Your file never touches our training data."],
            ["Deleted after 30 days", "Unless you opt in to longer retention — we ask first."],
            ["Estimates, never claims", "Eligibility is CBP's call. When they approve, they pay you directly."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-hairline bg-surface p-6">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal-blue-deep">{title}</p>
              <p className="mt-2 text-sm leading-[1.6] text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
