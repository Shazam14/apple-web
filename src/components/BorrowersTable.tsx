"use client";

import { useState } from "react";
import { Borrower, BorrowerStatus, api, formatPHP } from "@/lib/api";
import { Panel } from "./Card";
import { AddBorrowerModal } from "./AddBorrowerModal";

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
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted">
                  <Th className="w-[180px] text-left">Borrower</Th>
                  <Th className="w-[140px] text-right">Principal</Th>
                  <Th className="w-[120px] text-left">Status</Th>
                  <Th className="w-[80px] text-center">Days</Th>
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
                  <Th className="w-[80px]">{null}</Th>
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

function BorrowerRow({ b, onChange }: { b: Borrower; onChange: () => void }) {
  const [name, setName] = useState(b.name);
  const [principal, setPrincipal] = useState(b.principal);
  const [days, setDays] = useState(String(b.days_elapsed));
  const [nakulha, setNakulha] = useState(b.than_nakulha);
  const [status, setStatus] = useState<BorrowerStatus>(b.status);
  const [pending, setPending] = useState(false);

  const dirtyName = name !== b.name;
  const dirtyPrincipal = principal !== b.principal;
  const dirtyDays = days !== String(b.days_elapsed);
  const dirtyNakulha = nakulha !== b.than_nakulha;
  const dirtyStatus = status !== b.status;
  const dirty = dirtyName || dirtyPrincipal || dirtyDays || dirtyNakulha || dirtyStatus;

  async function commit(patch: Parameters<typeof api.patchBorrower>[1]) {
    setPending(true);
    try {
      await api.patchBorrower(b.id, patch);
      onChange();
    } finally {
      setPending(false);
    }
  }

  async function save() {
    const patch: Parameters<typeof api.patchBorrower>[1] = {};
    if (dirtyName) patch.name = name;
    if (dirtyPrincipal) patch.principal = principal;
    if (dirtyDays) patch.days_elapsed = Number(days);
    if (dirtyNakulha) patch.than_nakulha = nakulha;
    if (dirtyStatus) patch.status = status;
    if (Object.keys(patch).length) await commit(patch);
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

  return (
    <tr className="border-t border-panel-border">
      <td className="px-2 py-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => dirtyName && save()}
          className={`${cell} w-full`}
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          step="0.01"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          onBlur={() => dirtyPrincipal && save()}
          className={`${cell} w-full text-right tabular-nums`}
        />
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
      <td className="px-2 py-2">
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          onBlur={() => dirtyDays && save()}
          className={`${cell} w-full text-center tabular-nums`}
        />
      </td>
      <td className="px-2 py-2 text-right text-blue-soft tabular-nums">
        {formatPHP(b.than_actual)}
      </td>
      <td className="px-2 py-2 text-right text-amber-soft tabular-nums">
        {formatPHP(b.than_unrealised)}
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          step="0.01"
          value={nakulha}
          onChange={(e) => setNakulha(e.target.value)}
          onBlur={() => dirtyNakulha && save()}
          className={`${cell} w-full text-right tabular-nums border-green-soft/40 focus:border-green-soft`}
        />
      </td>
      <td className="px-2 py-2 text-right tabular-nums">{formatPHP(b.balance)}</td>
      <td className="px-2 py-2 text-right">
        <button
          onClick={remove}
          disabled={pending}
          className="text-xs text-muted hover:text-amber-soft disabled:opacity-60"
        >
          remove
        </button>
      </td>
    </tr>
  );
}

function BorrowerCard({ b, onChange }: { b: Borrower; onChange: () => void }) {
  const [name, setName] = useState(b.name);
  const [principal, setPrincipal] = useState(b.principal);
  const [days, setDays] = useState(String(b.days_elapsed));
  const [nakulha, setNakulha] = useState(b.than_nakulha);
  const [status, setStatus] = useState<BorrowerStatus>(b.status);
  const [pending, setPending] = useState(false);

  const dirty = {
    name: name !== b.name,
    principal: principal !== b.principal,
    days: days !== String(b.days_elapsed),
    nakulha: nakulha !== b.than_nakulha,
    status: status !== b.status,
  };

  async function commit(patch: Parameters<typeof api.patchBorrower>[1]) {
    setPending(true);
    try {
      await api.patchBorrower(b.id, patch);
      onChange();
    } finally {
      setPending(false);
    }
  }

  async function saveField<K extends keyof Parameters<typeof api.patchBorrower>[1]>(
    key: K,
    val: Parameters<typeof api.patchBorrower>[1][K],
    isDirty: boolean,
  ) {
    if (isDirty) await commit({ [key]: val } as Parameters<typeof api.patchBorrower>[1]);
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
          onBlur={() => saveField("name", name, dirty.name)}
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
        <Field label="Principal">
          <input
            type="number"
            step="0.01"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            onBlur={() => saveField("principal", principal, dirty.principal)}
            className={`${cell} w-full text-right tabular-nums`}
          />
        </Field>
        <Field label="Days">
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            onBlur={() => saveField("days_elapsed", Number(days), dirty.days)}
            className={`${cell} w-full text-right tabular-nums`}
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <Stat label="THAN actual" value={formatPHP(b.than_actual)} tone="blue" />
        <Stat label="Unrealised" value={formatPHP(b.than_unrealised)} tone="amber" />
        <Stat label="Balance" value={formatPHP(b.balance)} />
      </div>

      <Field label="Nakulha (manual)">
        <input
          type="number"
          step="0.01"
          value={nakulha}
          onChange={(e) => setNakulha(e.target.value)}
          onBlur={() => saveField("than_nakulha", nakulha, dirty.nakulha)}
          className={`${cell} w-full text-right tabular-nums border-green-soft/40 focus:border-green-soft`}
        />
      </Field>

      <div className="flex justify-end pt-1">
        <button
          onClick={remove}
          disabled={pending}
          className="text-xs text-muted hover:text-amber-soft disabled:opacity-60"
        >
          remove borrower
        </button>
      </div>
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
