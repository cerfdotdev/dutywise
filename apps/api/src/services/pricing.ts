export type EntryMode = 'ocean' | 'air' | 'truck';

/** Published rate card — transparency is the wedge. */
export const RATE_CARD: Record<EntryMode, number> = { ocean: 99, air: 89, truck: 69 };
export const ISF_FEE = 35;
export const DISBURSEMENT_PCT = 0.025;

export function feeForEntry(mode: EntryMode, includeIsf = false): number {
  return RATE_CARD[mode] + (includeIsf ? ISF_FEE : 0);
}

/** Sandbox duty rate heuristic (5% base) — real engine applies HTS + country rules. */
export const SANDBOX_DUTY_RATE = 0.05;

export function estimateDuty(quantity: number, unitValue: number): number {
  return Math.round(quantity * unitValue * SANDBOX_DUTY_RATE * 100) / 100;
}
