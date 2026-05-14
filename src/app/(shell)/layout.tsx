"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, logout } from "@/lib/auth";
import { Sidebar } from "@/components/shell/Sidebar";
import { BottomNav } from "@/components/shell/BottomNav";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#8a96a8" }}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <div className="kfx" style={{ display: "contents" }}>
        <Sidebar onLogout={logout} />
      </div>
      <div
        className="flex-1 min-w-0"
        style={{
          paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </div>
      <div className="kfx" style={{ display: "contents" }}>
        <BottomNav />
      </div>
    </div>
  );
}
