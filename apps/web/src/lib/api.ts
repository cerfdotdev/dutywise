export type Health = {
  status: "ok";
  version: string;
};

export type LeadRequest = {
  email: string;
  companyName?: string;
};

export type Lead = {
  id: string;
  email: string;
  companyName: string | null;
  createdAt: string;
};

export type AuditEntryInput = {
  entryNumber: string;
  amountPaid?: number;
};

export type AuditCreated = {
  auditId: string;
};

export type AuditEntryResult = {
  entryNumber: string;
  eligible: boolean;
  estimate: number;
  reason: string;
};

export type Audit = {
  id: string;
  status: "completed";
  totalEstimate: number;
  interestEstimate?: number;
  eligibleCount?: number;
  entries: AuditEntryResult[];
  summary: string;
  disclaimer?: string;
  createdAt: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new ApiError(0, "Network error — the service is unreachable right now.");
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: unknown; detail?: unknown };
      if (typeof body.error === "string") message = body.error;
      else if (typeof body.detail === "string") message = body.detail;
    } catch {
      // non-JSON error body; keep the status-based message
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function healthz(): Promise<Health> {
  return request<Health>("/api/healthz", { method: "GET" });
}

export function createLead(input: LeadRequest): Promise<Lead> {
  return request<Lead>("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export type CreateAuditInput = {
  email: string;
  companyName?: string;
  entries?: AuditEntryInput[];
  csv?: string;
};

export function createAudit(input: CreateAuditInput): Promise<AuditCreated> {
  if (input.csv !== undefined) {
    return request<AuditCreated>("/api/audits", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: input.csv,
    });
  }
  return request<AuditCreated>("/api/audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      companyName: input.companyName,
      entries: input.entries ?? [],
    }),
  });
}

export function getAudit(id: string): Promise<Audit> {
  return request<Audit>(`/api/audits/${encodeURIComponent(id)}`, { method: "GET" });
}
