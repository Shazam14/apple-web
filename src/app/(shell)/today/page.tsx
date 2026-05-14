"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, Borrower, SettingsSummary, formatPHP } from "@/lib/api";
import { BayadSheet } from "@/components/shell/BayadSheet";

const BAYAD_ACTIVITY_TYPES = new Set([
  "Payment received",
  "Partial payment",
  "PAYMENT_RECEIVED",
]);

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

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayHeader(): { weekday: string; greeting: string } {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const h = now.getHours();
  const greeting = h < 11 ? "Good morning" : h < 18 ? "Today" : "Good evening";
  return { weekday, greeting };
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

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="small" style={{ marginBottom: 4 }}>{label}</div>
      <div className="money-lg" style={{ marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

function QuickTile({
  emoji,
  label,
  tone,
  href,
}: {
  emoji: string;
  label: string;
  tone: "success" | "accent" | "warning";
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card"
      style={{
        padding: "14px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        textDecoration: "none",
        color: "var(--text)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: `var(--${tone}-soft)`,
          color: `var(--${tone})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {emoji}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
    </Link>
  );
}

function CollectRow({
  b,
  last,
  onBayad,
}: {
  b: Borrower;
  last: boolean;
  onBayad: (b: Borrower) => void;
}) {
  const balance = Number(b.balance);
  const thanActual = Number(b.than_actual);
  const isOverdue = b.status === "overdue";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderBottom: last ? 0 : "1px solid var(--border)",
        color: "var(--text)",
      }}
    >
      <Link
        href={`/borrowers/${b.id}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1,
          minWidth: 0,
          textDecoration: "none",
          color: "var(--text)",
        }}
      >
        <Avatar b={b} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {b.name}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className={`pill pill-${isOverdue ? "danger" : "warning"}`}>
              {isOverdue ? "overdue" : "active"}
            </span>
            {thanActual > 0 && (
              <span className="money-sm" style={{ color: "var(--text-3)" }}>
                {formatPHP(thanActual)} accrued
              </span>
            )}
          </div>
        </div>
      </Link>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        <span className="money" style={{ fontSize: 13, fontWeight: 600 }}>
          {formatPHP(balance)}
        </span>
        <button
          type="button"
          className="btn btn-success-soft btn-xs"
          style={{ padding: "0 12px", height: 26 }}
          onClick={() => onBayad(b)}
        >
          + Bayad
        </button>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const [summary, setSummary] = useState<SettingsSummary | null>(null);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bayadFor, setBayadFor] = useState<Borrower | null>(null);

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
    load();
  }, [load]);

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

  if (error || !summary) {
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

  const { weekday, greeting } = todayHeader();
  const expectedToday = Number(summary.than_day);
  const iso = todayISO();
  const collectedToday = borrowers.reduce((sum, b) => {
    return (
      sum +
      b.activity
        .filter((a) => BAYAD_ACTIVITY_TYPES.has(a.activity_type) && a.created_at.startsWith(iso))
        .reduce((s, a) => s + Number(a.amount || 0), 0)
    );
  }, 0);
  const progressPct =
    expectedToday > 0 ? Math.min(100, (collectedToday / expectedToday) * 100) : 0;

  const collectionList = borrowers
    .filter((b) => b.status === "active" || b.status === "overdue")
    .sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (b.status === "overdue" && a.status !== "overdue") return 1;
      return Number(b.than_actual) - Number(a.than_actual);
    });

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
          <div className="small" style={{ marginBottom: 2 }}>{weekday}</div>
          <div className="h1">{greeting}</div>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>To collect today</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
              <span className="money-hero accent">{formatPHP(expectedToday)}</span>
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span className="small">Collected today</span>
              <span className="money-sm pos">{formatPHP(collectedToday)}</span>
            </div>
            <div className="bar">
              <span style={{ width: `${progressPct}%`, background: "var(--success)" }} />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <QuickTile emoji="↙" label="Bayad" tone="success" href="/borrowers" />
          <QuickTile emoji="↗" label="Palod" tone="accent" href="/borrowers" />
          <QuickTile emoji="!" label="Multa" tone="warning" href="/borrowers" />
        </div>

        {/* Collection round */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <div className="eyebrow">Collection round</div>
          <span className="small">
            {collectionList.length} {collectionList.length === 1 ? "borrower" : "borrowers"}
          </span>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            {collectionList.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center" }} className="small">
                No active borrowers
              </div>
            ) : (
              collectionList.map((b, i) => (
                <CollectRow
                  key={b.id}
                  b={b}
                  last={i === collectionList.length - 1}
                  onBayad={setBayadFor}
                />
              ))
            )}
          </div>
        </div>

        {/* Snapshot */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Snapshot</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <MiniStat
            label="Cash on hand"
            value={formatPHP(summary.cash_on_hand)}
            sub="idle"
          />
          <MiniStat
            label="Than today"
            value={formatPHP(summary.than_day)}
            sub={`${summary.active_count} active`}
          />
          <MiniStat
            label="Collected"
            value={formatPHP(summary.sum_than_nakulha)}
            sub="this cycle"
          />
          <MiniStat
            label="Deployed"
            value={formatPHP(summary.lent_out)}
            sub={`${summary.total_borrowers} borrowers`}
          />
        </div>
      </div>

      {bayadFor && (
        <BayadSheet
          borrower={bayadFor}
          onClose={() => setBayadFor(null)}
          onAdded={() => {
            load();
          }}
        />
      )}
    </div>
  );
}
