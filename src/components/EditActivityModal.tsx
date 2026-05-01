"use client";

import { useState } from "react";
import { api, ActivityEntry, Borrower } from "@/lib/api";

export function EditActivityModal({
  borrower,
  entry,
  onClose,
  onSaved,
}: {
  borrower: Borrower;
  entry: ActivityEntry;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(entry.amount ?? "");
  const [detail, setDetail] = useState(entry.detail ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const label =
    entry.activity_type === "LATE_INTEREST"
      ? "Late interest"
      : entry.activity_type === "PAYMENT_RECEIVED"
        ? "Bayad"
        : entry.activity_type;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api.editActivity(borrower.id, entry.id, { amount: String(amount), detail });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this entry? Balance will be recalculated.")) return;
    setBusy(true);
    try {
      await api.deleteActivity(borrower.id, entry.id);
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
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
          Edit {label} — <span className="text-muted">{borrower.name}</span>
        </h3>
        {entry.amount !== null && (
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">Amount (₱)</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
              className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-right tabular-nums outline-none focus:border-amber-soft"
            />
          </label>
        )}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted">Note</span>
          <input
            type="text"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none focus:border-amber-soft"
          />
        </label>
        {err && (
          <div className="text-sm text-amber-soft border border-amber/40 rounded-lg px-3 py-2 bg-amber/10">
            {err}
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="text-sm text-amber-soft/70 hover:text-amber-soft disabled:opacity-60"
          >
            Delete entry
          </button>
          <div className="flex gap-2">
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
              className="rounded-lg bg-amber hover:bg-amber-soft text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
