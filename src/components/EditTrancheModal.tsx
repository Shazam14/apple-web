"use client";

import { useMemo, useState } from "react";
import { api, Borrower, Tranche, formatPHP } from "@/lib/api";
import { computeCalc } from "@/lib/due";

const PERIOD_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: "Wala — di mag-multa" },
  { value: 1, label: "Kada adlaw" },
  { value: 5, label: "Kada 5 ka adlaw" },
  { value: 15, label: "Kada 15 ka adlaw" },
  { value: 30, label: "Kada bulan (30 adlaw)" },
];

function Hint({ text }: { text: string }) {
  return (
    <span
      title={text}
      aria-label={text}
      className="ml-1 inline-flex items-center justify-center rounded-full border border-muted/40 text-[10px] leading-none w-3.5 h-3.5 text-muted/80 cursor-help select-none"
    >
      ?
    </span>
  );
}

function isoFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return isoFromDate(d);
}

function diffDaysISO(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00").getTime();
  const to = new Date(toISO + "T00:00:00").getTime();
  return Math.round((to - from) / 86_400_000);
}

function inferInitialRate(t: Tranche, b: Borrower): string {
  if (t.rate_pct && Number(t.rate_pct) > 0) return t.rate_pct;
  const p = Number(t.principal);
  const th = Number(t.than);
  if (p > 0 && th > 0) return ((th / p) * 100).toFixed(2);
  if (b.rate_snapshot && Number(b.rate_snapshot) > 0) return b.rate_snapshot;
  return "";
}

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
  const [ratePct, setRatePct] = useState<string>(inferInitialRate(tranche, borrower));
  const releasedISO = useMemo(() => isoFromDate(new Date(tranche.released_at)), [tranche.released_at]);
  const [dueISO, setDueISO] = useState<string>(
    tranche.tenor_days ? addDaysISO(releasedISO, tranche.tenor_days) : "",
  );
  const [periodDays, setPeriodDays] = useState<number | null>(tranche.late_fee_period_days);
  const [label, setLabel] = useState(tranche.label ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const tenorDays = useMemo<number | null>(() => {
    if (!dueISO) return null;
    const d = diffDaysISO(releasedISO, dueISO);
    return d > 0 ? d : null;
  }, [releasedISO, dueISO]);

  const calc = useMemo(
    () =>
      computeCalc({
        principal: Number(principal) || 0,
        ratePct: Number(ratePct) || 0,
        releasedAt: new Date(releasedISO + "T00:00:00"),
        tenorDays,
        lateFeePeriodDays: periodDays,
      }),
    [principal, ratePct, releasedISO, tenorDays, periodDays],
  );

  const onTimeTotal = calc.baseInterest > 0 ? Number(principal) + calc.baseInterest : Number(principal);
  const showLateNow = calc.daysLate > 0 && calc.totalLateFee > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api.patchTranche(borrower.id, tranche.id, {
        principal,
        than: calc.baseInterest > 0 ? calc.baseInterest.toFixed(2) : "0",
        label: label.trim(),
        tenor_days: tenorDays,
        rate_pct: ratePct && Number(ratePct) > 0 ? ratePct : null,
        late_fee_period_days: periodDays,
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-6"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-panel-border bg-panel p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <h3 className="text-lg font-semibold">
          Edit release #{trancheIndex} — <span className="text-amber-soft">{borrower.name}</span>
        </h3>

        <div className="flex items-start gap-2 rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-xs text-amber-soft/90">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>
            Pag-usab sa palod o rate, ma-adjust ang balance. THAN ma-recompute base sa rate × palod.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">
              Pila / Palod (₱)
              <Hint text="Kanang kantidad nga gipahuwam." />
            </span>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              required
              autoFocus
              className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-right tabular-nums outline-none focus:border-amber-soft"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">
              Rate (%)
              <Hint text="Pila ka percent ang interest. Pananglitan 1000 × 3% = ₱30." />
            </span>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={ratePct}
              onChange={(e) => setRatePct(e.target.value)}
              placeholder="3"
              className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-right tabular-nums outline-none focus:border-amber-soft"
            />
          </label>
        </div>

        {calc.baseInterest > 0 && (
          <div className="text-xs text-muted -mt-2 ml-1">
            = <span className="text-amber-soft tabular-nums">{formatPHP(calc.baseInterest, 2)}</span>{" "}
            base interest (THAN)
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted">Released</span>
            <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-card/60 border border-card-border/50 text-sm text-muted">
              <span>📅</span>
              <span>{releasedISO}</span>
              <span className="text-muted/60 text-[10px]">(locked)</span>
            </div>
          </div>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">
              Due
              <Hint text="Pwede usbon ang deadline. Quick buttons sa ubos." />
            </span>
            <input
              type="date"
              value={dueISO}
              min={releasedISO}
              onChange={(e) => setDueISO(e.target.value)}
              className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none focus:border-amber-soft"
            />
          </label>
        </div>

        {tenorDays !== null && (
          <div className="text-xs text-muted -mt-2 text-right">
            = <span className="text-amber-soft tabular-nums">{tenorDays}</span> ka adlaw
          </div>
        )}

        <div>
          <span className="text-xs uppercase tracking-wider text-muted">Quick term</span>
          <div className="mt-1 grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setDueISO("")}
              className={`rounded-lg border px-2 py-1.5 text-sm ${
                dueISO === ""
                  ? "border-amber-soft bg-amber-soft/10 text-amber-soft"
                  : "border-card-border bg-card text-muted hover:border-amber-soft/50"
              }`}
            >
              Wala
            </button>
            {[5, 15, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDueISO(addDaysISO(releasedISO, d))}
                className={`rounded-lg border px-2 py-1.5 text-sm ${
                  tenorDays === d
                    ? "border-amber-soft bg-amber-soft/10 text-amber-soft"
                    : "border-card-border bg-card text-muted hover:border-amber-soft/50"
                }`}
              >
                +{d}d
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted">
            Multa kada
            <Hint text="Kada pila ka adlaw modako ang multa kung dili pa makabayd." />
          </span>
          <select
            value={periodDays === null ? "" : String(periodDays)}
            onChange={(e) => setPeriodDays(e.target.value === "" ? null : Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none focus:border-amber-soft"
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={String(o.value)} value={o.value === null ? "" : String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
          {periodDays !== null && calc.baseInterest > 0 && (
            <div className="mt-1 text-xs text-muted ml-1">
              = +<span className="text-amber-soft tabular-nums">{formatPHP(calc.baseInterest, 2)}</span>{" "}
              kada {periodDays} adlaw nga ulahi
            </div>
          )}
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted">
            Label
            <Hint text="Para sa unsa? (Optional)" />
          </span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={120}
            placeholder="e.g. sari-sari, tricycle"
            className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none focus:border-amber-soft"
          />
        </label>

        {(onTimeTotal > 0 || calc.baseInterest > 0) && (
          <div className="rounded-xl border border-amber-soft/30 bg-amber-soft/5 p-3 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wider text-muted">Pagka-due</span>
              <span className="text-lg font-semibold tabular-nums text-amber-soft">
                {formatPHP(onTimeTotal, 2)}
              </span>
            </div>
            {showLateNow ? (
              <div className="flex justify-between items-baseline text-xs text-red-400">
                <span>+ multa karon ({calc.daysLate} ka adlaw ulahi · {calc.periodsLate} period)</span>
                <span className="tabular-nums">+{formatPHP(calc.totalLateFee, 2)}</span>
              </div>
            ) : (
              periodDays !== null && calc.baseInterest > 0 && (
                <div className="flex justify-between items-baseline text-xs text-muted/80">
                  <span>+ kada ulahi {periodDays === 1 ? "adlaw" : `${periodDays} adlaw`}</span>
                  <span className="tabular-nums">+{formatPHP(calc.baseInterest, 2)}</span>
                </div>
              )
            )}
            <div className="text-[10px] text-muted/60 pt-1 border-t border-amber-soft/20">
              {Number(principal) > 0 && Number(ratePct) > 0
                ? `${formatPHP(Number(principal), 0)} × ${ratePct}% = ${formatPHP(calc.baseInterest, 2)}`
                : "Walay rate — base interest = ₱0"}
            </div>
          </div>
        )}

        {err && (
          <div className="text-sm text-amber-soft border border-amber/40 rounded-lg px-3 py-2 bg-amber/10">
            {err}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
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
