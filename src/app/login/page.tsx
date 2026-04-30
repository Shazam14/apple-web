"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setToken, getToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/");
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Login failed (${res.status})`);
      }
      const data = await res.json();
      const token = data.access_token || data.token;
      if (!token) throw new Error("No token in response");
      setToken(token);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-panel-border bg-panel p-8 space-y-5"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apple Lending</h1>
          <p className="text-sm text-muted mt-1">Owner sign-in</p>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
              className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none focus:border-amber-soft"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 outline-none focus:border-amber-soft"
            />
          </label>
        </div>
        {error && (
          <div className="text-sm text-amber-soft border border-amber/40 rounded-lg px-3 py-2 bg-amber/10">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber hover:bg-amber-soft text-white font-medium py-2.5 transition disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
