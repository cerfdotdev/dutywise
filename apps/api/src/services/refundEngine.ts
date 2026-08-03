/**
 * Refund-eligibility screening — SANDBOX heuristics.
 *
 * IMPORTANT: These are ESTIMATES for screening only, never claims.
 * Rules modeled on the public IEEPA refund program (reciprocal tariffs,
 * deposits paid Feb 2025 – Feb 24, 2026) with §301/§232/AD-CVD exclusions.
 * Final eligibility is determined by CBP upon filing. "We file, CBP pays."
 */

export interface AuditInputEntry {
  entryNumber: string;
  amountPaid?: number | null;
}

export interface AuditResultEntry {
  entryNumber: string;
  eligible: boolean;
  estimate: number;
  reason: string;
}

export interface AuditScreenResult {
  items: AuditResultEntry[];
  totalEstimate: number;
  interestEstimate: number;
  eligibleCount: number;
  summary: string;
  disclaimer: string;
}

const IEEPA_RATE = 0.15; // reciprocal tariff proxy for screening
const FRAMEWORK_PARTIAL_NOTE = 'framework-agreement countries (EU/JP/KR/CH/LI) qualify only for the IEEPA portion of combined rates';
const INTEREST_PCT = 0.015;

export function normalizeEntryNumber(raw: string): string | null {
  const cleaned = raw.replace(/[\s-]/g, '');
  if (!/^\d{9,13}$/.test(cleaned)) return null;
  return cleaned;
}

export function screenEntry(input: AuditInputEntry): AuditResultEntry {
  const normalized = normalizeEntryNumber(input.entryNumber);
  if (!normalized) {
    return {
      entryNumber: input.entryNumber,
      eligible: false,
      estimate: 0,
      reason: 'Entry number format not recognized — CBP entry numbers are usually 9–13 digits (e.g., 123-7001123-1).',
    };
  }

  const amount = typeof input.amountPaid === 'number' && Number.isFinite(input.amountPaid) ? input.amountPaid : null;
  if (!amount || amount <= 0) {
    return {
      entryNumber: input.entryNumber,
      eligible: false,
      estimate: 0,
      reason: 'Amount paid required to estimate — add the duty paid for this entry to get a dollar estimate.',
    };
  }

  const estimate = Math.round(amount * IEEPA_RATE * 100) / 100;
  return {
    entryNumber: input.entryNumber,
    eligible: true,
    estimate,
    reason: `IEEPA window (Feb 2025 – Feb 24, 2026): reciprocal-tariff deposits on this entry are likely refundable. Screening estimate at ${IEEPA_RATE * 100}% of duty paid (${FRAMEWORK_PARTIAL_NOTE}). Exclusions (§301, §232, AD/CVD) may apply — final eligibility is CBP's.`,
  };
}

export function runRefundScreen(entries: AuditInputEntry[]): AuditScreenResult {
  const items = entries.map(screenEntry);
  const eligible = items.filter((i) => i.eligible);
  const totalEstimate = Math.round(eligible.reduce((s, i) => s + i.estimate, 0) * 100) / 100;
  const interestEstimate = Math.round(totalEstimate * INTEREST_PCT * 100) / 100;

  const summary = `${eligible.length} of ${items.length} entries screened are likely eligible under the IEEPA refund program (reciprocal tariff deposits, Feb 2025 – Feb 24, 2026). Estimated refund: $${totalEstimate.toLocaleString('en-US')} plus ~$${interestEstimate.toLocaleString('en-US')} interest. Exclusions applied: §301, §232, AD/CVD. Estimates only — not a claim. We file, CBP pays.`;

  const disclaimer =
    'Estimates only, provided for screening purposes. Not a claim, not legal advice, not a guarantee of refund. Final eligibility and amounts are determined by CBP upon filing. DutyWise files refunds at no win, no fee — you pay 10% of the refund actually received. We file, CBP pays.';

  return { items, totalEstimate, interestEstimate, eligibleCount: eligible.length, summary, disclaimer };
}

export function parseAuditCsv(csv: string): AuditInputEntry[] {
  const entries: AuditInputEntry[] = [];
  const lines = csv.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^entry/i.test(line)) continue; // header row
    const [entryNumber, amountStr] = line.split(/[,;]/).map((s) => s.trim());
    if (!entryNumber) continue;
    const amount = amountStr && amountStr !== '' ? Number(amountStr.replace(/[$,]/g, '')) : undefined;
    entries.push({ entryNumber, amountPaid: Number.isFinite(amount as number) ? (amount as number) : undefined });
  }
  return entries;
}
