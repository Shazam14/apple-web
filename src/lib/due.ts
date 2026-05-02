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
  due.setDate(due.getDate() + tenorDays);
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
