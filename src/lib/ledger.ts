import { Tranche, ActivityEntry, Borrower } from "./api";
import { lateFeeFor, computeTrancheSettledAt } from "./due";

export type LedgerRow =
  | { kind: "palod"; id: number; amount: string; than: string; date: string; trancheIndex: number; label: string | null; tenor_days: number | null; balance: number }
  | { kind: "latefee"; id: string; amount: string; detail: string; date: string; balance: number }
  | { kind: "graceday"; id: string; detail: string; date: string; balance: number }
  | { kind: "than"; id: number; amount: string; detail: string; date: string; balance: number }
  | { kind: "bayad"; id: number; amount: string; detail: string; date: string; balance: number }
  | { kind: "closed"; id: number; amount: string; detail: string; date: string; balance: number }
  | { kind: "note"; id: number; detail: string; date: string; balance: number };

export function buildLedger(tranches: Tranche[], activity: ActivityEntry[], borrower: Borrower): LedgerRow[] {
  const settledMap = computeTrancheSettledAt(borrower);
  const rows: LedgerRow[] = tranches.map((t, i) => ({
    kind: "palod",
    id: t.id,
    amount: t.principal,
    than: lateFeeFor(t, borrower, undefined, settledMap.get(t.id) ?? null).baseInterest.toFixed(2),
    date: t.released_at,
    trancheIndex: i + 1,
    label: t.label ?? null,
    tenor_days: t.tenor_days ?? null,
    balance: 0,
  }));
  for (const a of activity) {
    if (a.activity_type === "Late interest" && a.amount) {
      rows.push({ kind: "than", id: a.id, amount: a.amount, detail: a.detail ?? "", date: a.created_at, balance: 0 });
    } else if (
      (a.activity_type === "Payment received" || a.activity_type === "Partial payment") &&
      a.amount
    ) {
      rows.push({ kind: "bayad", id: a.id, amount: a.amount, detail: a.detail ?? "", date: a.created_at, balance: 0 });
    } else if (a.activity_type === "Missed collection") {
      rows.push({ kind: "note", id: a.id, detail: a.detail ?? "Missed collection", date: a.created_at, balance: 0 });
    } else if (a.activity_type === "Loan closed" && a.amount) {
      rows.push({ kind: "closed", id: a.id, amount: a.amount, detail: a.detail ?? "closed", date: a.created_at, balance: 0 });
    }
  }
  const lateRows: LedgerRow[] = [];
  for (const t of tranches) {
    const calc = lateFeeFor(t, borrower, undefined, settledMap.get(t.id) ?? null);
    if (calc.periodsLate > 0 && calc.dueDate) {
      const period = t.late_fee_period_days ?? 1;
      const trancheIndex = tranches.indexOf(t) + 1;
      for (let i = 1; i <= calc.periodsLate; i++) {
        const feeDate = new Date(calc.dueDate);
        feeDate.setDate(feeDate.getDate() + i * period);
        lateRows.push({
          kind: "latefee",
          id: `late-${t.id}-${i}`,
          amount: calc.dailyInterest.toFixed(2),
          detail: `palod #${trancheIndex} late fee`,
          date: feeDate.toISOString(),
          balance: 0,
        });
      }
    }
  }
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const graceDates = new Map<number, number>();
  for (const t of tranches) {
    const calc = lateFeeFor(t, borrower, undefined, settledMap.get(t.id) ?? null);
    if (calc.dueDate && calc.dueDate.getTime() <= todayStart.getTime()) {
      graceDates.set(calc.dueDate.getTime(), (graceDates.get(calc.dueDate.getTime()) ?? 0) + 1);
    }
  }
  const graceRows: LedgerRow[] = [...graceDates.keys()].map((ts) => ({
    kind: "graceday",
    id: `grace-${ts}`,
    detail: "due date · walay multa",
    date: new Date(ts).toISOString(),
    balance: 0,
  }));
  const allRows = [...rows, ...lateRows, ...graceRows];

  const tieOrder: Record<LedgerRow["kind"], number> = {
    palod: 0,
    than: 1,
    bayad: 2,
    note: 3,
    graceday: 4,
    latefee: 5,
    closed: 6,
  };
  allRows.sort((a, b) => {
    const d = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (d !== 0) return d;
    return tieOrder[a.kind] - tieOrder[b.kind];
  });

  let running = 0;
  for (const r of allRows) {
    if (r.kind === "palod") running += Number(r.amount) + Number(r.than);
    else if (r.kind === "latefee") running += Number(r.amount);
    else if (r.kind === "than") running += Number(r.amount);
    else if (r.kind === "bayad") running -= Number(r.amount);
    else if (r.kind === "closed") running -= Number(r.amount);
    r.balance = running;
  }
  return allRows;
}
