"use client";

import { useMemo, useState } from "react";
import { api, Borrower, formatPHP } from "@/lib/api";
import { computeCalc } from "@/lib/due";
import { RangeCalendar } from "./RangeCalendar";

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

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function diffDaysISO(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00").getTime();
  const to = new Date(toISO + "T00:00:00").getTime();
  return Math.round((to - from) / 86_400_000);
}

export function AddTrancheModal({
  borrower,
  onClose,
  onAdded,
}: {
  borrower: Borrower;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [principal, setPrincipal] = useState("");
  const [ratePct, setRatePct] = useState<string>(
    borrower.rate_snapshot && Number(borrower.rate_snapshot) > 0 ? borrower.rate_snapshot : "",
  );
  const [releasedISO, setReleasedISO] = useState<string>(todayISO());
  const [dueISO, setDueISO] = useState<string>("");
  const [periodDays, setPeriodDays] = useState<number | null>(1);
  const [label, setLabel] = useState("");
  const [showReleaseEdit, setShowReleaseEdit] = useState(false);
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

  const onTimeTotal =
    calc.interestAtDue > 0
      ? Number(principal) + calc.interestAtDue
      : calc.dailyInterest > 0
        ? Number(principal) + calc.dailyInterest
        : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const trimmed = label.trim();
      const thanValue =
        calc.interestAtDue > 0
          ? calc.interestAtDue
          : calc.dailyInterest > 0
            ? calc.dailyInterest
            : 0;
      const baseThan = thanValue > 0 ? thanValue.toFixed(2) : undefined;
      await api.addTranche(borrower.id, {
        principal,
        ...(baseThan ? { than: baseThan } : {}),
        ...(trimmed ? { label: trimmed } : {}),
        ...(tenorDays ? { tenor_days: tenorDays } : {}),
        ...(ratePct.trim() !== "" ? { rate_pct: ratePct } : {}),
        late_fee_period_days: periodDays,
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-6"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-panel-border bg-panel p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <h3 className="text-lg font-semibold">
          Add release — <span className="text-amber-soft">{borrower.name}</span>
        </h3>

        {/* Principal + Rate */}
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">
              Pila / Palod (₱)
              <Hint text="Kanang kantidad nga imong gipahuwam." />
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

        {calc.dailyInterest > 0 && (
          <div className="text-xs text-muted -mt-2 ml-1">
            = <span className="text-amber-soft tabular-nums">{formatPHP(calc.dailyInterest, 2)}</span>
            {" "}/ adlaw THAN
          </div>
        )}

        {/* Release + Due dates */}
        <div className="grid grid-cols-2 gap-3">
          {showReleaseEdit ? (
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted">
                Released
                <Hint text="Kanus-a gihatag ang kwarta sa nag-utang." />
              </span>
              <input
                type="date"
                value={releasedISO}
                onChange={(e) => setReleasedISO(e.target.value)}
                className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none focus:border-amber-soft"
              />
            </label>
          ) : (
            <div>
              <span className="text-xs uppercase tracking-wider text-muted">Released</span>
              <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-card/60 border border-card-border/50 text-sm">
                <span>📅</span>
                <span className="text-foreground">Karon ({releasedISO})</span>
              </div>
            </div>
          )}
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">
              Due
              <Hint text="Deadline sa pagbayad. Pwede mo-pili ug petsa o quick button sa ubos." />
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

        <div className="flex items-center justify-between -mt-2 ml-1 text-xs">
          <button
            type="button"
            onClick={() => setShowReleaseEdit((v) => !v)}
            className="text-muted/70 hover:text-amber-soft"
          >
            {showReleaseEdit ? "✓ done" : "↻ change release date"}
          </button>
          {tenorDays !== null && (
            <span className="text-muted">
              = <span className="text-amber-soft tabular-nums">{tenorDays}</span> ka adlaw
            </span>
          )}
        </div>

        {/* Visual range calendar — tap a day to set Due */}
        <RangeCalendar
          releasedISO={releasedISO}
          dueISO={dueISO}
          onPick={setDueISO}
          principal={Number(principal) || 0}
          ratePct={Number(ratePct) || 0}
          lateFeePeriodDays={periodDays}
        />

        {/* Late-fee period dropdown */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted">
            Multa kada
            <Hint text="Kada pila ka adlaw modako ang multa kung dili pa makabayd. Mag-+₱(rate × palod) kada period." />
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
          {periodDays !== null && calc.dailyInterest > 0 && (
            <div className="mt-1 text-xs text-muted ml-1">
              = +<span className="text-amber-soft tabular-nums">{formatPHP(calc.dailyInterest, 2)}</span>{" "}
              kada {periodDays} adlaw nga ulahi
            </div>
          )}
        </label>

        {/* Label */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted">
            Label
            <Hint text="Para sa unsa? Pananglitan: sari-sari, tricycle, school fee. (Optional)" />
          </span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={120}
            placeholder="e.g. sari-sari, tricycle"
            className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none focus:border-amber-soft"
          />
        </label>

        {/* Calculator results */}
        {(onTimeTotal > 0 || calc.dailyInterest > 0) && (
          <div className="rounded-xl border border-amber-soft/30 bg-amber-soft/5 p-3 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wider text-muted">
                Pagka-due{tenorDays ? ` (sa ${tenorDays} ka adlaw)` : ""}
              </span>
              <span className="text-lg font-semibold tabular-nums text-amber-soft">
                {formatPHP(onTimeTotal, 2)}
              </span>
            </div>
            {periodDays !== null && calc.dailyInterest > 0 && (
              <div className="flex justify-between items-baseline text-xs text-muted/80">
                <span>+ kada ulahi {periodDays === 1 ? "adlaw" : `${periodDays} adlaw`}</span>
                <span className="tabular-nums">+{formatPHP(calc.dailyInterest, 2)}</span>
              </div>
            )}
            <div className="text-[10px] text-muted/60 pt-1 border-t border-amber-soft/20">
              {Number(principal) > 0 && Number(ratePct) > 0
                ? tenorDays
                  ? `${formatPHP(Number(principal), 0)} × ${ratePct}% × ${tenorDays} adlaw = ${formatPHP(calc.interestAtDue, 2)} THAN`
                  : `${formatPHP(Number(principal), 0)} × ${ratePct}% = ${formatPHP(calc.dailyInterest, 2)}/adlaw`
                : "Sulati ang palod ug rate aron makita ang computation"}
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
            {busy ? "Adding…" : "+ I-Release"}
          </button>
        </div>
      </form>
    </div>
  );
}
