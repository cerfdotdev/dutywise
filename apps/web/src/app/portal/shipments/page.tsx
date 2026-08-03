"use client";

import { useEffect, useState } from "react";
import {
  createShipment,
  listShipments,
  type EntryMode,
  type Shipment,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  Card,
  Cell,
  DataTable,
  EmptyState,
  ErrorBox,
  Field,
  SectionTitle,
  Skeleton,
  Spinner,
  StatusChip,
  btnPrimary,
  errorMessage,
  fmtDate,
  inputClass,
} from "@/components/portal/PortalUi";

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<Shipment | null>(null);
  const [form, setForm] = useState({
    mode: "ocean" as EntryMode,
    carrier: "",
    blNumber: "",
    originPort: "",
    destinationPort: "",
    eta: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listShipments();
        if (!cancelled) {
          setShipments(res);
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
  }, [reloadKey]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!form.carrier.trim() || !form.blNumber.trim()) {
      setFormError("Carrier and bill of lading number are required.");
      return;
    }
    setCreating(true);
    try {
      const shipment = await createShipment({
        mode: form.mode,
        carrier: form.carrier.trim(),
        blNumber: form.blNumber.trim(),
        originPort: form.originPort.trim() || undefined,
        destinationPort: form.destinationPort.trim() || undefined,
        eta: form.eta || undefined,
      });
      setCreated(shipment);
      setShowForm(false);
      setForm({ mode: "ocean", carrier: "", blNumber: "", originPort: "", destinationPort: "", eta: "" });
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
          sub="Track shipments and link entries as they move through customs."
        >
          Shipments
        </SectionTitle>
        <div className="w-fit">
          <Button
            variant="amber"
            magnetic={false}
            onClick={() => setShowForm((v) => !v)}
            ariaLabel="New shipment"
          >
            {showForm ? "Close form" : "New shipment"}
          </Button>
        </div>
      </div>

      {created ? (
        <div
          role="status"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-clearance-green/50 bg-clearance-green/10 px-4 py-3"
        >
          <p className="text-sm text-paper">
            Shipment{" "}
            <span className="font-mono">
              {created.carrier} · {created.blNumber}
            </span>{" "}
            registered — {created.entryCount} entry linked.
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
          <SectionTitle sub="Add the bill of lading details before entries land.">
            New shipment
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
            <Field label="Carrier">
              <input
                type="text"
                required
                value={form.carrier}
                onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                className={inputClass}
                placeholder="e.g. Maersk"
              />
            </Field>
            <Field label="Bill of lading / AWB number">
              <input
                type="text"
                required
                value={form.blNumber}
                onChange={(e) => setForm({ ...form, blNumber: e.target.value })}
                className={inputClass}
                placeholder="e.g. MAEU123456789"
              />
            </Field>
            <Field label="Origin port">
              <input
                type="text"
                value={form.originPort}
                onChange={(e) => setForm({ ...form, originPort: e.target.value })}
                className={inputClass}
                placeholder="e.g. Ningbo, CN"
              />
            </Field>
            <Field label="Destination port">
              <input
                type="text"
                value={form.destinationPort}
                onChange={(e) => setForm({ ...form, destinationPort: e.target.value })}
                className={inputClass}
                placeholder="e.g. Los Angeles, US"
              />
            </Field>
            <Field label="ETA">
              <input
                type="date"
                value={form.eta}
                onChange={(e) => setForm({ ...form, eta: e.target.value })}
                className={inputClass}
              />
            </Field>
            <div className="md:col-span-2">
              <button type="submit" disabled={creating} className={btnPrimary}>
                {creating ? <Spinner /> : null}
                Create shipment
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card flush className="mt-6">
        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <ErrorBox message={error} />
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No shipments yet"
              body="Register your first shipment and link entries to it as goods move."
            />
          </div>
        ) : (
          <DataTable head={["Shipment", "BL / AWB", "Mode", "Route", "ETA", "Status", "Entries"]}>
            {shipments.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-white/[0.03]">
                <Cell className="font-medium">{s.carrier}</Cell>
                <Cell mono className="text-signal-blue">
                  {s.blNumber}
                </Cell>
                <Cell muted mono>
                  {s.mode}
                </Cell>
                <Cell muted>
                  {s.originPort ?? "—"} → {s.destinationPort ?? "—"}
                </Cell>
                <Cell muted mono>
                  {s.eta ? fmtDate(s.eta) : "—"}
                </Cell>
                <Cell>
                  <StatusChip status={s.status} />
                </Cell>
                <Cell mono right>
                  {s.entryCount.toLocaleString()}
                </Cell>
              </tr>
            ))}
          </DataTable>
        )}
      </Card>
    </div>
  );
}
