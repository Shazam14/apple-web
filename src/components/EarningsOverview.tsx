"use client";

import { SettingsSummary, Borrower, BorrowerStatus, formatPHP } from "@/lib/api";
import { Panel } from "./Card";

function StatBox({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "blue" | "green" | "amber" | "default";
}) {
  const cls =
    tone === "green"
      ? "text-green-soft"
      : tone === "amber"
        ? "text-amber-soft"
        : tone === "blue"
          ? "text-blue-soft"
          : "text-white";
  return (
    <div className="rounded-xl border border-card-border bg-card px-3 py-2.5">
      <div className="text-[11px] text-muted">{label}</div>
      <div className={`mt-1 text-base font-semibold tabular-nums ${cls}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted/60 mt-0.5">{sub}</div>}
    </div>
  );
}

function StatusDot({ status }: { status: BorrowerStatus }) {
  const cls =
    status === "paid"
      ? "bg-green"
      : status === "overdue"
        ? "bg-amber"
        : "bg-blue-soft";
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${cls} shrink-0`} />;
}

function FormulaRow({
  label,
  value,
  tone,
  bold,
  border,
}: {
  label: string;
  value: string;
  tone?: "green" | "amber" | "muted";
  bold?: boolean;
  border?: boolean;
}) {
  const valCls =
    tone === "green"
      ? "text-green-soft"
      : tone === "amber"
        ? "text-amber-soft"
        : tone === "muted"
          ? "text-muted"
          : "text-white";
  return (
    <div className={`flex items-center justify-between text-sm ${border ? "border-t border-card-border pt-2" : ""}`}>
      <span className={bold ? "font-semibold" : "text-muted"}>{label}</span>
      <span className={`tabular-nums ${bold ? "font-bold text-base" : ""} ${valCls}`}>{value}</span>
    </div>
  );
}

function Bucket({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  tone: "green" | "blue";
}) {
  const border = tone === "green" ? "border-green-soft/30" : "border-blue-soft/30";
  const bg = tone === "green" ? "bg-green-soft/5" : "bg-blue-soft/5";
  const valCls = tone === "green" ? "text-green-soft" : "text-blue-soft";
  return (
    <div className={`rounded-xl border ${border} ${bg} px-3 py-3 text-center min-w-0`}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
      <div className={`mt-1 text-base sm:text-xl font-bold tabular-nums ${valCls} break-all`}>{value}</div>
      <div className="text-[10px] text-muted/60 mt-0.5">{sub}</div>
    </div>
  );
}

export function EarningsOverview({
  s,
  borrowers,
}: {
  s: SettingsSummary;
  borrowers: Borrower[];
}) {
  const idleCapital = Number(s.total_capital) - Number(s.lent_out);
  const thanCollected = Number(s.sum_than_nakulha);
  const cashAvailable = idleCapital + thanCollected;

  return (
    <Panel title="Cash & Earnings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Left: THAN earned ── */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <StatBox label="Today's accrual" value={formatPHP(s.than_day)} sub="per day" tone="blue" />
            <StatBox label="Total accrued" value={formatPHP(s.sum_than_actual)} sub="all borrowers" tone="blue" />
            <StatBox label="✓ Collected" value={formatPHP(s.sum_than_nakulha)} sub="nakulha" tone="green" />
            <StatBox label="⏳ Still owed" value={formatPHP(s.sum_than_unrealised)} sub="unrealised" tone="amber" />
          </div>

          <div className="rounded-lg border border-card-border bg-card/40 overflow-hidden">
            <div className="px-3 py-2 border-b border-card-border">
              <span className="text-[11px] uppercase tracking-wider text-muted">THAN per borrower</span>
            </div>
            {borrowers.length === 0 ? (
              <div className="px-3 py-3 text-xs text-muted">No borrowers yet</div>
            ) : (
              borrowers.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2 border-t border-card-border/50 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusDot status={b.status} />
                    <span className="truncate">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="text-green-soft tabular-nums text-xs whitespace-nowrap">
                      {formatPHP(b.than_nakulha)} <span className="text-muted/70">collected</span>
                    </span>
                    <span className="text-amber-soft/70 tabular-nums text-xs whitespace-nowrap">
                      {formatPHP(b.than_unrealised)} <span className="text-muted/70">owed</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right: Cash position ── */}
        <div className="space-y-3">
          <div className="rounded-xl border border-card-border bg-card px-4 py-4 space-y-2">
            <FormulaRow label="Total capital" value={formatPHP(s.total_capital)} />
            <FormulaRow label="− Currently lent" value={`−${formatPHP(s.lent_out)}`} tone="muted" />
            <FormulaRow label="+ THAN collected" value={`+${formatPHP(s.sum_than_nakulha)}`} tone="green" />
            <FormulaRow
              label="Cash available"
              value={formatPHP(cashAvailable)}
              bold
              border
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Bucket
              icon="💸"
              label="Spend"
              value={formatPHP(thanCollected)}
              sub="THAN profit — yours"
              tone="green"
            />
            <Bucket
              icon="🔄"
              label="Re-lend"
              value={formatPHP(idleCapital)}
              sub="idle capital"
              tone="blue"
            />
          </div>

          <p className="text-[11px] text-muted/50 text-center">
            Re-lend = capital not yet deployed. Spend = THAN you've already collected.
          </p>
        </div>

      </div>
    </Panel>
  );
}
