import { getToken, logout } from "./auth";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api/v1/lending${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    logout();
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type SettingsSummary = {
  total_capital: string;
  cash_on_hand: string;
  lent_out: string;
  daily_rate: string;
  weekly_rate: string;
  monthly_rate: string;
  than_day: string;
  than_month: string;
  total_borrowers: number;
  active_count: number;
  overdue_count: number;
  sum_than_actual: string;
  sum_than_unrealised: string;
  sum_than_nakulha: string;
  total_balance: string;
};

export type BorrowerStatus = "active" | "paid" | "overdue";

export type ActivityEntry = {
  id: number;
  activity_type: string;
  detail: string | null;
  amount: string | null;
  payment_method: string | null;
  destination: string | null;
  created_at: string;
};

export type Tranche = {
  id: number;
  principal: string;
  than: string;
  label: string | null;
  tenor_days: number | null;
  rate_pct: string | null;
  late_fee_period_days: number | null;
  released_at: string;
};

export type TrancheBody = {
  principal: string;
  than?: string;
  label?: string;
  tenor_days?: number | null;
  rate_pct?: string | null;
  late_fee_period_days?: number | null;
  released_at?: string;
};

export type Borrower = {
  id: number;
  name: string;
  principal: string;
  balance: string;
  rate_snapshot: string;
  than_nakulha: string;
  than_override: string | null;
  status: BorrowerStatus;
  than_actual: string;
  than_computed: string;
  than_unrealised: string;
  tranches: Tranche[];
  activity: ActivityEntry[];
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type InventoryCategory = "expense" | "than_extra";

export type InventoryEntry_ = {
  id: number;
  category: InventoryCategory;
  description: string;
  amount: string;
  created_at: string;
};

export type CapitalOutItem = {
  borrower_id: number;
  name: string;
  amount: string;
};

export type InventorySummary = {
  capital: string;
  capital_out_total: string;
  capital_out_items: CapitalOutItem[];
  than_borrower_total: string;
  than_extra_total: string;
  than_total: string;
  expenses_total: string;
  remaining: string;
  entries: InventoryEntry_[];
};

export const api = {
  summary: () => request<SettingsSummary>("GET", "/settings/summary"),
  updateSettings: (body: { total_capital: string; cash_on_hand: string; daily_rate: string }) =>
    request<SettingsSummary>("PUT", "/settings", body),
  listBorrowers: () => request<Borrower[]>("GET", "/borrowers"),
  listArchivedBorrowers: () => request<Borrower[]>("GET", "/borrowers?archived=true"),
  archiveBorrower: (id: number) =>
    request<Borrower>("POST", `/borrowers/${id}/archive`),
  unarchiveBorrower: (id: number) =>
    request<Borrower>("POST", `/borrowers/${id}/unarchive`),
  inventorySummary: () => request<InventorySummary>("GET", "/inventory/summary"),
  addInventoryEntry: (body: { category: InventoryCategory; description: string; amount: string }) =>
    request<InventoryEntry_>("POST", "/inventory/entries", body),
  deleteInventoryEntry: (id: number) =>
    request<void>("DELETE", `/inventory/entries/${id}`),
  createBorrower: (body: TrancheBody & { name: string }) =>
    request<Borrower>("POST", "/borrowers", body),
  addTranche: (borrowerId: number, body: TrancheBody) =>
    request<Borrower>("POST", `/borrowers/${borrowerId}/tranches`, body),
  patchTranche: (borrowerId: number, trancheId: number, body: Partial<TrancheBody>) =>
    request<Borrower>("PATCH", `/borrowers/${borrowerId}/tranches/${trancheId}`, body),
  deleteTranche: (borrowerId: number, trancheId: number) =>
    request<void>("DELETE", `/borrowers/${borrowerId}/tranches/${trancheId}`),
  patchBorrower: (
    id: number,
    body: Partial<{
      name: string;
      balance: string;
      than_nakulha: string;
      than_override: string | null;
      status: BorrowerStatus;
    }>,
  ) => request<Borrower>("PATCH", `/borrowers/${id}`, body),
  deleteBorrower: (id: number) => request<void>("DELETE", `/borrowers/${id}`),
  addActivity: (
    borrowerId: number,
    body: { activity_type: string; detail: string; amount?: string },
  ) => request<ActivityEntry>("POST", `/borrowers/${borrowerId}/activity`, body),
  editActivity: (borrowerId: number, activityId: number, body: { amount?: string; detail?: string }) =>
    request<ActivityEntry>("PATCH", `/borrowers/${borrowerId}/activity/${activityId}`, body),
  deleteActivity: (borrowerId: number, activityId: number) =>
    request<void>("DELETE", `/borrowers/${borrowerId}/activity/${activityId}`),
};

export function formatPHP(v: string | number, decimals = 0): string {
  const n = typeof v === "string" ? Number(v) : v;
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatPct(v: string | number, decimals = 2): string {
  const n = typeof v === "string" ? Number(v) : v;
  return `${n.toFixed(decimals)}%`;
}
