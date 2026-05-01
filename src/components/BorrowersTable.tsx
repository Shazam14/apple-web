"use client";

import { useState } from "react";
import { Borrower, Tranche, ActivityEntry, BorrowerStatus, api, formatPHP } from "@/lib/api";
import { Panel } from "./Card";
import { AddBorrowerModal } from "./AddBorrowerModal";
import { AddTrancheModal } from "./AddTrancheModal";
import { LatepayModal } from "./LatepayModal";

export function BorrowersTable({
  borrowers,
  onChange,
}: {
  borrowers: Borrower[];
  onChange: () => void;
}) {
  const [adding, setAdding] = useState(false);

  const totalLent = borrowers.reduce((a, b) => a + Number(b.principal), 0);
  const totalActual = borrowers.reduce((a, b) => a + Number(b.than_actual), 0);
  const totalUnreal = borrowers.reduce((a, b) => a + Number(b.than_unrealised), 0);
  const totalNakulha = borrowers.reduce((a, b) => a + Number(b.than_nakulha), 0);

  return (
    <Panel
      title="Borrowers"
      right={
        <button
          onClick={() => setAdding(true)}
          className="rounded-lg border border-card-border bg-card hover:bg-card-border text-sm font-medium px-3 py-1.5"
        >
          + Add borrower
        </button>
      }
    >
      {borrowers.length === 0 ? (
        <div className="text-center py-8 text-muted text-sm">
          No borrowers yet — click + Add borrower to start
        </div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted">
                  <Th className="w-[200px] text-left">Borrower</Th>
                  <Th className="w-[140px] text-right">Principal</Th>
                  <Th className="w-[120px] text-left">Status</Th>
                  <Th className="text-right">
                    <Pill tone="blue">THAN actual</Pill>
                  </Th>
                  <Th className="text-right">
                    <Pill tone="amber">Unrealised</Pill>
                  </Th>
                  <Th className="text-right">
                    <Pill tone="green">Nakulha</Pill>{" "}
                    <span className="text-muted normal-case">(manual)</span>
                  </Th>
                  <Th className="w-[140px] text-right">Balance</Th>
                  <Th className="w-[100px]">{null}</Th>
                </tr>
              </thead>
              <tbody>
                {borrowers.map((b) => (
                  <BorrowerRow key={b.id} b={b} onChange={onChange} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden space-y-3">
            {borrowers.map((b) => (
              <BorrowerCard key={b.id} b={b} onChange={onChange} />
            ))}
          </div>
        </>
      )}

      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Summary label="Total lent" value={formatPHP(totalLent)} tone="amber" />
        <Summary label="THAN actual" value={formatPHP(totalActual)} tone="blue" />
        <Summary label="Unrealised" value={formatPHP(totalUnreal)} tone="amber" />
        <Summary label="Nakulha" value={formatPHP(totalNakulha)} tone="green" />
      </div>

      {adding && (
        <AddBorrowerModal
          onClose={() => setAdding(false)}
          onCreated={() => {
            setAdding(false);
            onChange();
          }}
        />
      )}
    </Panel>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`font-medium px-2 pb-2.5 ${className}`}>{children}</th>;
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "blue" | "amber" | "green";
}) {
  const cls =
    tone === "blue"
      ? "border-blue-soft/40 text-blue-soft bg-blue-soft/10"
      : tone === "amber"
        ? "border-amber-soft/40 text-amber-soft bg-amber-soft/10"
        : "border-green-soft/40 text-green-soft bg-green-soft/10";
  return (
    <span
      className={`inline-block border rounded-md px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {children}
    </span>
  );
}

function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "amber" | "blue" | "green";
}) {
  const t =
    tone === "amber"
      ? "text-amber-soft"
      : tone === "blue"
        ? "text-blue-soft"
        : "text-green-soft";
  return (
    <div className="rounded-xl border border-card-border bg-card px-4 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-lg font-semibold tabular-nums ${t}`}>{value}</div>
    </div>
  );
}

function trancheDays(t: Tranche): number {
  const released = new Date(t.released_at);
  const today = new Date();
  const diff = Math.floor((today.getTime() - released.getTime()) / 86400000);
  return Math.max(1, diff + 1);
}

type LedgerRow =
  | { kind: "palod"; id: number; amount: string; date: string; trancheIndex: number }
  | { kind: "than"; id: number; amount: string; detail: string; date: string }
  | { kind: "bayad"; id: number; amount: string; detail: string; date: string }
  | { kind: "note"; id: number; detail: string; date: string };

function buildLedger(tranches: Tranche[], activity: ActivityEntry[]): LedgerRow[] {
  const rows: LedgerRow[] = tranches.map((t, i) => ({
    kind: "palod",
    id: t.id,
    amount: t.principal,
    date: t.released_at,
    trancheIndex: i + 1,
  }));
  for (const a of activity) {
    if (a.activity_type === "Late interest" && a.amount) {
      rows.push({ kind: "than", id: a.id, amount: a.amount, detail: a.detail ?? "", date: a.created_at });
    } else if (
      (a.activity_type === "Payment received" || a.activity_type === "Partial payment") &&
      a.amount
    ) {
      rows.push({ kind: "bayad", id: a.id, amount: a.amount, detail: a.detail ?? "", date: a.created_at });
    } else if (a.activity_type === "Missed collection") {
      rows.push({ kind: "note", id: a.id, detail: a.detail ?? "Missed collection", date: a.created_at });
    }
  }
  return rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function LedgerSubrow({ tranches, activity, colSpan }: { tranches: Tranche[]; activity: ActivityEntry[]; colSpan: number }) {
  const rows = buildLedger(tranches, activity);
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 pb-3 pt-0">
        <div className="rounded-lg border border-card-border bg-card/40 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted border-b border-card-border">
                <th className="text-left px-3 py-1.5 font-medium">Date</th>
                <th className="text-left px-3 py-1.5 font-medium">Type</th>
                <th className="text-right px-3 py-1.5 font-medium text-amber-soft/80">PALOD</th>
                <th className="text-right px-3 py-1.5 font-medium text-blue-soft/80">THAN</th>
                <th className="text-right px-3 py-1.5 font-medium text-green-soft/80">BAYAD</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.kind}-${r.id}`} className="border-t border-card-border/50">
                  <td className="px-3 py-1.5 text-muted">
                    {new Date(r.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  {r.kind === "palod" && (
                    <>
                      <td className="px-3 py-1.5 text-muted">palod #{r.trancheIndex}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-amber-soft">{formatPHP(r.amount)}</td>
                      <td className="px-3 py-1.5" />
                      <td className="px-3 py-1.5" />
                    </>
                  )}
                  {r.kind === "than" && (
                    <>
                      <td className="px-3 py-1.5 text-muted">{r.detail}</td>
                      <td className="px-3 py-1.5" />
                      <td className="px-3 py-1.5 text-right tabular-nums text-blue-soft">{formatPHP(r.amount)}</td>
                      <td className="px-3 py-1.5" />
                    </>
                  )}
                  {r.kind === "bayad" && (
                    <>
                      <td className="px-3 py-1.5 text-muted">{r.detail}</td>
                      <td className="px-3 py-1.5" />
                      <td className="px-3 py-1.5" />
                      <td className="px-3 py-1.5 text-right tabular-nums text-green-soft">{formatPHP(r.amount)}</td>
                    </>
                  )}
                  {r.kind === "note" && (
                    <>
                      <td className="px-3 py-1.5 text-amber-soft/80" colSpan={3}>{r.detail}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

function ThanCell({
  b,
  onCommit,
}: {
  b: Borrower;
  onCommit: (patch: Parameters<typeof api.patchBorrower>[1]) => void;
}) {
  const [val, setVal] = useState(b.than_override ?? "");
  const isOverridden = b.than_override !== null && b.than_override !== undefined;

  function save() {
    const trimmed = val.toString().trim();
    if (trimmed === "" || trimmed === b.than_computed) {
      // clear override — fall back to computed
      if (isOverridden) onCommit({ than_override: null });
    } else if (trimmed !== (b.than_override ?? "").toString()) {
      onCommit({ than_override: trimmed });
    }
  }

  const cell = "rounded-lg border bg-card px-2 py-1 outline-none text-right tabular-nums w-full";

  return (
    <td className="px-2 py-2">
      <input
        type="number"
        step="0.01"
        value={val}
        placeholder={b.than_computed}
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
        className={`${cell} ${isOverridden ? "border-blue-soft/60 text-blue-soft" : "border-card-border text-blue-soft"} focus:border-blue-soft`}
      />
      {isOverridden && (
        <div className="text-[10px] text-muted text-right mt-0.5">
          auto {formatPHP(b.than_computed)}
        </div>
      )}
    </td>
  );
}

function BorrowerRow({ b, onChange }: { b: Borrower; onChange: () => void }) {
  const [name, setName] = useState(b.name);
  const [nakulha, setNakulha] = useState(b.than_nakulha);
  const [status, setStatus] = useState<BorrowerStatus>(b.status);
  const [pending, setPending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [addingTranche, setAddingTranche] = useState(false);
  const [addingLatepay, setAddingLatepay] = useState(false);

  const dirtyName = name !== b.name;
  const dirtyNakulha = nakulha !== b.than_nakulha;

  async function commit(patch: Parameters<typeof api.patchBorrower>[1]) {
    setPending(true);
    try {
      await api.patchBorrower(b.id, patch);
      onChange();
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!confirm(`Remove ${b.name}? This deletes all activity history.`)) return;
    setPending(true);
    try {
      await api.deleteBorrower(b.id);
      onChange();
    } finally {
      setPending(false);
    }
  }

  const cell = "rounded-lg border border-card-border bg-card px-2 py-1.5 outline-none focus:border-amber-soft";
  const multiTranche = b.tranches.length > 1;

  return (
    <>
      <tr className="border-t border-panel-border">
        <td className="px-2 py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-muted hover:text-white text-xs w-5 shrink-0 text-center"
              title={expanded ? "Hide tranches" : "Show tranches"}
            >
              {expanded ? "▼" : "▶"}
            </button>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => dirtyName && commit({ name })}
              className={`${cell} flex-1 min-w-0`}
            />
            {multiTranche && (
              <span className="text-[10px] text-amber-soft border border-amber-soft/30 rounded px-1 shrink-0">
                ×{b.tranches.length}
              </span>
            )}
          </div>
        </td>
        <td className="px-2 py-2 text-right tabular-nums font-medium">
          {formatPHP(b.principal)}
        </td>
        <td className="px-2 py-2">
          <select
            value={status}
            onChange={(e) => {
              const next = e.target.value as BorrowerStatus;
              setStatus(next);
              commit({ status: next });
            }}
            className={`${cell} w-full capitalize ${
              status === "overdue"
                ? "text-amber-soft"
                : status === "paid"
                  ? "text-green-soft"
                  : "text-white"
            }`}
          >
            <option value="active">Active</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </td>
        <ThanCell b={b} onCommit={commit} />
        <td className="px-2 py-2 text-right text-amber-soft tabular-nums">
          {formatPHP(b.than_unrealised)}
        </td>
        <td className="px-2 py-2">
          <input
            type="number"
            step="0.01"
            value={nakulha}
            onChange={(e) => setNakulha(e.target.value)}
            onBlur={() => dirtyNakulha && commit({ than_nakulha: nakulha })}
            className={`${cell} w-full text-right tabular-nums border-green-soft/40 focus:border-green-soft`}
          />
        </td>
        <td className="px-2 py-2 text-right tabular-nums">{formatPHP(b.balance)}</td>
        <td className="px-2 py-2 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setAddingTranche(true)}
              disabled={pending}
              className="text-xs text-amber-soft hover:text-white border border-amber-soft/30 hover:border-amber-soft/60 rounded px-1.5 py-0.5 disabled:opacity-60"
            >
              + release
            </button>
            <button
              onClick={() => setAddingLatepay(true)}
              disabled={pending}
              className="text-xs text-blue-soft hover:text-white border border-blue-soft/30 hover:border-blue-soft/60 rounded px-1.5 py-0.5 disabled:opacity-60"
            >
              + latepay
            </button>
            <button
              onClick={remove}
              disabled={pending}
              className="text-xs text-muted hover:text-amber-soft disabled:opacity-60"
            >
              remove
            </button>
          </div>
        </td>
      </tr>
      {expanded && <LedgerSubrow tranches={b.tranches} activity={b.activity} colSpan={8} />}
      {addingTranche && (
        <AddTrancheModal
          borrower={b}
          onClose={() => setAddingTranche(false)}
          onAdded={() => {
            setAddingTranche(false);
            onChange();
          }}
        />
      )}
      {addingLatepay && (
        <LatepayModal
          borrower={b}
          onClose={() => setAddingLatepay(false)}
          onAdded={() => {
            setAddingLatepay(false);
            onChange();
          }}
        />
      )}
    </>
  );
}

function ThanCardField({
  b,
  onCommit,
}: {
  b: Borrower;
  onCommit: (patch: Parameters<typeof api.patchBorrower>[1]) => void;
}) {
  const [val, setVal] = useState(b.than_override ?? "");
  const isOverridden = b.than_override !== null && b.than_override !== undefined;
  const cell = "rounded-lg border bg-bg px-2.5 py-1.5 outline-none text-right tabular-nums w-full";

  function save() {
    const trimmed = val.toString().trim();
    if (trimmed === "" || trimmed === b.than_computed) {
      if (isOverridden) onCommit({ than_override: null });
    } else if (trimmed !== (b.than_override ?? "").toString()) {
      onCommit({ than_override: trimmed });
    }
  }

  return (
    <div>
      <input
        type="number"
        step="0.01"
        value={val}
        placeholder={b.than_computed}
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
        className={`${cell} ${isOverridden ? "border-blue-soft/60 text-blue-soft" : "border-card-border text-blue-soft"} focus:border-blue-soft`}
      />
      <div className="text-[10px] text-muted text-right mt-0.5">
        auto {formatPHP(b.than_computed)}
      </div>
    </div>
  );
}

function BorrowerCard({ b, onChange }: { b: Borrower; onChange: () => void }) {
  const [name, setName] = useState(b.name);
  const [nakulha, setNakulha] = useState(b.than_nakulha);
  const [status, setStatus] = useState<BorrowerStatus>(b.status);
  const [pending, setPending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [addingTranche, setAddingTranche] = useState(false);

  async function commit(patch: Parameters<typeof api.patchBorrower>[1]) {
    setPending(true);
    try {
      await api.patchBorrower(b.id, patch);
      onChange();
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!confirm(`Remove ${b.name}? This deletes all activity history.`)) return;
    setPending(true);
    try {
      await api.deleteBorrower(b.id);
      onChange();
    } finally {
      setPending(false);
    }
  }

  const cell =
    "rounded-lg border border-card-border bg-bg px-2.5 py-1.5 outline-none focus:border-amber-soft";

  return (
    <div className="rounded-xl border border-card-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name !== b.name && commit({ name })}
          className={`${cell} flex-1 font-medium`}
        />
        <select
          value={status}
          onChange={(e) => {
            const next = e.target.value as BorrowerStatus;
            setStatus(next);
            commit({ status: next });
          }}
          className={`${cell} capitalize ${
            status === "overdue"
              ? "text-amber-soft"
              : status === "paid"
                ? "text-green-soft"
                : "text-white"
          }`}
        >
          <option value="active">Active</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Total Principal">
          <div className="mt-1 rounded-lg border border-card-border bg-bg px-2.5 py-1.5 text-right tabular-nums font-medium">
            {formatPHP(b.principal)}
          </div>
        </Field>
        <Field label={`Tranches (${b.tranches.length})`}>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 w-full rounded-lg border border-card-border bg-bg px-2.5 py-1.5 text-sm text-amber-soft text-left"
          >
            {expanded ? "▼ Hide" : "▶ View"}
          </button>
        </Field>
      </div>

      {expanded && (
        <div className="rounded-lg border border-card-border bg-card/40 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted border-b border-card-border">
                <th className="text-left px-3 py-1.5 font-medium">#</th>
                <th className="text-right px-3 py-1.5 font-medium">Amount</th>
                <th className="text-left px-3 py-1.5 font-medium">Released</th>
                <th className="text-center px-3 py-1.5 font-medium">Days</th>
              </tr>
            </thead>
            <tbody>
              {b.tranches.map((t, i) => (
                <tr key={t.id} className="border-t border-card-border/50">
                  <td className="px-3 py-1.5 text-muted">#{i + 1}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{formatPHP(t.principal)}</td>
                  <td className="px-3 py-1.5 text-muted">
                    {new Date(t.released_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-1.5 text-center tabular-nums">{trancheDays(t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Field label="THAN charged (override)">
        <ThanCardField b={b} onCommit={commit} />
      </Field>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <Stat label="Unrealised" value={formatPHP(b.than_unrealised)} tone="amber" />
        <Stat label="Balance" value={formatPHP(b.balance)} />
        <Stat label="Nakulha" value={formatPHP(b.than_nakulha)} />
      </div>

      <Field label="Nakulha (manual)">
        <input
          type="number"
          step="0.01"
          value={nakulha}
          onChange={(e) => setNakulha(e.target.value)}
          onBlur={() => nakulha !== b.than_nakulha && commit({ than_nakulha: nakulha })}
          className={`${cell} w-full text-right tabular-nums border-green-soft/40 focus:border-green-soft`}
        />
      </Field>

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setAddingTranche(true)}
          disabled={pending}
          className="text-xs text-amber-soft hover:text-white border border-amber-soft/30 hover:border-amber-soft/60 rounded px-2 py-1 disabled:opacity-60"
        >
          + Add release
        </button>
        <button
          onClick={remove}
          disabled={pending}
          className="text-xs text-muted hover:text-amber-soft disabled:opacity-60"
        >
          remove borrower
        </button>
      </div>

      {addingTranche && (
        <AddTrancheModal
          borrower={b}
          onClose={() => setAddingTranche(false)}
          onAdded={() => {
            setAddingTranche(false);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "blue" | "amber";
}) {
  const t =
    tone === "blue" ? "text-blue-soft" : tone === "amber" ? "text-amber-soft" : "text-white";
  return (
    <div className="rounded-lg border border-card-border bg-bg/40 px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className={`text-sm font-semibold tabular-nums ${t}`}>{value}</div>
    </div>
  );
}
