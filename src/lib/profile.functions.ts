/**
 * Legacy Supabase-based profile helpers replaced with a lightweight
 * localStorage-backed implementation until dedicated MongoDB endpoints
 * are added. All functions accept the same shape as before so existing
 * callers keep working, but nothing hits Supabase anymore.
 */
import { createServerFn } from "@tanstack/react-start";

type Portfolio = { id: string; name: string; holdings: any[]; updated_at: string };
type Watchlist = { id: string; symbol: string; name?: string; category?: string; created_at: string };
type Convo = { id: string; title: string; messages: any[]; updated_at: string };

const K = {
  ports: "moneta_ports_v1",
  watch: "moneta_watchlist_v1",
  convs: "moneta_convs_v1",
  prof:  "moneta_profile_v1",
};

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(key) || "[]"); } catch { return []; }
}
function write<T>(key: string, val: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(val));
}
const now = () => new Date().toISOString();
const id  = () => "id_" + Math.random().toString(36).slice(2, 10);

// These are declared as server functions to keep the type-signature compatible
// with the previous Supabase-backed calls (`fn({ data: ... })`), but they
// actually run on the client using localStorage.
export const savePortfolio = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; holdings: any[] }) => d)
  .handler(async ({ data }) => {
    if (typeof window === "undefined") return { id: id(), ...data, updated_at: now() };
    const list = read<Portfolio>(K.ports);
    const rec: Portfolio = { id: id(), name: data.name, holdings: data.holdings, updated_at: now() };
    list.unshift(rec); write(K.ports, list);
    return rec;
  });

export const listPortfolios = createServerFn({ method: "GET" }).handler(async () =>
  read<Portfolio>(K.ports)
);

export const deletePortfolio = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => { write(K.ports, read<Portfolio>(K.ports).filter(p => p.id !== data.id)); return { ok: true }; });

export const addToWatchlist = createServerFn({ method: "POST" })
  .inputValidator((d: { symbol: string; name?: string; category?: string }) => d)
  .handler(async ({ data }) => {
    const list = read<Watchlist>(K.watch);
    if (list.find(w => w.symbol === data.symbol)) return list[0];
    const rec: Watchlist = { id: id(), symbol: data.symbol, name: data.name, category: data.category, created_at: now() };
    list.unshift(rec); write(K.watch, list);
    return rec;
  });

export const listWatchlist = createServerFn({ method: "GET" }).handler(async () =>
  read<Watchlist>(K.watch)
);

export const deleteWatchlist = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => { write(K.watch, read<Watchlist>(K.watch).filter(w => w.id !== data.id)); return { ok: true }; });

export const saveConversation = createServerFn({ method: "POST" })
  .inputValidator((d: { title: string; messages: any[] }) => d)
  .handler(async ({ data }) => {
    const list = read<Convo>(K.convs);
    const rec: Convo = { id: id(), title: data.title, messages: data.messages, updated_at: now() };
    list.unshift(rec); write(K.convs, list);
    return rec;
  });

export const listConversations = createServerFn({ method: "GET" }).handler(async () =>
  read<Convo>(K.convs)
);

export const deleteConversation = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => { write(K.convs, read<Convo>(K.convs).filter(c => c.id !== data.id)); return { ok: true }; });

// Profile display name is derived from the auth user; keep a stub for
// backward compat where the profile page calls it.
export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((d: { display_name: string }) => d)
  .handler(async ({ data }) => {
    if (typeof window !== "undefined") window.localStorage.setItem(K.prof, JSON.stringify({ display_name: data.display_name }));
    return { display_name: data.display_name };
  });
