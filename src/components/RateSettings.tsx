"use client";

import { useState, useEffect } from "react";
import { SettingsSummary, api, formatPHP, formatPct } from "@/lib/api";
import { Panel } from "./Card";

export function RateSettings({
  s,
  onSaved,
}: {
  s: SettingsSummary;
  onSaved: (next: SettingsSummary) => void;
}) {
  const [dailyRate, setDailyRate] = useState(s.daily_rate);
  const [totalCapital, setTotalCapital] = useState(s.total_capital);
  const [cashOnHand, setCashOnHand] = useState(s.cash_on_hand);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setDailyRate(s.daily_rate);
    setTotalCapital(s.total_capital);
    setCashOnHand(s.cash_on_hand);
  }, [s.daily_rate, s.total_capital, s.cash_on_hand]);

  const dirty =
    dailyRate !== s.daily_rate ||
    totalCapital !== s.total_capital ||
    cashOnHand !== s.cash_on_hand;

  async function save() {
    setErr(null);
    setSaving(true);
    try {
      const next = await api.updateSettings({
        total_capital: totalCapital,
        cash_on_hand: cashOnHand,
        daily_rate: dailyRate,
      });
      onSaved(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const cellInput =
    "w-full rounded-lg border border-card-border bg-card px-3 py-2 text-right tabular-nums outline-none focus:border-amber-soft";

  return (
    <Panel
      title="THAN rate & capital settings"
      right={
        dirty && (
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-amber hover:bg-amber-soft text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        )
      }
    >
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <Row label="Daily rate" suffix="%">
            <input
              type="number"
              step="0.0001"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              className={cellInput}
            />
          </Row>
          <Row label="Total capital" suffix="₱">
            <input
              type="number"
              step="0.01"
              value={totalCapital}
              onChange={(e) => setTotalCapital(e.target.value)}
              className={cellInput}
            />
          </Row>
          <Row label="Cash on hand" suffix="₱">
            <input
              type="number"
              step="0.01"
              value={cashOnHand}
              onChange={(e) => setCashOnHand(e.target.value)}
              className={cellInput}
            />
          </Row>
          {err && (
            <div className="text-sm text-amber-soft border border-amber/40 rounded-lg px-3 py-2 bg-amber/10">
              {err}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 content-start">
          <ReadCard label="Daily" value={formatPct(s.daily_rate)} />
          <ReadCard label="Weekly" value={formatPct(s.weekly_rate)} />
          <ReadCard label="Monthly" value={formatPct(s.monthly_rate)} />
          <div className="col-span-3 grid grid-cols-2 gap-3 mt-1">
            <ReadCard label="THAN / day" value={formatPHP(s.than_day)} tone="blue" />
            <ReadCard label="THAN / month" value={formatPHP(s.than_month)} tone="blue" />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Row({
  label,
  suffix,
  children,
}: {
  label: string;
  suffix: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr_24px] items-center gap-2">
      <span className="text-sm text-muted-soft">{label}</span>
      {children}
      <span className="text-sm text-muted">{suffix}</span>
    </div>
  );
}

function ReadCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "blue";
}) {
  const t = tone === "blue" ? "text-blue-soft" : "text-white";
  return (
    <div className="rounded-xl border border-card-border bg-card px-4 py-3 text-center">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-lg font-semibold tabular-nums ${t}`}>{value}</div>
    </div>
  );
}
