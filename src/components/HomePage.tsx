import { useState, useEffect, useMemo } from "react";
import {
  B, fmt, fmtM, pCol, pSign, pMet, BPanel,
  MarketStatusBar, IndicesOverview,
} from "./PortfolioTerminal";
import { fetchMarketNews as srvMarketNews } from "@/lib/news.functions";
import { savePortfolio } from "@/lib/profile.functions";
import { useUser } from "@/hooks/useUser";

const FONT = "'Courier New', Courier, monospace";

function StatCard({ label, value, sub, color }: any) {
  return (
    <div style={{ minWidth: 130 }}>
      <div style={{ fontSize: 10, color: B.gray3, letterSpacing: "0.08em", fontFamily: FONT, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || B.gray1, fontFamily: FONT }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: B.gray3, fontFamily: FONT }}>{sub}</div>}
    </div>
  );
}

function MarketNewsPanel() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    srvMarketNews({ data: { category: "general" } }).then((d: any) => { if (alive) { setNews(d || []); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <BPanel title="MARKET NEWS">
      {loading && <div style={{ padding: "10px 12px", fontSize: 12, color: B.gray3, fontFamily: FONT }}>LOADING…</div>}
      {news.slice(0, 5).map((n: any) => (
        <div key={n.id} style={{ padding: "8px 12px", borderBottom: `1px solid ${B.border}` }}>
          <div style={{ fontSize: 13, color: B.gray1, fontFamily: FONT, lineHeight: 1.4, marginBottom: 3 }}>{n.headline}</div>
          <div style={{ fontSize: 11, color: B.gray3, fontFamily: FONT }}>
            {n.source} · {new Date(n.datetime * 1000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      ))}
    </BPanel>
  );
}

export default function HomePage({ holdings, setPage, onRefresh, refreshing }: any) {
  const m = useMemo(() => pMet(holdings), [holdings]);
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const handleSave = async () => {
    if (!user) { window.location.href = "/auth"; return; }
    const name = prompt("Portfolio name:", "Portfolio " + new Date().toLocaleDateString());
    if (!name) return;
    setSaving(true);
    try {
      await savePortfolio({ data: { name, holdings } });
      setSaveMsg("✓ SAVED");
    } catch (e: any) { setSaveMsg("ERROR: " + e.message); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(""), 2000); }
  };

  const totalCost = holdings.reduce((s: number, h: any) => s + (h.costBasis ?? (h.costPrice || 0) * h.qty), 0);
  const totalPL = holdings.reduce((s: number, h: any) => s + (h.value - (h.costBasis ?? (h.costPrice || 0) * h.qty)), 0);
  const totalPLPct = totalCost > 0 ? (totalPL / totalCost * 100) : 0;

  // Real data, sorted by most recently opened first (based on user-entered buy date)
  const recentPositions = [...holdings]
    .filter((h: any) => h.buyDt)
    .sort((a: any, b: any) => new Date(b.buyDt).getTime() - new Date(a.buyDt).getTime())
    .slice(0, 5);

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 4, padding: 12 }}>
      <MarketStatusBar />
      <div style={{ marginTop: 10 }}>
        <IndicesOverview />
      </div>

      {!holdings.length ? (
        <BPanel title="PORTFOLIO OVERVIEW" style={{ marginTop: 10 }}>
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: B.gray2, fontFamily: FONT, marginBottom: 12 }}>NO ACTIVE PORTFOLIO</div>
            <button onClick={() => setPage("search")} style={{
              background: B.blue, border: "none", color: B.white, padding: "8px 20px", cursor: "pointer",
              fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", borderRadius: 8,
            }}>SEARCH SECURITIES</button>
          </div>
        </BPanel>
      ) : (
        <>
          <BPanel title="PORTFOLIO OVERVIEW  ·  LIVE DATA" style={{ marginTop: 10 }}>
            <div style={{ padding: "12px", display: "flex", flexWrap: "wrap", gap: 18 }}>
              <StatCard label="Total Portfolio Value" value={`$${fmtM(m.total)}`} />
              <StatCard label="Expected Return" value={`${pSign(fmt(m.wRet,1))}%`} color={pCol(m.wRet)} />
              <StatCard label="Day Change" value={`${pSign(fmt(m.wDay,2))}%`} color={pCol(m.wDay)} />
              <StatCard label="Unrealized P/L" value={`${totalPL>=0?"+":"−"}$${fmtM(Math.abs(totalPL))}`} sub={`(${pSign(fmt(totalPLPct,1))}%)`} color={pCol(totalPL)} />
              <StatCard label="Volatility" value={`${fmt(m.wVol,1)}%`} color={m.wVol>25?B.red:m.wVol>15?B.yellow:B.green} />
              <StatCard label="Sharpe Ratio" value={fmt(m.sharpe,2)} color={m.sharpe>0.7?B.green:m.sharpe>0.3?B.yellow:B.red} />
            </div>
            <div style={{ borderTop: `1px solid ${B.border}`, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: B.gray3, fontFamily: FONT }}>{holdings.length} SECURITIES</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={handleSave} disabled={saving} style={{
                  background: "none", border: `1px solid ${B.green}`, color: B.green, fontFamily: FONT,
                  fontSize: 12, cursor: saving ? "wait" : "pointer", padding: "4px 10px", borderRadius: 6,
                }}>{saving ? "..." : saveMsg || "💾 SAVE"}</button>
                <button onClick={onRefresh} disabled={refreshing} style={{
                  background: "none", border: `1px solid ${B.border}`, color: refreshing ? B.gray3 : B.blue,
                  fontFamily: FONT, fontSize: 12, cursor: refreshing ? "not-allowed" : "pointer", padding: "4px 10px", borderRadius: 6,
                }}>{refreshing ? "UPDATING..." : "↻ REFRESH"}</button>
              </div>
            </div>
          </BPanel>

          <BPanel title="PERFORMANCE (PREVIEW)" style={{ marginTop: 10 }}>
            <div style={{ padding: "16px 12px", fontSize: 12, color: B.gray3, fontFamily: FONT, lineHeight: 1.6, textAlign: "center" }}>
              A historical chart of your portfolio vs. the S&amp;P 500 is coming soon — it requires tracking your portfolio's value over time, which we don't store yet.
            </div>
          </BPanel>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10, marginTop: 10 }}>
            <BPanel title="SECURITIES — LIVE PRICES">
              {holdings.map((h: any) => (
                <div key={h.isin || h.asset.ticker} style={{ display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 10px", borderBottom: `1px solid ${B.border}`, fontFamily: FONT }}>
                  <span style={{ fontSize: 13, color: B.blue, fontWeight: 700, minWidth: 52 }}>{h.asset.ticker}</span>
                  <span style={{ fontSize: 13, color: B.gray1, minWidth: 70 }}>
                    {h.asset.price != null ? h.asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "---"}
                  </span>
                  <span style={{ fontSize: 12, color: pCol(h.asset.dayChangePct), minWidth: 50, fontWeight: 700 }}>
                    {h.asset.dayChangePct != null ? `${pSign(fmt(h.asset.dayChangePct,2))}%` : "---"}
                  </span>
                  <span style={{ fontSize: 12, color: B.gray2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {h.asset.shortName || h.asset.ticker}
                  </span>
                </div>
              ))}
            </BPanel>

            {recentPositions.length > 0 && (
              <BPanel title="RECENTLY ADDED POSITIONS">
                {recentPositions.map((h: any) => (
                  <div key={h.isin || h.asset.ticker} style={{ padding: "8px 12px", borderBottom: `1px solid ${B.border}`, fontFamily: FONT }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: B.blue, fontWeight: 700 }}>{h.asset.ticker}</span>
                      <span style={{ fontSize: 11, color: B.gray3 }}>{new Date(h.buyDt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 12, color: B.gray2 }}>
                      {h.qty} shares @ {h.costPrice != null ? h.costPrice.toLocaleString(undefined,{maximumFractionDigits:2}) : "—"}
                    </div>
                  </div>
                ))}
              </BPanel>
            )}
          </div>
        </>
      )}

      <div style={{ marginTop: 10 }}>
        <MarketNewsPanel />
      </div>
    </div>
  );
}
