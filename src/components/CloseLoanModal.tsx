"use client";

import { useState } from "react";
import { api, Borrower, formatPHP } from "@/lib/api";

export function CloseLoanModal({
  borrower,
  onClose,
  onAdded,
}: {
  borrower: Borrower;
  onClose: () => void;
  onAdded: () => void;
}) {
  const remaining = Number(borrower.balance);
  const [amount, setAmount] = useState(remaining.toFixed(2));
  const [detail, setDetail] = useState("waived");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api.addActivity(borrower.id, {
        activity_type: "Loan closed",
        detail: detail.trim() || "closed",
        amount,
      });
      onAdded();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-panel-border bg-panel p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold">
          Close loan — <span className="text-blue-soft">{borrower.name}</span>
        </h3>
        <p className="text-xs text-muted">
          Mark the remaining balance as closed/waived. Posts a ledger row so the
          books show why balance went to zero — does not affect THAN nakulha.
        </p>
        <div className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm flex justify-between">
          <span className="text-muted">Remaining balance</span>
          <span className="tabular-nums">{formatPHP(remaining.toFixed(2), 2)}</span>
        </div>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted">Amount to close (₱)</span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
            className="mt-1 w-full rounded-lg border border-blue-soft/40 bg-card px-3 py-2 text-right tabular-nums text-blue-soft outline-none focus:border-blue-soft"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted">Reason (optional)</span>
          <input
            type="text"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="waived / written off / closed"
            className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none focus:border-blue-soft"
          />
        </label>
        {err && (
          <div className="text-sm text-amber-soft border border-amber/40 rounded-lg px-3 py-2 bg-amber/10">
            {err}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-card-border bg-card hover:bg-card-border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-blue-soft/20 hover:bg-blue-soft/30 border border-blue-soft/40 text-blue-soft px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {busy ? "Posting…" : "Close loan"}
          </button>
        </div>
      </form>
    </div>
  );
}
