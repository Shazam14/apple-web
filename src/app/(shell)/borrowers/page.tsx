"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, Borrower, formatPHP } from "@/lib/api";
import { summariseBorrowerDue, totalLateFeesFor } from "@/lib/due";
import { AddBorrowerModal } from "@/components/AddBorrowerModal";

type FilterKey = "all" | "overdue" | "today" | "multa" | "paid";

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

function avatarFor(b: Borrower): { color: string; initials: string } {
  let hash = 0;
  for (let i = 0; i < b.name.length; i++) hash = (hash * 31 + b.name.charCodeAt(i)) >>> 0;
  const color = AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  const parts = b.name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
  return { color, initials };
}

function Avatar({ b, size = 40 }: { b: Borrower; size?: number }) {
  const { color, initials } = avatarFor(b);
  return (
    <div
      className="avatar"
      style={{
        background: color,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function statusFor(b: Borrower): {
  kind: "active" | "overdue" | "paid";
  hasMulta: boolean;
  multa: number;
} {
  const multa = totalLateFeesFor(b);
  const due = summariseBorrowerDue(b);
  const hasMulta = multa > 0;
  if (b.status === "paid") return { kind: "paid", hasMulta, multa };
  if (b.status === "overdue" || due.overdue > 0) return { kind: "overdue", hasMulta, multa };
  return { kind: "active", hasMulta, multa };
}

function BorrowerRow({ b, last }: { b: Borrower; last: boolean }) {
  const balance = Number(b.balance);
  const thanDay = Number(b.than_computed);
  const { kind, hasMulta, multa } = statusFor(b);
  const trancheCount = b.tranches.length;

  const statusPill =
    kind === "overdue" ? (
      <span className="pill pill-danger">overdue</span>
    ) : kind === "paid" ? (
      <span className="pill pill-success">paid</span>
    ) : (
      <span className="pill pill-warning">active</span>
    );

  return (
    <Link
      href={`/borrowers/${b.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderBottom: last ? 0 : "1px solid var(--border)",
        color: "var(--text)",
        textDecoration: "none",
      }}
    >
      <Avatar b={b} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            {b.name}
          </span>
          {trancheCount > 1 && (
            <span
              style={{
                fontSize: 11,
                color: "var(--text-3)",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              ×{trancheCount}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {statusPill}
          {hasMulta && (
            <span className="pill pill-warning">+{formatPHP(multa, 0)} multa</span>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <span className="money" style={{ fontSize: 14, fontWeight: 700 }}>
          {formatPHP(balance)}
        </span>
        {thanDay > 0 && kind !== "paid" && (
          <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>
            {formatPHP(thanDay, 0)}/day
          </span>
        )}
      </div>
    </Link>
  );
}

function Chip({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pill"
      style={{
        background: active ? "var(--accent)" : "var(--surface-sunk)",
        color: active ? "var(--on-accent)" : "var(--text-2)",
        border: 0,
        cursor: "pointer",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ fontWeight: 700, marginLeft: 6, opacity: active ? 1 : 0.7 }}>
        {count}
      </span>
    </button>
  );
}

export default function BorrowersPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const bs = await api.listBorrowers();
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

  const counts = useMemo(() => {
    let overdue = 0;
    let today = 0;
    let multa = 0;
    let paid = 0;
    for (const b of borrowers) {
      const s = statusFor(b);
      if (s.kind === "overdue") overdue++;
      if (s.kind === "paid") paid++;
      if (s.hasMulta) multa++;
      if (s.kind !== "paid" && summariseBorrowerDue(b).today > 0) today++;
    }
    return { all: borrowers.length, overdue, today, multa, paid };
  }, [borrowers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return borrowers
      .filter((b) => {
        const s = statusFor(b);
        if (filter === "overdue" && s.kind !== "overdue") return false;
        if (filter === "paid" && s.kind !== "paid") return false;
        if (filter === "multa" && !s.hasMulta) return false;
        if (filter === "today") {
          if (s.kind === "paid") return false;
          if (summariseBorrowerDue(b).today === 0) return false;
        }
        if (q && !b.name.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        const sa = statusFor(a);
        const sb = statusFor(b);
        const order = { overdue: 0, active: 1, paid: 2 } as const;
        if (order[sa.kind] !== order[sb.kind]) return order[sa.kind] - order[sb.kind];
        return Number(b.balance) - Number(a.balance);
      });
  }, [borrowers, query, filter]);

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

  if (error) {
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
          {error}
        </div>
      </div>
    );
  }

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
          <div className="small" style={{ marginBottom: 2 }}>Ledger</div>
          <div className="h1">Borrowers</div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            style={{
              width: "100%",
              height: 44,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        {/* Filter chips */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 4,
            marginBottom: 16,
          }}
        >
          <Chip active={filter === "all"} count={counts.all} label="All" onClick={() => setFilter("all")} />
          <Chip active={filter === "overdue"} count={counts.overdue} label="Overdue" onClick={() => setFilter("overdue")} />
          <Chip active={filter === "today"} count={counts.today} label="Due today" onClick={() => setFilter("today")} />
          <Chip active={filter === "multa"} count={counts.multa} label="Multa" onClick={() => setFilter("multa")} />
          <Chip active={filter === "paid"} count={counts.paid} label="Paid" onClick={() => setFilter("paid")} />
        </div>

        {/* List */}
        <div className="card" style={{ overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }} className="small">
              {query.trim() || filter !== "all"
                ? "No borrowers match"
                : "No borrowers yet — tap + to add one"}
            </div>
          ) : (
            filtered.map((b, i) => (
              <BorrowerRow key={b.id} b={b} last={i === filtered.length - 1} />
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        type="button"
        aria-label="Add borrower"
        onClick={() => setAddOpen(true)}
        style={{
          position: "fixed",
          right: 20,
          bottom: "calc(96px + env(safe-area-inset-bottom))",
          width: 56,
          height: 56,
          borderRadius: 999,
          background: "var(--accent)",
          color: "var(--on-accent)",
          border: 0,
          boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
          fontSize: 28,
          lineHeight: 1,
          cursor: "pointer",
          zIndex: 9,
        }}
      >
        +
      </button>

      {addOpen && (
        <AddBorrowerModal
          onClose={() => setAddOpen(false)}
          onCreated={() => {
            setAddOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
