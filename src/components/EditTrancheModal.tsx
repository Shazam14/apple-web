"use client";

import { useState } from "react";
import { api, Borrower, Tranche } from "@/lib/api";

export function EditTrancheModal({
  borrower,
  tranche,
  trancheIndex,
  onClose,
  onSaved,
}: {
  borrower: Borrower;
  tranche: Tranche;
  trancheIndex: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [principal, setPrincipal] = useState(tranche.principal);
  const [than, setThan] = useState(tranche.than);
  const [label, setLabel] = useState(tranche.label ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api.patchTranche(borrower.id, tranche.id, { principal, than, label: label.trim() });
      onSaved();
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
          Edit release #{trancheIndex} — <span className="text-amber-soft">{borrower.name}</span>
        </h3>

        <div className="flex items-start gap-2 rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-xs text-amber-soft/90">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>
            Changing PALOD or THAN here directly adjusts the borrower&apos;s running balance.
            If the upfront THAN was calculated from the original amount, update it manually to keep totals accurate.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">Palod (₱)</span>
            <input
              type="number"
              step="0.01"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              required
              autoFocus
              className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-right tabular-nums outline-none focus:border-amber-soft"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">THAN upfront (₱)</span>
            <input
              type="number"
              step="0.01"
              value={than}
              onChange={(e) => setThan(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-lg border border-blue-soft/30 bg-card px-3 py-2 text-right tabular-nums outline-none focus:border-blue-soft text-blue-soft"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted">
            Label <span className="normal-case text-muted/60">— para sa unsa? (optional)</span>
          </span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={120}
            placeholder="e.g. sari-sari, tricycle, school fee"
            className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none focus:border-amber-soft"
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
            className="rounded-lg bg-amber hover:bg-amber-soft text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
