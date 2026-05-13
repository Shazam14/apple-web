"use client";

import { useEffect, useState, useCallback } from "react";
import { api, InventorySummary, InventoryCategory, formatPHP } from "@/lib/api";
import { Panel } from "./Card";

export function PesoInventory({ onSummaryChange }: { onSummaryChange?: () => void }) {
  const [data, setData] = useState<InventorySummary | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [adding, setAdding] = useState<InventoryCategory | null>(null);
  const [showOut, setShowOut] = useState(true);
  const [showThan, setShowThan] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);

  const load = useCallback(async () => {
    try {
      const s = await api.inventorySummary();
      setData(s);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Load failed");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (err) {
    return (
      <Panel title="Peso inventory">
        <div className="text-sm text-amber-soft">{err}</div>
      </Panel>
    );
  }
  if (!data) {
    return (
      <Panel title="Peso inventory">
        <div className="text-sm text-muted">Loading…</div>
      </Panel>
    );
  }

  const reload = () => {
    load();
    onSummaryChange?.();
  };

  const thanExtras = data.entries.filter((e) => e.category === "than_extra");
  const expenses = data.entries.filter((e) => e.category === "expense");

  return (
    <Panel
      title="Peso inventory"
      right={
        <div className="flex gap-2">
          <button
            onClick={() => setAdding("than_extra")}
            className="rounded-lg border border-blue-soft/40 text-blue-soft hover:bg-blue-soft/10 text-xs font-medium px-3 py-1.5"
          >
            + THAN
          </button>
          <button
            onClick={() => setAdding("expense")}
            className="rounded-lg border border-amber-soft/40 text-amber-soft hover:bg-amber-soft/10 text-xs font-medium px-3 py-1.5"
          >
            + expense
          </button>
        </div>
      }
    >
      <div className="rounded-xl border border-card-border bg-card overflow-hidden">
        <Row
          label="CAPITAL"
          value={formatPHP(data.capital)}
          tone="white"
        />
        <RowExpandable
          sign="−"
          label="Capital out (lent)"
          value={formatPHP(data.capital_out_total)}
          tone="amber"
          open={showOut}
          onToggle={() => setShowOut((v) => !v)}
          count={data.capital_out_items.length}
        >
          {data.capital_out_items.length === 0 ? (
            <div className="px-4 py-2 text-xs text-muted italic">
              No active borrowers
            </div>
          ) : (
            data.capital_out_items.map((it) => (
              <div
                key={it.borrower_id}
                className="px-4 py-1.5 flex justify-between text-sm border-t border-card-border/40"
              >
                <span className="text-muted">▸ {it.name}</span>
                <span className="tabular-nums text-amber-soft/90">
                  {formatPHP(it.amount)}
                </span>
              </div>
            ))
          )}
        </RowExpandable>
        <RowExpandable
          sign="+"
          label="THAN (collected)"
          value={formatPHP(data.than_total)}
          tone="blue"
          open={showThan}
          onToggle={() => setShowThan((v) => !v)}
          count={thanExtras.length}
        >
          <div className="px-4 py-1.5 flex justify-between text-sm border-t border-card-border/40">
            <span className="text-muted italic">From borrowers (auto)</span>
            <span className="tabular-nums text-blue-soft/80">
              {formatPHP(data.than_borrower_total)}
            </span>
          </div>
          {thanExtras.map((e) => (
            <EntryRow key={e.id} entry={e} onDeleted={reload} tone="blue" />
          ))}
        </RowExpandable>
        <RowExpandable
          sign="−"
          label="Expenses"
          value={formatPHP(data.expenses_total)}
          tone="amber"
          open={showExpenses}
          onToggle={() => setShowExpenses((v) => !v)}
          count={expenses.length}
        >
          {expenses.length === 0 ? (
            <div className="px-4 py-2 text-xs text-muted italic">
              No expenses yet
            </div>
          ) : (
            expenses.map((e) => (
              <EntryRow key={e.id} entry={e} onDeleted={reload} tone="amber" />
            ))
          )}
        </RowExpandable>
        <div className="px-4 sm:px-5 py-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 bg-bg/40 border-t border-card-border">
          <span className="text-xs text-muted tracking-wider">REMAINING PESO</span>
          <span
            className={`text-2xl sm:text-3xl font-bold tabular-nums break-all ${
              Number(data.remaining) < 0 ? "text-red-400" : "text-green-soft"
            }`}
          >
            {formatPHP(data.remaining)}
          </span>
        </div>
      </div>

      {adding && (
        <AddEntryModal
          category={adding}
          onClose={() => setAdding(null)}
          onAdded={() => {
            setAdding(null);
            reload();
          }}
        />
      )}
    </Panel>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "white" | "amber" | "blue" | "green";
}) {
  const t =
    tone === "amber"
      ? "text-amber-soft"
      : tone === "blue"
        ? "text-blue-soft"
        : tone === "green"
          ? "text-green-soft"
          : "text-white";
  return (
    <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
      <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
      <span className={`text-lg font-semibold tabular-nums ${t}`}>{value}</span>
    </div>
  );
}

function RowExpandable({
  sign,
  label,
  value,
  tone,
  open,
  onToggle,
  count,
  children,
}: {
  sign: "+" | "−";
  label: string;
  value: string;
  tone: "amber" | "blue";
  open: boolean;
  onToggle: () => void;
  count: number;
  children: React.ReactNode;
}) {
  const valueTone = tone === "amber" ? "text-amber-soft" : "text-blue-soft";
  return (
    <div className="border-t border-card-border">
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-5 py-2.5 flex items-center justify-between hover:bg-card-border/30 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm">
          <span className="text-muted w-4 text-center">{open ? "▼" : "▶"}</span>
          <span className="text-muted text-base font-semibold w-3">{sign}</span>
          <span>{label}</span>
          {count > 0 && (
            <span className="text-[10px] text-muted border border-card-border rounded px-1">
              {count}
            </span>
          )}
        </span>
        <span className={`text-base font-semibold tabular-nums ${valueTone}`}>
          {value}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  onDeleted,
  tone,
}: {
  entry: { id: number; description: string; amount: string; created_at: string };
  onDeleted: () => void;
  tone: "amber" | "blue";
}) {
  const [busy, setBusy] = useState(false);
  const t = tone === "amber" ? "text-amber-soft/90" : "text-blue-soft/90";

  async function remove() {
    if (!confirm(`Delete "${entry.description}" — ${formatPHP(entry.amount)}?`)) return;
    setBusy(true);
    try {
      await api.deleteInventoryEntry(entry.id);
      onDeleted();
    } catch (e) {
      alert(`Failed: ${e instanceof Error ? e.message : String(e)}`);
      setBusy(false);
    }
  }

  return (
    <div className="px-4 py-1.5 flex justify-between items-center text-sm border-t border-card-border/40">
      <span className="text-muted truncate">▸ {entry.description}</span>
      <span className="flex items-center gap-2">
        <span className={`tabular-nums ${t}`}>{formatPHP(entry.amount)}</span>
        <button
          onClick={remove}
          disabled={busy}
          className="text-muted hover:text-red-400 text-xs px-1 disabled:opacity-50"
          title="Delete"
        >
          🗑
        </button>
      </span>
    </div>
  );
}

function AddEntryModal({
  category,
  onClose,
  onAdded,
}: {
  category: InventoryCategory;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isExpense = category === "expense";
  const titleLabel = isExpense ? "expense" : "THAN entry";
  const inputCls = isExpense
    ? "border-amber-soft/40 text-amber-soft focus:border-amber-soft"
    : "border-blue-soft/40 text-blue-soft focus:border-blue-soft";
  const descFocusCls = isExpense
    ? "focus:border-amber-soft"
    : "focus:border-blue-soft";
  const btnCls = isExpense
    ? "bg-amber-soft/20 hover:bg-amber-soft/30 border-amber-soft/40 text-amber-soft"
    : "bg-blue-soft/20 hover:bg-blue-soft/30 border-blue-soft/40 text-blue-soft";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api.addInventoryEntry({
        category,
        description: description.trim() || (isExpense ? "expense" : "THAN"),
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
        <h3 className="text-lg font-semibold capitalize">Add {titleLabel}</h3>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted">
            Description
          </span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoFocus
            placeholder={isExpense ? "bayad gin / rent / etc." : "lottery / refund / etc."}
            className={`mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none ${descFocusCls}`}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted">Amount (₱)</span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className={`mt-1 w-full rounded-lg border bg-card px-3 py-2 text-right tabular-nums outline-none ${inputCls}`}
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
            className={`rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-60 ${btnCls}`}
          >
            {busy ? "Saving…" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
