import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useUser } from "@/hooks/useUser";
import {
  listPortfolios, deletePortfolio,
  listWatchlist, deleteWatchlist, updateWatchlistAlert,
  listConversations, deleteConversation,
} from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Strategic Markets — My profile" }] }),
  component: ProfilePage,
});

const B = {
  bg: "#000", panel: "#0A0A0A", panel2: "#111", border: "#2A2A2A",
  blue: "#0066FF", white: "#fff", yellow: "#FFFF00",
  gray1: "#CCC", gray2: "#888", red: "#FF3333", green: "#00FF66",
};
const FONT = "'Courier New', Courier, monospace";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, logout } = useUser();
  const fPorts = useServerFn(listPortfolios);
  const fDelP  = useServerFn(deletePortfolio);
  const fWatch = useServerFn(listWatchlist);
  const fDelW  = useServerFn(deleteWatchlist);
  const fAlertW = useServerFn(updateWatchlistAlert);
  const fConv  = useServerFn(listConversations);
  const fDelC  = useServerFn(deleteConversation);

  const [tab, setTab] = useState<"profile" | "portfolios" | "watchlist" | "ai">("profile");
  const [ports, setPorts] = useState<any[]>([]);
  const [watch, setWatch] = useState<any[]>([]);
  const [convs, setConvs] = useState<any[]>([]);

  const loadAll = async () => {
    try {
      const [p, w, c] = await Promise.all([fPorts(), fWatch(), fConv()]);
      setPorts(p || []); setWatch(w || []); setConvs(c || []);
    } catch (e) { console.warn(e); }
  };

  // AIAdvisorPage (on a different route entirely, /terminal) picks this up
  // via the same usePersistentState pending-handoff pattern already used
  // for "ai_pending_prompt" — there's no shared component tree to prop-drill
  // a setter through, so localStorage is the handoff mechanism.
  const loadConversation = (conv: any) => {
    try {
      window.localStorage.setItem("moneta_ai_pending_conversation", JSON.stringify(conv.messages || []));
      window.localStorage.setItem("moneta_page_v1", "ai");
    } catch {}
    navigate({ to: "/terminal" });
  };

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (user) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: B.bg, color: B.gray2, display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 12 }}>
        LOADING…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.gray1, fontFamily: FONT,
      maxWidth: 820, margin: "0 auto", borderLeft: `1px solid ${B.border}`, borderRight: `1px solid ${B.border}` }}>
      <div style={{ background: B.blue, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 16, color: B.white, fontWeight: 700, letterSpacing: "0.14em" }}>STRATEGIC MARKETS</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em" }}>USER PROFILE</div>
        </div>
        <Link to="/" style={{ fontSize: 11, color: B.white, textDecoration: "none", fontWeight: 700, border: `1px solid ${B.white}`, padding: "3px 8px", letterSpacing: "0.06em" }}>
          ← TERMINAL
        </Link>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${B.border}`, background: B.panel2, overflowX: "auto" }}>
        {[
          { id: "profile", l: "PROFILE" },
          { id: "portfolios", l: `PORTFOLIOS (${ports.length})` },
          { id: "watchlist", l: `WATCHLIST (${watch.length})` },
          { id: "ai", l: `AI CHAT (${convs.length})` },
        ].map((t: any) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 12px", background: tab === t.id ? B.blue : "transparent",
            color: tab === t.id ? B.white : B.gray1, border: "none", cursor: "pointer",
            fontSize: 11, fontFamily: FONT, fontWeight: 700, letterSpacing: "0.08em", whiteSpace: "nowrap",
          }}>{t.l}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {tab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {user.picture && (
              <img src={user.picture} alt="" style={{ width: 64, height: 64, borderRadius: "50%", border: `1px solid ${B.border}` }} />
            )}
            <div>
              <div style={{ fontSize: 9, color: B.gray2, letterSpacing: "0.1em", marginBottom: 2 }}>NAME</div>
              <div style={{ fontSize: 15, color: B.yellow, fontWeight: 700 }}>{user.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: B.gray2, letterSpacing: "0.1em", marginBottom: 2 }}>EMAIL</div>
              <div style={{ fontSize: 12, color: B.gray1 }}>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: B.gray2, letterSpacing: "0.1em", marginBottom: 2 }}>SIGN-IN METHOD</div>
              <div style={{ fontSize: 12, color: B.green, textTransform: "uppercase" }}>{user.provider}</div>
            </div>
            <button data-testid="logout-btn" onClick={async () => { await logout(); navigate({ to: "/auth" }); }} style={{
              marginTop: 16, background: "transparent", border: `1px solid ${B.red}`, color: B.red,
              padding: "8px 12px", fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer",
            }}>SIGN OUT</button>
          </div>
        )}

        {tab !== "profile" && (
          <div>
            {(tab === "portfolios" ? ports : tab === "watchlist" ? watch : convs).map((it: any) => (
              <div key={it.id} style={{ padding: "8px 10px", borderBottom: `1px solid ${B.border}`,
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: B.yellow, fontWeight: 700 }}>{it.name || it.symbol || it.title}</div>
                  <div style={{ fontSize: 10, color: B.gray2 }}>
                    {tab === "portfolios" && `${(it.holdings || []).length} positions · ${new Date(it.updated_at).toLocaleDateString()}`}
                    {tab === "watchlist" && `${it.category || ""} · ${new Date(it.created_at).toLocaleDateString()}${it.target_price != null ? ` · 🔔 ${it.direction} ${it.target_price}` : ""}`}
                    {tab === "ai" && `${(it.messages || []).length} messages · ${new Date(it.updated_at).toLocaleDateString()}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {tab === "watchlist" && (
                    <button onClick={async () => {
                      const input = window.prompt(
                        `Alert price for ${it.symbol} (leave blank to clear):`,
                        it.target_price != null ? String(it.target_price) : ""
                      );
                      if (input === null) return;
                      const price = input.trim() === "" ? null : parseFloat(input);
                      if (price != null && (!isFinite(price) || price <= 0)) return;
                      let direction: "above" | "below" | null = it.direction || "above";
                      if (price != null) {
                        const dirInput = window.prompt(`Notify when ${it.symbol} goes "above" or "below" ${price}?`, direction);
                        if (dirInput !== "above" && dirInput !== "below") return;
                        direction = dirInput;
                      } else {
                        direction = null;
                      }
                      if (price != null && typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
                        try { await Notification.requestPermission(); } catch {}
                      }
                      await fAlertW({ data: { id: it.id, target_price: price, direction } });
                      loadAll();
                    }} style={{ background: "transparent", border: `1px solid ${B.border}`, color: B.yellow,
                      padding: "2px 8px", cursor: "pointer", fontSize: 10, fontFamily: FONT }}>🔔</button>
                  )}
                  {tab === "ai" && (
                    <button onClick={() => loadConversation(it)} style={{ background: "transparent", border: `1px solid ${B.border}`, color: B.blue,
                      padding: "2px 8px", cursor: "pointer", fontSize: 10, fontFamily: FONT }}>LOAD</button>
                  )}
                  <button onClick={async () => {
                    if (tab === "portfolios") await fDelP({ data: { id: it.id } });
                    if (tab === "watchlist") await fDelW({ data: { id: it.id } });
                    if (tab === "ai") await fDelC({ data: { id: it.id } });
                    loadAll();
                  }} style={{ background: "transparent", border: `1px solid ${B.red}`, color: B.red,
                    padding: "2px 8px", cursor: "pointer", fontSize: 10, fontFamily: FONT }}>DEL</button>
                </div>
              </div>
            ))}
            {(tab === "portfolios" ? ports : tab === "watchlist" ? watch : convs).length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: B.gray2, fontSize: 11 }}>
                {tab === "portfolios" && "No portfolios saved yet"}
                {tab === "watchlist" && "No tickers in your watchlist"}
                {tab === "ai" && "No saved conversations"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
