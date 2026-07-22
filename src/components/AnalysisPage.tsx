import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  B, fmt, fmtM, pCol, pSign, groupBy, pMet, PIE_COLS,
  BPanel, FKey, computeAlerts, SEV_STYLE,
} from "@/lib/uiShared";
import { aiChat } from "@/lib/ai.functions";
import { getInvestorProfile } from "@/lib/profile.functions";

const FONT = "'Courier New', Courier, monospace";

function KpiCard({ icon, label, value, sub, subColor }: any) {
  return (
    <div style={{ background: B.panel, border: `1px solid ${B.border}`, borderRadius: 12, padding: "14px 16px", flex: 1, minWidth: 150 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontSize: 10, color: B.gray3, letterSpacing: "0.08em", fontFamily: FONT, textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: B.gray1, fontFamily: FONT }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: subColor || B.gray3, fontFamily: FONT, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function AllocationPanel({ title, data }: { title: string; data: { name: string; value: number; pct: string }[] }) {
  return (
    <BPanel title={title}>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <ResponsiveContainer width={90} height={90}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={26} outerRadius={42} paddingAngle={1} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => <Cell key={i} fill={PIE_COLS[i % PIE_COLS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontSize: 10, color: B.gray3, fontWeight: 400, paddingBottom: 4 }}>NAME</th>
                  <th style={{ textAlign: "right", fontSize: 10, color: B.gray3, fontWeight: 400, paddingBottom: 4 }}>WEIGHT</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 6).map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 12, color: B.gray1, padding: "3px 0", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLS[i % PIE_COLS.length], display: "inline-block" }} />
                      {d.name}
                    </td>
                    <td style={{ fontSize: 12, color: B.gray1, textAlign: "right", fontWeight: 700 }}>{d.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {data[0] && (
          <div style={{ fontSize: 11, color: B.gray3, fontFamily: FONT }}>
            Largest: <span style={{ color: B.blue, fontWeight: 700 }}>{data[0].name} ({data[0].pct}%)</span>
          </div>
        )}
      </div>
    </BPanel>
  );
}

export default function AnalysisPage({ holdings }: any) {
  const m = useMemo(() => pMet(holdings), [holdings]);
  const [sub, setSub] = useState<"alloc" | "risk" | "perf">("alloc");
  const [aiExplain, setAiExplain] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [whatIfTicker, setWhatIfTicker] = useState("");
  const [whatIfAmount, setWhatIfAmount] = useState("5000");

  if (!holdings.length) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 15, color: B.gray3, fontFamily: FONT }}>NO DATA — ADD SECURITIES VIA SEARCH</span>
    </div>
  );

  const sD = groupBy(holdings, "sector", m.total);
  const gD = groupBy(holdings, "geo", m.total);
  const tD = groupBy(holdings, "type", m.total);
  const topHoldings = [...holdings].sort((a: any, b: any) => b.value - a.value).slice(0, 5);
  const alerts = useMemo(() => computeAlerts(holdings, m), [holdings, m]);
  const highCount = alerts.filter(a => a.sev === "HIGH").length;
  const medCount = alerts.filter(a => a.sev === "MED").length;

  const explainAlerts = async () => {
    if (!alerts.length || aiBusy) return;
    setAiBusy(true); setAiExplain("");
    try {
      const alertsText = alerts.map((a, i) => `${i+1}. [${a.sev}] ${a.title} (${a.metric}): ${a.detail}`).join("\n");
      const positionsText = holdings.map((h: any) => `${h.asset.ticker} — ${((h.value/m.total)*100).toFixed(1)}% weight, sector: ${h.asset.sector || "N/A"}`).join("\n");
      let profileText = "";
      try {
        const p = await getInvestorProfile();
        if (p && (p.age_range || p.investment_goal)) {
          profileText = `\nInvestor context (self-reported, for tailoring scenario relevance only): age ${p.age_range||"N/A"}, goal ${p.investment_goal||"N/A"}, horizon ${p.time_horizon||"N/A"}, risk tolerance ${p.risk_tolerance||"N/A"}, experience ${p.experience_level||"N/A"}.`;
        }
      } catch {}
      const sys = `You are STRATEGIC MARKETS AI, an EDUCATIONAL analytics assistant. NO personalized investment advice under MiFID II. Frame everything as HYPOTHETICAL SCENARIOS and QUANTITATIVE OBSERVATIONS.
Structure: 1) brief overview 2) 2-3 key hypothetical scenarios with quantitative rationale 3) BOTTOM LINE. Use **bold** for key metrics.
ALWAYS end with: "DISCLAIMER: For educational and informational purposes only. Not investment advice."
Max 250 words. Respond in ENGLISH.${profileText}`;
      const prompt = `My hypothetical portfolio positions:\n${positionsText}\n\nActive risk alerts:\n${alertsText}\n\nExplain these alerts and outline hypothetical rebalancing scenarios (educational only).`;
      const { reply } = await aiChat({ data: { messages: [{ role: "user", content: prompt }], system: sys } });
      setAiExplain(reply);
    } catch (e: any) {
      setAiExplain("AI error: " + e.message);
    } finally { setAiBusy(false); }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 2, padding: "3px 4px", borderBottom: `1px solid ${B.border}`, background: B.panel2, flexShrink: 0 }}>
        {[{ id: "alloc", l: "ALLOCATION" }, { id: "risk", l: `RISK${highCount+medCount>0?` (${highCount+medCount})`:""}` }, { id: "perf", l: "PERFORMANCE" }].map(t => (
          <FKey key={t.id} label={t.l} active={sub === t.id} onClick={() => setSub(t.id as any)} />
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80, padding: 12 }}>
        {sub === "alloc" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
              <KpiCard icon="🥧" label="Total Portfolio Value" value={`$${fmtM(m.total)}`} sub="Market value" />
              <KpiCard icon="📊" label="Total Holdings" value={holdings.length} sub="Securities" />
              <KpiCard icon="🎯" label="Largest Sector" value={sD[0]?.name || "N/A"} sub={sD[0] ? `${sD[0].pct}%` : ""} subColor={B.blue} />
              <KpiCard icon="🌐" label="Main Geography" value={gD[0]?.name || "N/A"} sub={gD[0] ? `${gD[0].pct}%` : ""} subColor={B.blue} />
              <KpiCard icon="🥧" label="Main Asset Class" value={tD[0]?.name || "N/A"} sub={tD[0] ? `${tD[0].pct}%` : ""} subColor={B.blue} />
              <KpiCard icon="📈" label="Day Change" value={`${pSign(fmt(m.wDay,2))}%`} sub="Since prev. close" subColor={pCol(m.wDay)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, marginBottom: 10 }}>
              <AllocationPanel title="SECTOR ALLOCATION" data={sD} />
              <AllocationPanel title="GEOGRAPHIC EXPOSURE" data={gD} />
              <AllocationPanel title="ASSET ALLOCATION" data={tD} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
              <BPanel title="TOP HOLDINGS">
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT, fontSize: 12 }}>
                  <thead>
                    <tr style={{ color: B.gray3 }}>
                      <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: 400 }}>SYMBOL</th>
                      <th style={{ textAlign: "right", padding: "6px 10px", fontWeight: 400 }}>WEIGHT</th>
                      <th style={{ textAlign: "right", padding: "6px 10px", fontWeight: 400 }}>VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topHoldings.map((h: any) => (
                      <tr key={h.asset.ticker} style={{ borderTop: `1px solid ${B.border}` }}>
                        <td style={{ padding: "6px 10px", color: B.blue, fontWeight: 700 }}>{h.asset.ticker}</td>
                        <td style={{ padding: "6px 10px", textAlign: "right", color: B.gray1 }}>{((h.value/m.total)*100).toFixed(1)}%</td>
                        <td style={{ padding: "6px 10px", textAlign: "right", color: B.gray1 }}>${fmtM(h.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </BPanel>

              <BPanel title="WHAT-IF ANALYSIS (PREVIEW)">
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    <input value={whatIfTicker} onChange={e => setWhatIfTicker(e.target.value.toUpperCase())}
                      placeholder="ADD TICKER" style={{ flex: 1, background: B.panel2, border: `1px solid ${B.border}`, color: B.gray1, padding: "6px 8px", fontFamily: FONT, fontSize: 12 }} />
                    <input value={whatIfAmount} onChange={e => setWhatIfAmount(e.target.value)}
                      placeholder="AMOUNT" style={{ width: 90, background: B.panel2, border: `1px solid ${B.border}`, color: B.gray1, padding: "6px 8px", fontFamily: FONT, fontSize: 12 }} />
                  </div>
                  <div style={{ fontSize: 11, color: B.gray3, fontFamily: FONT, lineHeight: 1.6 }}>
                    This is a preview. Full hypothetical simulation (recomputing sector/risk weights before you commit) is coming soon — for now, add the position from Search to see its real impact.
                  </div>
                </div>
              </BPanel>
            </div>
          </>
        )}

        {sub === "risk" && (
          <div>
            <BPanel title="EXPOSURE ALERTS &amp; RISK CHECKS">
              <div style={{ padding: "6px 12px", background: B.panel2, borderBottom: `1px solid ${B.border}`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: B.gray3, fontFamily: FONT, letterSpacing: "0.06em" }}>
                  {alerts.length} CHECK{alerts.length !== 1 ? "S" : ""} EVALUATED
                </span>
                <button onClick={explainAlerts} disabled={aiBusy || alerts[0]?.sev === "OK"} style={{
                  background: "transparent", border: `1px solid ${B.cyan}`, color: B.cyan,
                  padding: "4px 12px", cursor: alerts[0]?.sev === "OK" ? "not-allowed" : "pointer",
                  fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                  opacity: alerts[0]?.sev === "OK" ? 0.4 : 1,
                }}>
                  {aiBusy ? "ANALYZING…" : "✦ EXPLAIN ALL ALERTS"}
                </button>
              </div>
              {aiExplain && (
                <div style={{ padding: "10px 12px", background: B.panel2, borderBottom: `1px solid ${B.cyan}`, fontFamily: FONT }}>
                  {aiExplain.split("\n").map((line, i) => {
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <div key={i} style={{ fontSize: 12, color: B.gray1, lineHeight: 1.55, marginBottom: 2 }}>
                        {parts.map((p, j) => p.startsWith("**") && p.endsWith("**") ? <span key={j} style={{ color: B.yellow, fontWeight: 700 }}>{p.slice(2,-2)}</span> : p)}
                      </div>
                    );
                  })}
                </div>
              )}
              <div>
                {alerts.map((a, i) => {
                  const s = SEV_STYLE[a.sev];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
                      background: s.bg, borderLeft: `3px solid ${s.border}`, borderBottom: `1px solid ${B.border}`, fontFamily: FONT }}>
                      <div style={{ fontSize: 20, color: s.text, lineHeight: 1, paddingTop: 2 }}>{s.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{a.title}</span>
                          <span style={{ fontSize: 10, color: s.text, padding: "1px 5px", border: `1px solid ${s.border}` }}>{s.label}</span>
                          <span style={{ fontSize: 11, color: B.gray3, marginLeft: "auto", fontWeight: 700 }}>{a.metric}</span>
                        </div>
                        <div style={{ fontSize: 12, color: B.gray1, lineHeight: 1.5 }}>{a.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </BPanel>
          </div>
        )}

        {sub === "perf" && (
          <div style={{ padding: "10px", fontSize: 12, color: B.gray3, fontFamily: FONT, textAlign: "center" }}>
            Performance view unchanged — see previous release for full P&amp;L breakdown.
          </div>
        )}
      </div>
    </div>
  );
}
