import { getToken, logout } from "./auth";

const APPLE_API = process.env.NEXT_PUBLIC_APPLE_API || "http://localhost:8002";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${APPLE_API}/api/v1/lending${path}`, {
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

export type Borrower = {
  id: number;
  name: string;
  principal: string;
  balance: string;
  rate_snapshot: string;
  days_elapsed: number;
  than_nakulha: string;
  status: BorrowerStatus;
  than_actual: string;
  than_unrealised: string;
  activity: ActivityEntry[];
  created_at: string;
  updated_at: string;
};

export const api = {
  summary: () => request<SettingsSummary>("GET", "/settings/summary"),
  updateSettings: (body: { total_capital: string; cash_on_hand: string; daily_rate: string }) =>
    request<SettingsSummary>("PUT", "/settings", body),
  listBorrowers: () => request<Borrower[]>("GET", "/borrowers"),
  createBorrower: (body: { name: string; principal: string }) =>
    request<Borrower>("POST", "/borrowers", body),
  patchBorrower: (
    id: number,
    body: Partial<{
      name: string;
      principal: string;
      balance: string;
      days_elapsed: number;
      than_nakulha: string;
      status: BorrowerStatus;
    }>,
  ) => request<Borrower>("PATCH", `/borrowers/${id}`, body),
  deleteBorrower: (id: number) => request<void>("DELETE", `/borrowers/${id}`),
};

export function formatPHP(v: string | number, decimals = 0): string {
  const n = typeof v === "string" ? Number(v) : v;
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatPct(v: string | number, decimals = 2): string {
  const n = typeof v === "string" ? Number(v) : v;
  return `${n.toFixed(decimals)}%`;
}
