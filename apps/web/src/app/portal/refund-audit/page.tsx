"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, createAudit, getAudit, getAuditSample, me, type Audit } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  Card,
  Cell,
  DataTable,
  ErrorBox,
  Field,
  SectionTitle,
  Spinner,
  StatCard,
  btnAmber,
  errorMessage,
  fmtDateTime,
  inputClass,
} from "@/components/portal/PortalUi";

type Row = { entryNumber: string; amountPaid: string };
type Phase = "input" | "running" | "report" | "error";

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

export default function RefundAuditPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [report, setReport] = useState<Audit | null>(null);
  const [sampleMode, setSampleMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const m = await me();
        if (!cancelled) {
          setEmail(m.user.email);
          setCompanyName(m.company.name);
        }
      } catch {
        // prefill is best-effort; the form works without it
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function loadRowsFromText() {
    setError(null);
    const parsed = parseCsv(csvText);
    if (!parsed.length) {
      setError("No entries found. Expected columns: entry_number, amount_paid.");
      return;
    }
    if (parsed.length > MAX_ENTRIES) {
      setError(
        `That list has ${parsed.length.toLocaleString()} entries — the limit is ${MAX_ENTRIES.toLocaleString()}. Split it and run two audits.`,
      );
      return;
    }
    setRows(parsed);
    setFileName(null);
  }

  async function handleFile(file: File) {
    setError(null);
    if (file.size > MAX_FILE_BYTES) {
      setError("That file is over 2 MB. Trim it to your entry numbers and try again.");
      return;
    }
    const text = await file.text();
    const parsed = parseCsv(text);
    if (!parsed.length) {
      setError("No entries found. Expected columns: entry_number, amount_paid.");
      return;
    }
    if (parsed.length > MAX_ENTRIES) {
      setError(
        `That file has ${parsed.length.toLocaleString()} entries — the limit is ${MAX_ENTRIES.toLocaleString()}. Split it and run two audits.`,
      );
      return;
    }
    setRows(parsed);
    setFileName(file.name);
    setCsvText("");
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
    throw new Error("The report is taking longer than usual. Check your email — we'll send the results there too.");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rows.length || !email.trim()) return;
    setError(null);
    setPhase("running");
    setSampleMode(false);
    try {
      const { auditId } = await createAudit({
        email: email.trim(),
        companyName: companyName.trim() || undefined,
        entries: rows.map((r) => ({
          entryNumber: r.entryNumber,
          amountPaid: amountOrUndefined(r.amountPaid),
        })),
      });
      const result = await pollAudit(auditId, 20, 800);
      setReport(result);
      setPhase("report");
    } catch (err) {
      setError(errorMessage(err));
      setPhase("error");
    }
  }

  async function viewSample() {
    setError(null);
    setLoadingSample(true);
    try {
      const sample = await getAuditSample();
      setReport(sample);
      setSampleMode(true);
      setPhase("report");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingSample(false);
    }
  }

  function reset() {
    setRows([]);
    setCsvText("");
    setFileName(null);
    setReport(null);
    setSampleMode(false);
    setPhase("input");
    setError(null);
  }

  const totalEstimate = report?.totalEstimate ?? 0;
  const eligibleCount = report?.eligibleCount ?? report?.entries.filter((en) => en.eligible).length ?? 0;

  return (
    <div>
      <SectionTitle
        sub="Estimate refunds owed under CAPE, IEEPA, and retroactive rate changes. Free — no commitment."
      >
        Refund audit
      </SectionTitle>

      {phase === "report" && report ? (
        <div className="mt-6 space-y-6">
          {sampleMode ? (
            <div className="rounded-md border border-duty-amber/50 bg-duty-amber/10 px-4 py-3">
              <p className="text-sm text-paper">
                This is a <span className="font-medium">sample report</span> — illustrative data
                only, not your entries.
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Eligible entries"
              value={eligibleCount.toLocaleString()}
              accent="green"
              sub={`of ${report.entries.length.toLocaleString()} checked`}
            />
            <StatCard
              label="Total estimate"
              value={`$${totalEstimate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              mono
              accent="amber"
              sub="Duties + interest you may be owed"
            />
            <StatCard
              label="Interest estimate"
              value={
                report.interestEstimate !== undefined
                  ? `$${report.interestEstimate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "—"
              }
              mono
            />
          </div>

          <Card flush>
            <div className="px-5 pt-5">
              <SectionTitle sub={`Report ${report.id} · ${fmtDateTime(report.createdAt)}`}>
                Per-entry breakdown
              </SectionTitle>
            </div>
            <div className="mt-4">
              <DataTable head={["Entry number", "Eligibility", "Estimate", "Reason"]}>
                {report.entries.map((en) => (
                  <tr key={en.entryNumber}>
                    <Cell mono className="text-signal-blue">
                      {en.entryNumber}
                    </Cell>
                    <Cell>
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[0.6875rem] uppercase leading-none tracking-[0.08em] ${
                          en.eligible
                            ? "bg-clearance-green text-ink"
                            : "border border-white/15 bg-white/10 text-mist"
                        }`}
                      >
                        {en.eligible ? "Eligible" : "Not eligible"}
                      </span>
                    </Cell>
                    <Cell mono right>
                      ${en.estimate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Cell>
                    <Cell muted>
                      <span className="block max-w-[320px]">{en.reason}</span>
                    </Cell>
                  </tr>
                ))}
              </DataTable>
            </div>
          </Card>

          <Card>
            <SectionTitle sub="What happens next">Summary</SectionTitle>
            <p className="mt-3 text-sm leading-relaxed text-mist/80">{report.summary}</p>
            {report.disclaimer ? (
              <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-mist/60">
                {report.disclaimer}
              </p>
            ) : null}
          </Card>

          <div className="flex flex-wrap gap-3">
            <div className="w-fit">
              <Button variant="amber" magnetic={false} onClick={reset} ariaLabel="Run another audit">
                Run another
              </Button>
            </div>
            <div className="w-fit">
              <Button variant="primary" magnetic={false} href="/portal" ariaLabel="Back to overview">
                Back to overview
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card className="mt-6 max-w-2xl">
          <SectionTitle sub="Upload → review → report. Roughly two minutes.">
            Run the free audit
          </SectionTitle>

          {error ? (
            <div className="mt-4">
              <ErrorBox message={error} />
            </div>
          ) : null}

          {rows.length ? (
            <div className="mt-5 rounded-md border border-clearance-green/50 bg-clearance-green/10 px-4 py-3">
              <p className="text-sm text-paper">
                <span className="font-mono">{rows.length.toLocaleString()}</span> entries loaded
                {fileName ? ` from ${fileName}` : " from the textarea"}.
              </p>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div>
              <button
                type="button"
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
                className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors ${
                  dragOver ? "border-duty-amber bg-duty-amber/10" : "border-white/20 hover:border-white/40"
                }`}
              >
                <span className="text-sm font-medium text-paper">Drop a CSV here, or click to browse</span>
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-mist/60">
                  Columns: entry_number, amount_paid · up to 2 MB
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                  e.target.value = "";
                }}
              />
            </div>

            <div>
              <Field label="Or paste CSV">
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-y font-mono text-xs`}
                  placeholder={"DW-1042,123450.00\nDW-1041,89000.00"}
                />
              </Field>
              <button
                type="button"
                onClick={loadRowsFromText}
                className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-signal-blue transition-colors hover:text-paper"
              >
                Load entries from textarea
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Email for results">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@company.com"
                />
              </Field>
              <Field label="Company (optional)">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                  placeholder="Acme Imports Inc."
                />
              </Field>
            </div>

            <button type="submit" disabled={phase === "running" || !rows.length} className={btnAmber}>
              {phase === "running" ? <Spinner /> : null}
              {phase === "running" ? "Running audit…" : "Run free audit"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-xs text-mist/60">Eligibility is CBP&apos;s call — estimates are never claims.</p>
            <button
              type="button"
              onClick={viewSample}
              disabled={loadingSample}
              className="inline-flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-signal-blue transition-colors hover:text-paper disabled:opacity-60"
            >
              {loadingSample ? <Spinner /> : null}
              View a sample report
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
