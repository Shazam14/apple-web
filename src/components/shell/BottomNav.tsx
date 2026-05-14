"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="botnav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: "calc(6px + env(safe-area-inset-bottom))",
        zIndex: 10,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`botnav-item ${active ? "active" : ""}`}
          >
            <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
