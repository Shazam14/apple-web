"use client";

import { useCallback, useEffect, useState } from "react";
import {
  api,
  Borrower,
  InventorySummary,
  SettingsSummary,
  formatPHP,
} from "@/lib/api";
import { totalLateFeesFor } from "@/lib/due";

function Row({
  sign,
  label,
  value,
  tone = "default",
}: {
  sign?: "−" | "+";
  label: string;
  value: string;
  tone?: "default" | "danger" | "success" | "accent";
}) {
  const valueColor =
    tone === "danger"
      ? "var(--danger)"
      : tone === "success"
        ? "var(--success)"
        : tone === "accent"
          ? "var(--accent)"
          : "var(--text)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        {sign && (
          <span
            style={{
              width: 12,
              textAlign: "center",
              color: "var(--text-3)",
              fontWeight: 700,
            }}
          >
            {sign}
          </span>
        )}
        <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>
          {label}
        </span>
      </span>
      <span
        className="money"
        style={{ fontSize: 14, fontWeight: 600, color: valueColor }}
      >
        {value}
      </span>
    </div>
  );
}

export default function MoneyPage() {
  const [summary, setSummary] = useState<SettingsSummary | null>(null);
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, inv, bs] = await Promise.all([
        api.summary(),
        api.inventorySummary(),
        api.listBorrowers(),
      ]);
      setSummary(s);
      setInventory(inv);
      setBorrowers(bs);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div
        className="kfx"
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="small">Loading…</span>
      </div>
    );
  }

  if (error || !summary || !inventory) {
    return (
      <div className="kfx" style={{ minHeight: "100dvh", padding: 20 }}>
        <div
          className="card"
          style={{
            padding: 16,
            borderColor: "var(--danger)",
            background: "var(--danger-soft)",
            color: "var(--danger)",
          }}
        >
          {error ?? "No data"}
        </div>
      </div>
    );
  }

  const totalCapital = Number(summary.total_capital) || 0;
  const lentOut = Number(summary.lent_out) || 0;
  const cashOnHand = Number(summary.cash_on_hand) || 0;
  const lentPct = totalCapital > 0 ? Math.min(100, (lentOut / totalCapital) * 100) : 0;
  const idlePct = Math.max(0, 100 - lentPct);

  let multaTotal = 0;
  let multaCount = 0;
  for (const b of borrowers) {
    const m = totalLateFeesFor(b);
    if (m > 0) {
      multaTotal += m;
      multaCount += 1;
    }
  }

  // Reconcile: CAPITAL − OUT + THAN − EXPENSES = REMAINING
  const remaining = Number(inventory.remaining);

  return (
    <div className="kfx" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "8px 20px 32px",
        }}
      >
        {/* Header */}
        <div style={{ padding: "8px 0 16px" }}>
          <div className="small" style={{ marginBottom: 2 }}>Capital</div>
          <div className="h1">Money</div>
        </div>

        {/* Hero — Capital at work */}
        <div style={{ marginBottom: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Capital at work</div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <span className="money-hero accent">{formatPHP(lentOut)}</span>
              <span className="small">of {formatPHP(totalCapital)}</span>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <span className="pill pill-warning">
                <span style={{ fontWeight: 700 }}>{summary.active_count}</span>&nbsp;active
              </span>
              <span className="pill pill-danger">
                <span style={{ fontWeight: 700 }}>{summary.overdue_count}</span>&nbsp;overdue
              </span>
              <span className="pill pill-muted">
                <span style={{ fontWeight: 700 }}>{summary.total_borrowers}</span>&nbsp;total
              </span>
            </div>

            {/* Deployment bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span className="small">Deployed</span>
              <span className="small">Idle</span>
            </div>
            <div
              style={{
                display: "flex",
                height: 10,
                width: "100%",
                borderRadius: 999,
                overflow: "hidden",
                background: "var(--surface-sunk)",
              }}
            >
              <span style={{ width: `${lentPct}%`, background: "var(--warning)" }} />
              <span style={{ width: `${idlePct}%`, background: "var(--success)" }} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 6,
                fontSize: 12,
                color: "var(--text-3)",
                fontWeight: 600,
              }}
            >
              <span>{formatPHP(lentOut)}</span>
              <span>{formatPHP(cashOnHand)}</span>
            </div>
          </div>
        </div>

        {/* Multa pending callout */}
        {multaTotal > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              className="card"
              style={{
                padding: 16,
                borderColor: "var(--warning)",
                background: "var(--warning-soft)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 4, color: "var(--warning)" }}
                  >
                    Multa pending
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                    from {multaCount} {multaCount === 1 ? "borrower" : "borrowers"}
                  </div>
                </div>
                <span
                  className="money-lg"
                  style={{ color: "var(--warning)", fontWeight: 700 }}
                >
                  +{formatPHP(multaTotal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Reconcile breakdown */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Reconcile</div>
        <div className="card" style={{ overflow: "hidden", marginBottom: 12 }}>
          <Row label="Capital" value={formatPHP(totalCapital)} />
          <Row
            sign="−"
            label="Capital out (lent)"
            value={formatPHP(inventory.capital_out_total)}
            tone="danger"
          />
          <Row
            sign="+"
            label="THAN collected"
            value={formatPHP(inventory.than_total)}
            tone="success"
          />
          <Row
            sign="−"
            label="Expenses"
            value={formatPHP(inventory.expenses_total)}
            tone="danger"
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 16px",
              background: "var(--surface-sunk)",
            }}
          >
            <span
              className="eyebrow"
              style={{ color: remaining < 0 ? "var(--danger)" : "var(--success)" }}
            >
              = Remaining peso
            </span>
            <span
              className="money-lg"
              style={{
                color: remaining < 0 ? "var(--danger)" : "var(--success)",
                fontWeight: 700,
              }}
            >
              {formatPHP(remaining)}
            </span>
          </div>
        </div>

        {/* Equation footnote */}
        <div
          className="small"
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "var(--text-3)",
            padding: "4px 0 12px",
          }}
        >
          Capital − Out + THAN − Expenses = Remaining
        </div>

        {/* Breakdown — THAN split */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>THAN collected</div>
        <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
          <Row
            label="From borrowers (auto)"
            value={formatPHP(inventory.than_borrower_total)}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>
              Extra entries
            </span>
            <span className="money" style={{ fontSize: 14, fontWeight: 600 }}>
              {formatPHP(inventory.than_extra_total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
