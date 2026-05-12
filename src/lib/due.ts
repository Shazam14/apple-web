import { Tranche, Borrower } from "./api";

export type DueKind = "none" | "future" | "soon" | "today" | "overdue";

export type DueState = {
  kind: DueKind;
  daysRemaining: number;
  dueDate: Date | null;
  label: string;
};

const NONE: DueState = { kind: "none", daysRemaining: 0, dueDate: null, label: "" };

export function dueStateFor(releasedAt: string, tenorDays: number | null): DueState {
  if (!tenorDays || tenorDays <= 0) return NONE;
  const released = new Date(releasedAt);
  const due = new Date(released);
  due.setDate(due.getDate() + tenorDays - 1);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ms = due.getTime() - today.getTime();
  const days = Math.round(ms / 86_400_000);

  if (days < 0) {
    return {
      kind: "overdue",
      daysRemaining: days,
      dueDate: due,
      label: `+${Math.abs(days)}d overdue`,
    };
  }
  if (days === 0) {
    return { kind: "today", daysRemaining: 0, dueDate: due, label: "DUE TODAY" };
  }
  if (days <= 2) {
    return { kind: "soon", daysRemaining: days, dueDate: due, label: `due in ${days}d` };
  }
  return { kind: "future", daysRemaining: days, dueDate: due, label: `in ${days}d` };
}

export function trancheDueState(t: Tranche): DueState {
  return dueStateFor(t.released_at, t.tenor_days);
}

export type BorrowerDueSummary = {
  overdue: number;
  today: number;
  soon: number;
};

export function summariseBorrowerDue(b: Borrower): BorrowerDueSummary {
  let overdue = 0;
  let today = 0;
  let soon = 0;
  if (b.status === "paid") return { overdue, today, soon };
  for (const t of b.tranches) {
    const s = trancheDueState(t);
    if (s.kind === "overdue") overdue++;
    else if (s.kind === "today") today++;
    else if (s.kind === "soon") soon++;
  }
  return { overdue, today, soon };
}

// ── Calculator math (per-tranche rate × period) ─────────────────────────

export type CalcInputs = {
  principal: number;
  ratePct: number;
  releasedAt: Date;
  tenorDays: number | null;
  lateFeePeriodDays: number | null;
};

export type CalcResult = {
  dailyInterest: number;   // principal × rate% — one day's interest unit
  baseInterest: number;    // accrued from released_at → asOf, capped at tenor
  interestAtDue: number;   // dailyInterest × tenorDays (0 if no tenor)
  daysLate: number;
  periodsLate: number;
  totalLateFee: number;
  totalOwed: number;
  dueDate: Date | null;
};

export function computeCalc(input: CalcInputs, asOf: Date = new Date()): CalcResult {
  const { principal, ratePct, releasedAt, tenorDays, lateFeePeriodDays } = input;
  const dailyInterest = principal > 0 && ratePct > 0 ? principal * (ratePct / 100) : 0;

  let dueDate: Date | null = null;
  if (tenorDays && tenorDays > 0) {
    dueDate = new Date(releasedAt);
    dueDate.setDate(dueDate.getDate() + tenorDays - 1);
    dueDate.setHours(0, 0, 0, 0);
  }

  const interestAtDue = tenorDays && tenorDays > 0 ? dailyInterest * tenorDays : 0;

  const today = new Date(asOf);
  today.setHours(0, 0, 0, 0);
  const released = new Date(releasedAt);
  released.setHours(0, 0, 0, 0);
  const daysSinceRelease = Math.round((today.getTime() - released.getTime()) / 86_400_000);

  // Backend: max(1, daysSinceRelease + 1) — release day counts as charge #1,
  // every day after compounds another rate%.
  let accruedDays = 0;
  if (daysSinceRelease >= 0) {
    const raw = Math.max(1, daysSinceRelease + 1);
    accruedDays = tenorDays && tenorDays > 0 ? Math.min(raw, tenorDays) : raw;
  }
  const baseInterest = dailyInterest * accruedDays;

  let daysLate = 0;
  if (dueDate) {
    const ms = today.getTime() - dueDate.getTime();
    daysLate = Math.max(0, Math.round(ms / 86_400_000));
  }

  const period = lateFeePeriodDays ?? 0;
  const periodsLate = period > 0 && daysLate > 0 ? Math.floor(daysLate / period) : 0;
  const totalLateFee = periodsLate * dailyInterest;
  const totalOwed = principal + baseInterest + totalLateFee;

  return { dailyInterest, baseInterest, interestAtDue, daysLate, periodsLate, totalLateFee, totalOwed, dueDate };
}

export function lateFeeFor(
  t: Tranche,
  b?: Borrower,
  asOf?: Date,
  settledAt?: Date | null,
): CalcResult {
  const ratePctRaw = t.rate_pct ?? b?.rate_snapshot ?? "0";
  const baseAsOf = asOf ?? new Date();
  const effectiveAsOf =
    settledAt && settledAt.getTime() < baseAsOf.getTime() ? settledAt : baseAsOf;
  return computeCalc(
    {
      principal: Number(t.principal),
      ratePct: Number(ratePctRaw),
      releasedAt: new Date(t.released_at),
      tenorDays: t.tenor_days,
      lateFeePeriodDays: t.late_fee_period_days,
    },
    effectiveAsOf,
  );
}

// Walk activity chronologically; per-tranche settled_at = first moment AFTER
// release where running balance hits zero. Tranches settled this way stop
// accruing late fees at the settlement moment. Tranches released after the
// last zero-moment remain live (settled_at = null).
export function computeTrancheSettledAt(b: Borrower): Map<number, Date | null> {
  type Ev = { date: Date; delta: number };
  const events: Ev[] = [];
  for (const t of b.tranches) {
    events.push({
      date: new Date(t.released_at),
      delta: Number(t.principal) + Number(t.than),
    });
  }
  for (const a of b.activity) {
    const amt = Number(a.amount ?? 0);
    if (!amt) continue;
    if (a.activity_type === "Payment received" || a.activity_type === "Partial payment") {
      events.push({ date: new Date(a.created_at), delta: -amt });
    } else if (a.activity_type === "Late interest") {
      events.push({ date: new Date(a.created_at), delta: amt });
    } else if (a.activity_type === "Loan closed") {
      events.push({ date: new Date(a.created_at), delta: -amt });
    }
  }
  events.sort((x, y) => x.date.getTime() - y.date.getTime());

  let running = 0;
  const zeroMoments: Date[] = [];
  for (const ev of events) {
    running += ev.delta;
    if (running <= 0) zeroMoments.push(ev.date);
  }

  const result = new Map<number, Date | null>();
  for (const t of b.tranches) {
    const released = new Date(t.released_at).getTime();
    const first = zeroMoments.find((z) => z.getTime() > released) ?? null;
    result.set(t.id, first);
  }
  return result;
}

// Sum of all unpaid late-fee accruals across a borrower's tranches.
// Honours per-tranche rate_pct, falls back to borrower rate_snapshot.
export function totalLateFeesFor(b: Borrower, asOf?: Date): number {
  if (b.status === "paid") return 0;
  const settled = computeTrancheSettledAt(b);
  let total = 0;
  for (const t of b.tranches) {
    total += lateFeeFor(t, b, asOf, settled.get(t.id) ?? null).totalLateFee;
  }
  return total;
}
