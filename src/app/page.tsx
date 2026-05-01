"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, Borrower, SettingsSummary } from "@/lib/api";
import { getToken, logout } from "@/lib/auth";
import { CapitalOverview } from "@/components/CapitalOverview";
import { RateSettings } from "@/components/RateSettings";
import { BorrowersTable } from "@/components/BorrowersTable";

const STEPS = [
  {
    icon: "⚙️",
    title: "I-set ang imong kapital",
    body: "Sulod sa daily rate, total capital, ug cash on hand sa THAN Rate & Capital Settings. Kini mao ang pundasyon sa tanan.",
  },
  {
    icon: "➕",
    title: "Dugangi ug borrower",
    body: 'I-klik ang "+ Add borrower". Ibutang ang ngalan ug unang palod (loan amount). Makita dayon siya sa lista.',
  },
  {
    icon: "💸",
    title: "Bag-ong palod (additional release)",
    body: 'Kung mag-release ug pautang sa existing borrower, i-klik ang "+ release" sa iyang row. Mag-dugang ug bag-ong tranche.',
  },
  {
    icon: "📅",
    title: "I-post ang interest sa matag adlaw",
    body: 'I-klik ang "+ interest" — auto-fill na ang amount base sa daily rate × principal. Confirm lang ug Post. Wala nay kalkulohon pa!',
  },
  {
    icon: "⚠️",
    title: "Latepay / penalty",
    body: 'Kung naa\'y overdue charge o penalty, i-klik ang "+ latepay" ug manual nga sulod ang amount ug note.',
  },
  {
    icon: "✅",
    title: "I-record ang bayad",
    body: "I-klik ang \"+ bayad\" sa borrower row. Sulod ang amount ug note (e.g. \"toa ub sim\" o \"cash\"). Ma-deduct dayon sa balance ug makita sa ledger.",
  },
];

function GettingStarted() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-card-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-card-border/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🇵🇭</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-muted">
            Pagsugod — Getting Started <span className="normal-case font-normal text-muted/60">(sa Bisaya)</span>
          </span>
        </div>
        <span className="text-muted text-xs">{open ? "▲ itago" : "▼ ipakita"}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-card-border">
          {STEPS.map((s, i) => (
            <div key={i} className="mt-4 rounded-xl border border-card-border bg-bg/40 px-4 py-3 space-y-1">
              <div className="text-xl">{s.icon}</div>
              <div className="text-sm font-semibold">{s.title}</div>
              <div className="text-xs text-muted leading-relaxed">{s.body}</div>
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-3 mt-1 text-[11px] text-muted/50 text-center">
            Gihimo kini para nimo, boss. Maayong negosyo! 💪
          </div>
        </div>
      )}
    </div>
  );
}

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

      <GettingStarted />
      <CapitalOverview s={summary} />
      <RateSettings s={summary} onSaved={() => load()} />
      <BorrowersTable borrowers={borrowers} onChange={load} />
    </main>
  );
}
