import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createAudit, createLead, getAudit, healthz } from "@/lib/api";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("api client", () => {
  it("healthz returns parsed Health", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: "ok", version: "0.1.0" }));
    const h = await healthz();
    expect(h).toEqual({ status: "ok", version: "0.1.0" });
    expect(fetchMock).toHaveBeenCalledWith("/api/healthz", { method: "GET" });
  });

  it("createLead posts JSON body and returns Lead", async () => {
    const lead = {
      id: "11111111-1111-4111-8111-111111111111",
      email: "ops@importer.example",
      companyName: null,
      createdAt: "2026-01-01T00:00:00Z",
    };
    fetchMock.mockResolvedValueOnce(jsonResponse(lead, 201));
    const result = await createLead({ email: "ops@importer.example" });
    expect(result.id).toBe(lead.id);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"email":"ops@importer.example"}');
  });

  it("createAudit posts raw CSV when csv is provided", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ auditId: "22222222-2222-4222-8222-222222222222" }, 201),
    );
    const csv = "entry_number,amount_paid\n123-4567890-1,1240.00\n";
    const result = await createAudit({ email: "ops@importer.example", csv });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual({ "Content-Type": "text/csv" });
    expect(init.body).toBe(csv);
    expect(result.auditId).toMatch(/^22222222/);
  });

  it("createAudit posts JSON entries when csv is absent", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ auditId: "33333333-3333-4333-8333-333333333333" }, 201));
    await createAudit({
      email: "ops@importer.example",
      entries: [{ entryNumber: "123-4567890-1", amountPaid: 1240 }],
    });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    const body = JSON.parse(String(init.body));
    expect(body.entries).toHaveLength(1);
    expect(body.entries[0].entryNumber).toBe("123-4567890-1");
  });

  it("getAudit returns the report", async () => {
    const audit = {
      id: "44444444-4444-4444-8444-444444444444",
      status: "completed",
      totalEstimate: 1240,
      eligibleCount: 1,
      entries: [
        { entryNumber: "123-4567890-1", eligible: true, estimate: 1240, reason: "CAPE rate cut" },
      ],
      summary: "1 eligible entry.",
      createdAt: "2026-01-01T00:00:00Z",
    };
    fetchMock.mockResolvedValueOnce(jsonResponse(audit));
    const result = await getAudit(audit.id);
    expect(result.eligibleCount).toBe(1);
    expect(result.entries[0].eligible).toBe(true);
  });

  it("throws ApiError with the server message on 4xx", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Invalid input" }, 400));
    await expect(getAudit("bad")).rejects.toMatchObject({ status: 400, message: "Invalid input" });
  });

  it("throws ApiError with the status message when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(
      new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } }),
    );
    await expect(getAudit("missing")).rejects.toBeInstanceOf(ApiError);
    await expect(getAudit("missing")).rejects.toMatchObject({ status: 404 });
  });
});
