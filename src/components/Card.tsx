import { ReactNode } from "react";

export function Panel({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-panel-border bg-panel p-5 sm:p-6 ${className}`}
    >
      {(title || right) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {title}
            </h2>
          )}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  subtitle,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  subtitle?: string;
  tone?: "default" | "amber" | "green" | "blue";
}) {
  const toneCls =
    tone === "amber"
      ? "text-amber-soft"
      : tone === "green"
        ? "text-green-soft"
        : tone === "blue"
          ? "text-blue-soft"
          : "text-white";
  return (
    <div className="rounded-xl border border-card-border bg-card px-4 py-3 min-w-0">
      <div className="text-xs text-muted leading-snug">{label}</div>
      <div className={`mt-1 text-lg sm:text-xl font-semibold tabular-nums break-words ${toneCls}`}>
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-[11px] text-muted leading-snug">{subtitle}</div>
      )}
    </div>
  );
}
