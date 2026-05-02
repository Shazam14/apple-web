import { SettingsSummary, formatPHP } from "@/lib/api";
import { Panel, StatCard } from "./Card";

export function CapitalOverview({ s }: { s: SettingsSummary }) {
  const total = Number(s.total_capital) || 1;
  const lentPct = Math.min(100, (Number(s.lent_out) / total) * 100);
  return (
    <Panel title="Capital overview">
      <div className="mb-3 rounded-xl border border-card-border bg-card px-4 sm:px-5 py-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-xs text-muted">CAPITAL SA PALOD</span>
        <span className="text-2xl sm:text-3xl font-bold tabular-nums text-blue-soft break-all">{formatPHP(s.total_balance)}</span>
        <span className="text-xs text-muted sm:ml-auto whitespace-nowrap">{s.total_borrowers} borrowers</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="TOTAL PUHUNAN" value={formatPHP(s.total_capital)} subtitle="All funds" />
        <StatCard
          label="Lent out"
          value={formatPHP(s.lent_out)}
          subtitle="Deployed"
          tone="amber"
        />
        <StatCard
          label="Cash on hand"
          value={formatPHP(s.cash_on_hand)}
          subtitle="Idle"
          tone="green"
        />
        <StatCard
          label="THAN actual"
          value={formatPHP(s.sum_than_actual)}
          subtitle="Total accrued to date"
          tone="blue"
        />
        <StatCard
          label="THAN unrealised"
          value={formatPHP(s.sum_than_unrealised)}
          subtitle="Accrued, uncollected"
          tone="amber"
        />
        <StatCard
          label="THAN nakulha"
          value={formatPHP(s.sum_than_nakulha)}
          subtitle="Actually collected"
          tone="green"
        />
      </div>
      <div className="mt-5">
        <div className="h-2.5 w-full rounded-full bg-card-border overflow-hidden flex">
          <div className="h-full bg-amber" style={{ width: `${lentPct}%` }} />
          <div className="h-full bg-green" style={{ width: `${100 - lentPct}%` }} />
        </div>
        <div className="mt-2 flex gap-5 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber" />
            Lent out
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-green" />
            Cash on hand
          </span>
        </div>
      </div>
    </Panel>
  );
}
