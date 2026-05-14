"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  return (
    <aside
      className="kfx-sidebar flex-col w-60 shrink-0"
      style={{
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        minHeight: "100vh",
      }}
    >
      <div
        className="flex items-center gap-2 px-4"
        style={{ height: 64, borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="avatar"
          style={{ background: "var(--accent)", width: 28, height: 28, fontSize: 12 }}
        >
          C
        </div>
        <div style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>CoolEd</div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${active ? "active" : ""}`}
            >
              <span aria-hidden style={{ width: 18, textAlign: "center" }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid var(--border)", padding: 12 }}>
        <button onClick={onLogout} className="btn btn-ghost btn-sm" style={{ width: "100%" }}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
