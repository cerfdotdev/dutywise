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
      const body = (await res.json()) as { error?: { message?: string } | string; detail?: unknown };
      if (typeof body.error === "object" && body.error?.message) message = body.error.message;
      else if (typeof body.error === "string") message = body.error;
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

/* ————— Portal API ————— */

export type Role = "owner" | "admin" | "broker" | "compliance";

export type User = { id: string; name: string; email: string; role: Role };
export type Company = { id: string; name: string; licenseNote?: string };
export type Me = { user: User; company: Company };

export type EntryMode = "ocean" | "air" | "truck";
export type EntryStatus = "processing" | "review" | "filed" | "accepted" | "released" | "held" | "cancelled";

export type Entry = {
  id: string;
  entryNumber: string;
  status: EntryStatus;
  mode: EntryMode;
  hsCode: string;
  description: string;
  quantity: number;
  unitValue: number;
  dutyAmount: number;
  fee: number;
  signedBy: string | null;
  createdAt: string;
};

export type ShipmentStatus = "draft" | "booked" | "in_transit" | "cleared" | "delayed" | "cancelled";

export type Shipment = {
  id: string;
  mode: EntryMode;
  carrier: string;
  blNumber: string;
  originPort: string | null;
  destinationPort: string | null;
  eta: string | null;
  status: ShipmentStatus;
  entryCount: number;
  createdAt: string;
};

export type AlertType = "tariff_change" | "hold" | "expiry" | "refund_window";
export type AlertSeverity = "info" | "warning" | "critical";

export type Alert = {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  status: "open" | "acknowledged" | "resolved";
  createdAt: string;
};

export type InvoiceItem = { description: string; amount: number };
export type Invoice = {
  id: string;
  number: string;
  total: number;
  status: "open" | "paid" | "void";
  items: InvoiceItem[];
  createdAt: string;
};

export type BillingSummary = {
  openTotal: number;
  paidTotal: number;
  currentMonthTotal: number;
  monthlySeries: { month: string; total: number }[];
};

export type MonitoringSummary = {
  openAlerts: number;
  criticalAlerts: number;
  watchlistCount: number;
  activeChanges: {
    hsCode: string;
    description: string;
    oldRate: string;
    newRate: string;
    effectiveDate: string;
    matchedSkus: string[];
  }[];
};

export function register(input: { companyName: string; name: string; email: string; password: string }): Promise<Me> {
  return request<Me>("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }): Promise<Me> {
  return request<Me>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function logout(): Promise<void> {
  return request<void>("/api/auth/logout", { method: "POST" });
}

export function me(): Promise<Me> {
  return request<Me>("/api/me", { method: "GET" });
}

export function listEntries(params?: { status?: EntryStatus; q?: string }): Promise<Entry[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.q) qs.set("q", params.q);
  const suffix = qs.size ? `?${qs.toString()}` : "";
  return request<Entry[]>(`/api/entries${suffix}`, { method: "GET" });
}

export function createEntry(input: {
  mode: EntryMode;
  hsCode: string;
  description: string;
  quantity: number;
  unitValue: number;
  shipmentId?: string;
}): Promise<Entry> {
  return request<Entry>("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function listShipments(params?: { status?: ShipmentStatus }): Promise<Shipment[]> {
  const qs = params?.status ? `?status=${params.status}` : "";
  return request<Shipment[]>(`/api/shipments${qs}`, { method: "GET" });
}

export function createShipment(input: {
  mode: EntryMode;
  carrier: string;
  blNumber: string;
  originPort?: string;
  destinationPort?: string;
  eta?: string;
}): Promise<Shipment> {
  return request<Shipment>("/api/shipments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function listAlerts(params?: { status?: "open" | "acknowledged" | "resolved" }): Promise<Alert[]> {
  const qs = params?.status ? `?status=${params.status}` : "";
  return request<Alert[]>(`/api/alerts${qs}`, { method: "GET" });
}

export function ackAlert(id: string): Promise<void> {
  return request<void>(`/api/alerts/${encodeURIComponent(id)}/ack`, { method: "POST" });
}

export function listInvoices(): Promise<Invoice[]> {
  return request<Invoice[]>("/api/invoices", { method: "GET" });
}

export function billingSummary(): Promise<BillingSummary> {
  return request<BillingSummary>("/api/billing/summary", { method: "GET" });
}

export function monitoringSummary(): Promise<MonitoringSummary> {
  return request<MonitoringSummary>("/api/monitoring/summary", { method: "GET" });
}

export function getAuditSample(): Promise<Audit> {
  return request<Audit>("/api/audits/sample", { method: "GET" });
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
