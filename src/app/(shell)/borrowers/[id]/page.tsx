"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, Borrower, formatPHP } from "@/lib/api";
import { totalLateFeesFor } from "@/lib/due";
import { buildLedger, LedgerRow } from "@/lib/ledger";
import { BayadSheet } from "@/components/shell/BayadSheet";
import { AddTrancheModal } from "@/components/AddTrancheModal";
import { LatepayModal } from "@/components/LatepayModal";
import { CloseLoanModal } from "@/components/CloseLoanModal";

const AVATAR_PALETTE = [
  "#2a6fdb",
  "#1f8a5b",
  "#c47a1a",
  "#9333ea",
  "#0891b2",
  "#dc2626",
  "#1f3a5c",
  "#65a30d",
];

function avatarFor(name: string): { color: string; initials: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const color = AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  const parts = name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
  return { color, initials };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function collectedTotal(b: Borrower): number {
  return b.activity
    .filter((a) => a.activity_type === "Payment received" || a.activity_type === "Partial payment")
    .reduce((s, a) => s + Number(a.amount || 0), 0);
}

function rowMeta(r: LedgerRow): {
  icon: string;
  tone: "success" | "warning" | "danger" | "accent" | "muted";
  primary: string;
  amount: string;
  amountTone: "pos" | "neg" | "accent" | "muted";
  tag?: string;
} {
  switch (r.kind) {
    case "palod":
      return {
        icon: "↗",
        tone: "accent",
        primary: `Palod #${r.trancheIndex}${r.label ? ` · ${r.label}` : ""}`,
        amount: formatPHP(r.amount),
        amountTone: "accent",
        tag: r.tenor_days ? `${r.tenor_days}d` : undefined,
      };
    case "than":
      return {
        icon: "+",
        tone: "warning",
        primary: r.detail || "Late interest",
        amount: formatPHP(r.amount),
        amountTone: "neg",
        tag: "than",
      };
    case "bayad":
      return {
        icon: "↙",
        tone: "success",
        primary: r.detail || "Bayad",
        amount: `− ${formatPHP(r.amount)}`,
        amountTone: "pos",
      };
    case "latefee":
      return {
        icon: "!",
        tone: "danger",
        primary: r.detail,
        amount: `+ ${formatPHP(r.amount)}`,
        amountTone: "neg",
        tag: "multa",
      };
    case "graceday":
      return {
        icon: "·",
        tone: "muted",
        primary: r.detail,
        amount: "",
        amountTone: "muted",
      };
    case "closed":
      return {
        icon: "✓",
        tone: "accent",
        primary: r.detail || "Closed",
        amount: `− ${formatPHP(r.amount)}`,
        amountTone: "accent",
        tag: "closed",
      };
    case "note":
      return {
        icon: "·",
        tone: "muted",
        primary: r.detail,
        amount: "",
        amountTone: "muted",
      };
  }
}

function LedgerEntry({ r, last }: { r: LedgerRow; last: boolean }) {
  const m = rowMeta(r);
  const tinted = m.tone !== "muted";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        borderBottom: last ? 0 : "1px solid var(--border)",
        opacity: r.kind === "graceday" ? 0.55 : 1,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          flexShrink: 0,
          background: tinted ? `var(--${m.tone}-soft)` : "var(--surface-sunk)",
          color: tinted ? `var(--${m.tone})` : "var(--text-3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {m.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: r.kind === "graceday" ? "var(--text-3)" : "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {m.primary}
          </span>
          {m.amount && (
            <span
              className={`money-sm ${m.amountTone === "pos" ? "pos" : m.amountTone === "neg" ? "neg" : m.amountTone === "accent" ? "accent" : ""}`}
              style={{ flexShrink: 0 }}
            >
              {m.amount}
            </span>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 2 }}>
          <span className="small">{formatDate(r.date)}</span>
          {m.tag && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: tinted ? `var(--${m.tone})` : "var(--text-3)",
              }}
            >
              {m.tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BorrowerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const router = useRouter();

  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bayadOpen, setBayadOpen] = useState(false);
  const [palodOpen, setPalodOpen] = useState(false);
  const [latepayOpen, setLatepayOpen] = useState(false);
  const [multaOpen, setMultaOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await api.listBorrowers();
      const b = list.find((x) => x.id === id) ?? null;
      setBorrower(b);
      setError(b ? null : "Borrower not found");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function onArchive() {
    if (!borrower) return;
    if (!confirm(`Archive ${borrower.name}?\n\nMakatipig sa archive — pwede pa balikon. History ma-preserve.`)) return;
    setArchiving(true);
    try {
      await api.archiveBorrower(borrower.id);
      router.push("/borrowers");
    } catch (e) {
      alert(`Failed to archive: ${e instanceof Error ? e.message : String(e)}`);
      setArchiving(false);
    }
  }

  if (loading) {
    return (
      <div
        className="kfx"
        style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <span className="small">Loading…</span>
      </div>
    );
  }

  if (error || !borrower) {
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
          {error ?? "Not found"}
        </div>
        <div style={{ marginTop: 16 }}>
          <Link className="btn btn-secondary" href="/borrowers">← Borrowers</Link>
        </div>
      </div>
    );
  }

  const { color, initials } = avatarFor(borrower.name);
  const balance = Number(borrower.balance);
  const principal = Number(borrower.principal);
  const thanActual = Number(borrower.than_actual);
  const collected = collectedTotal(borrower);
  const isOverdue = borrower.status === "overdue";
  const isPaid = borrower.status === "paid";
  const pendingMulta = totalLateFeesFor(borrower);
  const rows = buildLedger(borrower.tranches, borrower.activity, borrower);
  const ledgerRows = [...rows].reverse();
  const canClose = balance > 0;

  return (
    <div
      className="kfx"
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        opacity: archiving ? 0 : 1,
        transition: "opacity .25s ease-out",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 20px 32px" }}>
        {/* Top nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 0 12px",
          }}
        >
          <Link
            href="/borrowers"
            className="btn btn-ghost"
            style={{ height: 36, padding: "0 10px", gap: 6, textDecoration: "none" }}
          >
            ← Borrowers
          </Link>
        </div>

        {/* Header: avatar + name + status pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div
            className="avatar"
            style={{ background: color, width: 56, height: 56, fontSize: 18, flexShrink: 0 }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="h2" style={{ marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {borrower.name}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {isPaid ? (
                <span className="pill pill-success">paid</span>
              ) : (
                <span className={`pill pill-${isOverdue ? "danger" : "warning"}`}>
                  {isOverdue ? "overdue" : "active"}
                </span>
              )}
              {pendingMulta > 0 && (
                <span className="pill pill-danger">
                  +{formatPHP(pendingMulta, 0)} multa
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Balance hero */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Balance</div>
          <div className="money-hero accent" style={{ marginBottom: 16 }}>{formatPHP(balance)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <div className="small" style={{ marginBottom: 2 }}>Released</div>
              <div className="money" style={{ fontSize: 15 }}>{formatPHP(principal)}</div>
            </div>
            <div>
              <div className="small" style={{ marginBottom: 2 }}>Than / day</div>
              <div className="money accent" style={{ fontSize: 15 }}>{formatPHP(thanActual)}</div>
            </div>
            <div>
              <div className="small" style={{ marginBottom: 2 }}>Collected</div>
              <div className="money pos" style={{ fontSize: 15 }}>{formatPHP(collected)}</div>
            </div>
          </div>
        </div>

        {/* Primary actions 2x2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            className="btn btn-success"
            style={{ height: 48 }}
            onClick={() => setBayadOpen(true)}
          >
            + Bayad
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ height: 48 }}
            onClick={() => setPalodOpen(true)}
          >
            + Palod
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: 44 }}
            onClick={() => setLatepayOpen(true)}
          >
            + Latepay
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: 44 }}
            onClick={() => setMultaOpen(true)}
          >
            + Multa
          </button>
        </div>

        {/* Ledger */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <div className="eyebrow">Ledger</div>
          <span className="small">
            {ledgerRows.length} {ledgerRows.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            {ledgerRows.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center" }} className="small">
                No entries yet
              </div>
            ) : (
              ledgerRows.map((r, i) => (
                <LedgerEntry
                  key={`${r.kind}-${r.id}`}
                  r={r}
                  last={i === ledgerRows.length - 1}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer destructive */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => setCloseOpen(true)}
            disabled={!canClose}
            title={canClose ? "Close / waive remaining balance" : "Already paid"}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={onArchive}
            disabled={archiving}
          >
            Archive
          </button>
        </div>
      </div>

      {bayadOpen && (
        <BayadSheet
          borrower={borrower}
          onClose={() => setBayadOpen(false)}
          onAdded={() => load()}
        />
      )}
      {palodOpen && (
        <AddTrancheModal
          borrower={borrower}
          onClose={() => setPalodOpen(false)}
          onAdded={() => {
            setPalodOpen(false);
            load();
          }}
        />
      )}
      {latepayOpen && (
        <LatepayModal
          borrower={borrower}
          onClose={() => setLatepayOpen(false)}
          onAdded={() => {
            setLatepayOpen(false);
            load();
          }}
        />
      )}
      {multaOpen && (
        <LatepayModal
          borrower={borrower}
          defaultAmount={pendingMulta > 0 ? pendingMulta.toFixed(2) : undefined}
          onClose={() => setMultaOpen(false)}
          onAdded={() => {
            setMultaOpen(false);
            load();
          }}
        />
      )}
      {closeOpen && (
        <CloseLoanModal
          borrower={borrower}
          onClose={() => setCloseOpen(false)}
          onAdded={() => {
            setCloseOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
