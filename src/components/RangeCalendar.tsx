"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isoFor(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function parseISO(iso: string): { y: number; m: number; d: number } | null {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
}

function todayISO(): string {
  const d = new Date();
  return isoFor(d.getFullYear(), d.getMonth(), d.getDate());
}

function diffDays(a: string, b: string): number {
  const aT = new Date(a + "T00:00:00").getTime();
  const bT = new Date(b + "T00:00:00").getTime();
  return Math.round((bT - aT) / 86_400_000);
}

type Cell = {
  iso: string;
  day: number;
  inMonth: boolean;
};

function buildGrid(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < startDow; i++) {
    const d = prevDays - startDow + 1 + i;
    const iso = isoFor(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, d);
    cells.push({ iso, day: d, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: isoFor(year, month, d), day: d, inMonth: true });
  }
  while (cells.length < 42) {
    const idx = cells.length - startDow - daysInMonth + 1;
    const iso = isoFor(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, idx);
    cells.push({ iso, day: idx, inMonth: false });
  }
  return cells;
}

export function RangeCalendar({
  releasedISO,
  dueISO,
  onPick,
}: {
  releasedISO: string;
  dueISO: string;
  onPick: (iso: string) => void;
}) {
  const initial = useMemo(() => parseISO(dueISO || releasedISO) ?? parseISO(todayISO())!, [releasedISO, dueISO]);
  const [viewY, setViewY] = useState(initial.y);
  const [viewM, setViewM] = useState(initial.m);

  const cells = useMemo(() => buildGrid(viewY, viewM), [viewY, viewM]);
  const today = todayISO();

  function prevMonth() {
    if (viewM === 0) {
      setViewY(viewY - 1);
      setViewM(11);
    } else {
      setViewM(viewM - 1);
    }
  }
  function nextMonth() {
    if (viewM === 11) {
      setViewY(viewY + 1);
      setViewM(0);
    } else {
      setViewM(viewM + 1);
    }
  }

  const tenor = dueISO ? Math.max(0, diffDays(releasedISO, dueISO)) : 0;

  return (
    <div className="rounded-xl border border-card-border bg-card/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="px-2 py-1 rounded-md text-muted hover:text-amber-soft hover:bg-card-border/40"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-sm font-medium">
          {MONTHS[viewM]} {viewY}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="px-2 py-1 rounded-md text-muted hover:text-amber-soft hover:bg-card-border/40"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[10px] uppercase tracking-wider text-muted/60 py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((c) => {
          const isReleased = c.iso === releasedISO;
          const isDue = !!dueISO && c.iso === dueISO;
          const isInRange = !!dueISO && c.iso > releasedISO && c.iso < dueISO;
          const isPast = c.iso < releasedISO;
          const isToday = c.iso === today;
          const disabled = isPast;

          let cls =
            "h-8 sm:h-9 text-xs rounded-md flex items-center justify-center select-none transition-colors";
          if (!c.inMonth) cls += " text-muted/30";
          else if (disabled) cls += " text-muted/30 cursor-not-allowed";
          else cls += " text-foreground cursor-pointer hover:bg-amber-soft/10";

          if (isReleased) cls += " bg-amber-soft/30 text-amber-soft font-semibold ring-1 ring-amber-soft/50";
          else if (isDue) cls += " bg-amber text-white font-semibold";
          else if (isInRange) cls += " bg-amber-soft/10 text-amber-soft";

          if (isToday && !isReleased && !isDue) cls += " ring-1 ring-muted/40";

          return (
            <button
              key={c.iso}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && !isReleased && onPick(c.iso)}
              className={cls}
              aria-label={c.iso}
              title={c.iso}
            >
              {c.day}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-card-border/50 text-[11px]">
        <div className="flex items-center gap-3 text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-soft/30 ring-1 ring-amber-soft/50" />
            Released
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber" />
            Due
          </span>
        </div>
        {dueISO ? (
          <span className="text-amber-soft tabular-nums">
            {tenor} ka adlaw
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onPick("")}
            className="text-muted/60 hover:text-amber-soft"
          >
            Tap a day →
          </button>
        )}
      </div>
    </div>
  );
}
