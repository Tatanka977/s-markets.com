import { useEffect, useState, useCallback } from "react";

export interface AppUser {
  user_id: string;
  email: string;
  name: string;
  picture?: string | null;
  provider: string;
}

const API = (import.meta as any).env?.VITE_BACKEND_URL || "";

async function fetchMe(): Promise<AppUser | null> {
  try {
    const r = await fetch(`${API}/api/auth/me`, { credentials: "include" });
    if (!r.ok) return null;
    return (await r.json()) as AppUser;
  } catch {
    return null;
  }
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const u = await fetchMe();
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    // If we are handling an OAuth callback, skip /me — root layout will
    // exchange the session_id first.
    if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    setUser(null);
  }, []);

  return { user, loading, refresh, logout };
}
