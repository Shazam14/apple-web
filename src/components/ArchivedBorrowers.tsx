"use client";

import { useEffect, useState, useCallback } from "react";
import { api, Borrower, formatPHP } from "@/lib/api";
import { Panel } from "./Card";

export function ArchivedBorrowers({ onChange }: { onChange?: () => void }) {
  const [items, setItems] = useState<Borrower[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.listArchivedBorrowers();
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const count = items.length;

  return (
    <Panel
      title={`🗂 Archived (${count})`}
      right={
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs text-muted hover:text-white"
        >
          {open ? "▲ itago" : "▼ ipakita"}
        </button>
      }
    >
      {!open ? (
        <div className="text-xs text-muted">
          {count === 0
            ? "Wala pay archive."
            : `${count} archived borrower${count === 1 ? "" : "s"} — click ▼ ipakita para makita.`}
        </div>
      ) : loading ? (
        <div className="text-xs text-muted">Loading…</div>
      ) : count === 0 ? (
        <div className="text-xs text-muted">Wala pay archive.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((b) => (
            <ArchivedCard key={b.id} b={b} onRestored={() => { load(); onChange?.(); }} />
          ))}
        </div>
      )}
    </Panel>
  );
}

function ArchivedCard({
  b,
  onRestored,
}: {
  b: Borrower;
  onRestored: () => void;
}) {
  const [restoring, setRestoring] = useState(false);
  const [busy, setBusy] = useState(false);

  async function restore() {
    setRestoring(true);
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 280));
      await api.unarchiveBorrower(b.id);
      onRestored();
    } catch {
      setRestoring(false);
      setBusy(false);
    }
  }

  async function nuke() {
    if (
      !confirm(
        `Permanente nga delete si ${b.name}?\n\nDili na pwede balikon. All tranches + activity history ma-wagtang.`,
      )
    )
      return;
    setBusy(true);
    try {
      await api.deleteBorrower(b.id);
      onRestored();
    } finally {
      setBusy(false);
    }
  }

  const totalThan = b.tranches.reduce((s, t) => s + Number(t.than), 0);
  const archivedDate = b.archived_at
    ? new Date(b.archived_at).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      className={`rounded-xl border border-card-border bg-bg/40 p-3 space-y-2 transition-all duration-300 ${
        restoring ? "opacity-0 scale-95 translate-x-6" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium truncate">{b.name}</div>
          <div className="text-[10px] text-muted">Archived {archivedDate}</div>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5 border whitespace-nowrap ${
            b.status === "paid"
              ? "border-green-soft/40 text-green-soft"
              : b.status === "overdue"
                ? "border-amber-soft/40 text-amber-soft"
                : "border-card-border text-muted"
          }`}
        >
          {b.status}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
        <Mini label="Principal" value={formatPHP(b.principal)} />
        <Mini label="THAN" value={formatPHP(totalThan)} tone="blue" />
        <Mini label="Balance" value={formatPHP(b.balance)} tone="amber" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={restore}
          disabled={busy}
          className="text-xs text-green-soft hover:text-white border border-green-soft/30 hover:border-green-soft/60 rounded px-2 py-0.5 disabled:opacity-60"
        >
          ↩ restore
        </button>
        <button
          onClick={nuke}
          disabled={busy}
          title="Permanente nga delete"
          className="text-[10px] text-muted hover:text-red-400 disabled:opacity-60"
        >
          🗑 permanently delete
        </button>
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "blue" | "amber";
}) {
  const t =
    tone === "blue"
      ? "text-blue-soft"
      : tone === "amber"
        ? "text-amber-soft"
        : "text-white";
  return (
    <div className="rounded border border-card-border bg-card/60 px-1.5 py-1">
      <div className="text-[9px] uppercase tracking-wider text-muted">{label}</div>
      <div className={`tabular-nums ${t}`}>{value}</div>
    </div>
  );
}
