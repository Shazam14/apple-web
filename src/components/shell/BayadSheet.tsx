"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api, Borrower, formatPHP } from "@/lib/api";

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

function Recline({
  label,
  value,
  bold,
  tone,
}: {
  label: string;
  value: number;
  bold?: boolean;
  tone?: "muted" | "neg" | "pos";
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span className="small" style={{ color: bold ? "var(--text)" : undefined, fontWeight: bold ? 600 : undefined }}>
        {label}
      </span>
      <span
        className={`money-sm ${tone === "neg" ? "neg" : tone === "pos" ? "pos" : ""}`}
        style={{ fontWeight: bold ? 700 : 500, fontSize: bold ? 15 : 13 }}
      >
        {formatPHP(value)}
      </span>
    </div>
  );
}

export function BayadSheet({
  borrower,
  onClose,
  onAdded,
}: {
  borrower: Borrower;
  onClose: () => void;
  onAdded: () => void;
}) {
  const balance = Number(borrower.balance);
  const thanActual = Number(borrower.than_actual);

  const suggestedRaw = useMemo(() => {
    if (thanActual > 0) return thanActual;
    return Math.min(balance, 1000);
  }, [thanActual, balance]);

  const [amount, setAmount] = useState<string>(suggestedRaw > 0 ? String(Math.round(suggestedRaw)) : "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { color, initials } = avatarFor(borrower);
  const parsedAmount = Number(amount) || 0;
  const newBalance = Math.max(0, balance - parsedAmount);

  const presets: { label: string; value: number; accent?: boolean }[] = [
    { label: "₱1,000", value: 1000 },
    { label: "₱2,000", value: 2000 },
    ...(thanActual > 0
      ? [{ label: `${formatPHP(thanActual)} (than)`, value: Math.round(thanActual), accent: true }]
      : []),
    { label: "₱5,000", value: 5000 },
    { label: "Full balance", value: Math.round(balance) },
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parsedAmount <= 0) {
      setErr("Enter a bayad amount");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await api.addActivity(borrower.id, {
        activity_type: "Payment received",
        detail: note.trim() || "bayad",
        amount,
      });
      onAdded();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="kfx">
      <div
        className="sheet-backdrop"
        onClick={onClose}
        role="presentation"
      >
        <form
          className="sheet"
          onClick={(e) => e.stopPropagation()}
          onSubmit={submit}
          role="dialog"
          aria-modal="true"
          aria-label={`Record bayad for ${borrower.name}`}
        >
          <div className="sheet-handle" />

          {/* Borrower header */}
          <div style={{ padding: "0 20px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <div
              className="avatar"
              style={{ background: color, width: 40, height: 40, fontSize: 14 }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="h3" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {borrower.name}
              </div>
              <div className="small">
                Balance: {formatPHP(balance)}
                {thanActual > 0 && <> · {formatPHP(thanActual)}/day</>}
              </div>
            </div>
          </div>
          <div className="divider" />

          <div style={{ padding: "20px 20px 0" }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>+ Bayad</div>

            {/* Amount input */}
            <label
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                padding: "14px 16px",
                background: "var(--surface-sunk)",
                borderRadius: 14,
                marginBottom: 12,
                cursor: "text",
              }}
            >
              <span className="money-hero" style={{ fontSize: 36 }}>₱</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="0"
                autoFocus
                className="money-hero"
                style={{
                  fontSize: 36,
                  flex: 1,
                  background: "transparent",
                  border: 0,
                  outline: "none",
                  color: "var(--text)",
                  width: "100%",
                  minWidth: 0,
                }}
              />
            </label>

            {/* Preset chips */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className={`chip ${p.accent ? "chip-accent" : ""}`}
                  onClick={() => setAmount(String(p.value))}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Note */}
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional) — cash / gcash / partial"
              className="input"
              style={{ width: "100%", marginBottom: 14 }}
            />

            {/* Breakdown */}
            <div
              style={{
                padding: 14,
                background: "var(--surface-sunk)",
                borderRadius: 14,
                marginBottom: 16,
              }}
            >
              <Recline label="Than charged" value={thanActual} tone="muted" />
              <div style={{ height: 8 }} />
              <Recline label="− Bayad" value={-parsedAmount} tone="neg" />
              <hr className="divider" style={{ margin: "10px 0" }} />
              <Recline label="New balance" value={newBalance} bold />
            </div>

            {err && (
              <div
                className="card"
                style={{
                  padding: "10px 14px",
                  marginBottom: 12,
                  borderColor: "var(--danger)",
                  background: "var(--danger-soft)",
                  color: "var(--danger)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {err}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={onClose}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                style={{ flex: 2 }}
                disabled={busy}
              >
                {busy ? "Posting…" : "Record bayad"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
