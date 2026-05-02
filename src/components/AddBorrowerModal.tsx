"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export function AddBorrowerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [principal, setPrincipal] = useState("");
  const [than, setThan] = useState("");
  const [label, setLabel] = useState("");
  const [tenor, setTenor] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const trimmed = label.trim();
      await api.createBorrower({
        name: name.trim(),
        principal,
        ...(than ? { than } : {}),
        ...(trimmed ? { label: trimmed } : {}),
        ...(tenor ? { tenor_days: tenor } : {}),
      });
      onCreated();
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
        className="w-full max-w-md rounded-2xl border border-panel-border bg-panel p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold">Add borrower</h3>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none focus:border-amber-soft"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">Principal / Palod (₱)</span>
            <input
              type="number"
              step="0.01"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              required
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
        <div>
          <span className="text-xs uppercase tracking-wider text-muted">
            Term <span className="normal-case text-muted/60">— kanus-a bayaran? (optional)</span>
          </span>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {([null, 5, 15, 30] as const).map((v) => (
              <button
                type="button"
                key={String(v)}
                onClick={() => setTenor(v)}
                className={`rounded-lg border px-2 py-1.5 text-sm ${
                  tenor === v
                    ? "border-amber-soft bg-amber-soft/10 text-amber-soft"
                    : "border-card-border bg-card text-muted hover:border-amber-soft/50"
                }`}
              >
                {v === null ? "None" : `${v}d`}
              </button>
            ))}
          </div>
        </div>
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
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
