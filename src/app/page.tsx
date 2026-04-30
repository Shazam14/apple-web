"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, Borrower, SettingsSummary } from "@/lib/api";
import { getToken, logout } from "@/lib/auth";
import { CapitalOverview } from "@/components/CapitalOverview";
import { RateSettings } from "@/components/RateSettings";
import { BorrowersTable } from "@/components/BorrowersTable";

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<SettingsSummary | null>(null);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, bs] = await Promise.all([api.summary(), api.listBorrowers()]);
      setSummary(s);
      setBorrowers(bs);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    load();
  }, [router, load]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-muted">
        Loading…
      </main>
    );
  }

  if (error || !summary) {
    return (
      <main className="min-h-screen p-6 max-w-3xl mx-auto">
        <div className="rounded-xl border border-amber/40 bg-amber/10 text-amber-soft p-4">
          {error ?? "No data"}
        </div>
      </main>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 max-w-[1180px] mx-auto space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Lending dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Owner-controlled · All fields editable
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="rounded-full border border-card-border bg-card px-3 py-1 text-muted-soft whitespace-nowrap">
            {today}
          </span>
          <button
            onClick={logout}
            className="rounded-full border border-card-border bg-card hover:bg-card-border px-3 py-1 text-muted-soft"
          >
            Sign out
          </button>
        </div>
      </header>

      <CapitalOverview s={summary} />
      <RateSettings s={summary} onSaved={() => load()} />
      <BorrowersTable borrowers={borrowers} onChange={load} />
    </main>
  );
}
