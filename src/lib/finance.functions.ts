import { createServerFn } from "@tanstack/react-start";

export type Category = "STOCK" | "ETF" | "BOND" | "COMMODITY" | "CRYPTO" | "REIT" | "FX";

export const CATEGORIES: Category[] = ["STOCK","ETF","BOND","COMMODITY","CRYPTO","REIT","FX"];

export interface SearchResult {
  symbol: string;
  shortName: string;
  exchange: string;
  type: string;
  category?: Category;
  sector?: string;
  industry?: string;
  geo?: string;
}

export interface Quote {
  symbol: string;
  shortName: string;
  price: number | null;
  previousClose: number | null;
  dayChangePct: number | null;
  currency: string | null;
  exchange: string | null;
  marketCap: number | null;
  pe: number | null;
  dividendYield: number | null;
  sector?: string;
  industry?: string;
  geo?: string;
  type?: string;
  category?: Category;
  ytd?: number | null;
  vol?: number;
  beta?: number;
  er?: number;
  dy?: number;
  ticker?: string;
}

const BASE = "https://finnhub.io/api/v1";

function getKey(): string {
  const k = process.env.FINNHUB_API_KEY;
  if (!k) throw new Error("FINNHUB_API_KEY not configured");
  return k;
}

async function fh<T>(path: string): Promise<T> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${sep}token=${getKey()}`;
  const r = await fetch(url);
  const text = await r.text();
  if (!r.ok) {
    console.error("[Finnhub]", r.status, path, text.slice(0, 200));
    throw new Error(`Finnhub ${r.status}: ${text.slice(0, 120)}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    console.error("[Finnhub] bad JSON", path, text.slice(0, 200));
    throw new Error("Finnhub bad JSON");
  }
}

interface FhQuote {
  c: number; // current
  d: number; // change
  dp: number; // change percent
  h: number;
  l: number;
  o: number;
  pc: number; // previous close
  t: number;
}

interface FhProfile {
  country?: string;
  currency?: string;
  exchange?: string;
  name?: string;
  ticker?: string;
  marketCapitalization?: number; // in millions
  finnhubIndustry?: string;
  ipo?: string;
  weburl?: string;
}

interface FhMetrics {
  metric?: {
    peBasicExclExtraTTM?: number;
    peNormalizedAnnual?: number;
    dividendYieldIndicatedAnnual?: number;
    "52WeekHigh"?: number;
    "52WeekLow"?: number;
    beta?: number;
    yearToDatePriceReturnDaily?: number;
    "3MonthAverageTradingVolume"?: number;
  };
}

interface FhSearch {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

function geoFromCountry(c?: string): string {
  if (!c) return "WORLD";
  if (c === "US") return "USA";
  if (c === "GB") return "UK";
  if (["DE", "FR", "IT", "ES", "NL", "CH"].includes(c)) return "EUROPE";
  if (["JP", "CN", "HK", "KR", "SG", "IN"].includes(c)) return "ASIA";
  return c;
}

async function buildQuote(symbol: string): Promise<Quote> {
  const sym = symbol.trim().toUpperCase();

  const [q, profile, metrics] = await Promise.all([
    fh<FhQuote>(`/quote?symbol=${encodeURIComponent(sym)}`).catch(
      () => null as FhQuote | null
    ),
    fh<FhProfile>(`/stock/profile2?symbol=${encodeURIComponent(sym)}`).catch(
      () => ({} as FhProfile)
    ),
    fh<FhMetrics>(
      `/stock/metric?symbol=${encodeURIComponent(sym)}&metric=all`
    ).catch(() => ({} as FhMetrics)),
  ]);

  const price = q?.c ?? null;
  const prev = q?.pc ?? null;
  const dayChangePct = q?.dp ?? null;

  const m = metrics?.metric || {};
  const ytd = m.yearToDatePriceReturnDaily ?? null;
  const high = m["52WeekHigh"];
  const low = m["52WeekLow"];
  let vol = 0;
  if (high && low && price) {
    // rough proxy if no historical: range / mid * sqrt(252/52)
    vol = ((high - low) / ((high + low) / 2)) * 100 * 0.5;
  }

  return {
    symbol: sym,
    ticker: sym,
    shortName: profile?.name || sym,
    price,
    previousClose: prev,
    dayChangePct,
    currency: profile?.currency || "USD",
    exchange: profile?.exchange || "—",
    marketCap: profile?.marketCapitalization
      ? profile.marketCapitalization * 1_000_000
      : null,
    pe: m.peBasicExclExtraTTM ?? m.peNormalizedAnnual ?? null,
    dividendYield: m.dividendYieldIndicatedAnnual ?? null,
    geo: geoFromCountry(profile?.country),
    industry: profile?.finnhubIndustry,
    type: "Equity",
    ytd,
    vol: +vol.toFixed(2),
    beta: m.beta ?? 1,
    er: ytd ?? 0,
    dy: m.dividendYieldIndicatedAnnual ?? 0,
  };
}

// =============================================================
// MOCK DATA MODE — Finnhub temporarily disabled.
// Restore the real fh()-based handlers when the API key works.
// =============================================================

const MOCK_UNIVERSE: Quote[] = [
  // STOCKS
  { symbol: "AAPL", ticker: "AAPL", shortName: "Apple Inc.", price: 195.42, previousClose: 193.10, dayChangePct: 1.20, currency: "USD", exchange: "NASDAQ", marketCap: 3_010_000_000_000, pe: 32.1, dividendYield: 0.48, geo: "USA", industry: "Technology", type: "Equity", category: "STOCK", ytd: 12.4, vol: 22.1, beta: 1.25, er: 12.4, dy: 0.48 },
  { symbol: "MSFT", ticker: "MSFT", shortName: "Microsoft Corp.", price: 421.55, previousClose: 418.20, dayChangePct: 0.80, currency: "USD", exchange: "NASDAQ", marketCap: 3_130_000_000_000, pe: 35.6, dividendYield: 0.72, geo: "USA", industry: "Software", type: "Equity", category: "STOCK", ytd: 18.2, vol: 19.8, beta: 0.95, er: 18.2, dy: 0.72 },
  { symbol: "NVDA", ticker: "NVDA", shortName: "NVIDIA Corp.", price: 138.20, previousClose: 134.50, dayChangePct: 2.75, currency: "USD", exchange: "NASDAQ", marketCap: 3_400_000_000_000, pe: 65.4, dividendYield: 0.03, geo: "USA", industry: "Semiconductors", type: "Equity", category: "STOCK", ytd: 145.0, vol: 48.3, beta: 1.75, er: 145.0, dy: 0.03 },
  { symbol: "TSLA", ticker: "TSLA", shortName: "Tesla Inc.", price: 248.50, previousClose: 255.10, dayChangePct: -2.59, currency: "USD", exchange: "NASDAQ", marketCap: 790_000_000_000, pe: 72.3, dividendYield: 0, geo: "USA", industry: "Automotive", type: "Equity", category: "STOCK", ytd: -8.4, vol: 55.2, beta: 2.10, er: -8.4, dy: 0 },
  { symbol: "JPM", ticker: "JPM", shortName: "JPMorgan Chase & Co.", price: 218.75, previousClose: 217.40, dayChangePct: 0.62, currency: "USD", exchange: "NYSE", marketCap: 625_000_000_000, pe: 12.4, dividendYield: 2.28, geo: "USA", industry: "Banking", type: "Equity", category: "STOCK", ytd: 24.8, vol: 18.5, beta: 1.10, er: 24.8, dy: 2.28 },
  // ETFs
  { symbol: "SPY", ticker: "SPY", shortName: "SPDR S&P 500 ETF", price: 598.40, previousClose: 596.20, dayChangePct: 0.37, currency: "USD", exchange: "NYSE", marketCap: 600_000_000_000, pe: 24.8, dividendYield: 1.32, geo: "USA", industry: "Broad Market", type: "ETF", category: "ETF", ytd: 26.5, vol: 13.4, beta: 1.00, er: 26.5, dy: 1.32 },
  { symbol: "QQQ", ticker: "QQQ", shortName: "Invesco QQQ Trust", price: 519.80, previousClose: 516.00, dayChangePct: 0.74, currency: "USD", exchange: "NASDAQ", marketCap: 320_000_000_000, pe: 30.5, dividendYield: 0.56, geo: "USA", industry: "Tech ETF", type: "ETF", category: "ETF", ytd: 31.2, vol: 18.1, beta: 1.15, er: 31.2, dy: 0.56 },
  { symbol: "VWCE", ticker: "VWCE", shortName: "Vanguard FTSE All-World", price: 128.40, previousClose: 127.80, dayChangePct: 0.47, currency: "EUR", exchange: "XETRA", marketCap: 15_000_000_000, pe: 19.2, dividendYield: 1.65, geo: "WORLD", industry: "Global ETF", type: "ETF", category: "ETF", ytd: 22.1, vol: 14.2, beta: 0.98, er: 22.1, dy: 1.65 },
  // BONDS
  { symbol: "TLT", ticker: "TLT", shortName: "iShares 20+ Year Treasury", price: 92.15, previousClose: 91.80, dayChangePct: 0.38, currency: "USD", exchange: "NASDAQ", marketCap: 48_000_000_000, pe: null, dividendYield: 4.12, geo: "USA", industry: "Government Bond", type: "Bond ETF", category: "BOND", ytd: -2.4, vol: 11.5, beta: -0.15, er: -2.4, dy: 4.12 },
  { symbol: "AGG", ticker: "AGG", shortName: "iShares Core US Aggregate Bond", price: 98.70, previousClose: 98.50, dayChangePct: 0.20, currency: "USD", exchange: "NYSE", marketCap: 115_000_000_000, pe: null, dividendYield: 3.85, geo: "USA", industry: "Aggregate Bond", type: "Bond ETF", category: "BOND", ytd: 1.8, vol: 5.2, beta: 0.05, er: 1.8, dy: 3.85 },
  { symbol: "BTP30", ticker: "BTP30", shortName: "Italy BTP 4.5% 2053", price: 96.80, previousClose: 96.55, dayChangePct: 0.26, currency: "EUR", exchange: "MOT", marketCap: 25_000_000_000, pe: null, dividendYield: 4.65, geo: "EUROPE", industry: "Sovereign Bond", type: "Bond", category: "BOND", ytd: 3.2, vol: 9.8, beta: 0.10, er: 3.2, dy: 4.65 },
  // COMMODITIES
  { symbol: "GLD", ticker: "GLD", shortName: "SPDR Gold Trust", price: 252.30, previousClose: 250.80, dayChangePct: 0.60, currency: "USD", exchange: "NYSE", marketCap: 78_000_000_000, pe: null, dividendYield: 0, geo: "WORLD", industry: "Gold", type: "Commodity ETF", category: "COMMODITY", ytd: 28.5, vol: 15.8, beta: 0.10, er: 28.5, dy: 0 },
  { symbol: "SLV", ticker: "SLV", shortName: "iShares Silver Trust", price: 30.45, previousClose: 30.10, dayChangePct: 1.16, currency: "USD", exchange: "NYSE", marketCap: 14_000_000_000, pe: null, dividendYield: 0, geo: "WORLD", industry: "Silver", type: "Commodity ETF", category: "COMMODITY", ytd: 35.2, vol: 24.5, beta: 0.45, er: 35.2, dy: 0 },
  { symbol: "USO", ticker: "USO", shortName: "US Oil Fund", price: 74.20, previousClose: 75.10, dayChangePct: -1.20, currency: "USD", exchange: "NYSE", marketCap: 1_500_000_000, pe: null, dividendYield: 0, geo: "WORLD", industry: "Crude Oil", type: "Commodity ETF", category: "COMMODITY", ytd: 6.4, vol: 32.1, beta: 0.85, er: 6.4, dy: 0 },
  // CRYPTO
  { symbol: "BTC-USD", ticker: "BTC", shortName: "Bitcoin", price: 98450.00, previousClose: 96200.00, dayChangePct: 2.34, currency: "USD", exchange: "CRYPTO", marketCap: 1_950_000_000_000, pe: null, dividendYield: 0, geo: "WORLD", industry: "Cryptocurrency", type: "Crypto", category: "CRYPTO", ytd: 132.5, vol: 62.4, beta: 2.50, er: 132.5, dy: 0 },
  { symbol: "ETH-USD", ticker: "ETH", shortName: "Ethereum", price: 3820.00, previousClose: 3750.00, dayChangePct: 1.87, currency: "USD", exchange: "CRYPTO", marketCap: 460_000_000_000, pe: null, dividendYield: 0, geo: "WORLD", industry: "Cryptocurrency", type: "Crypto", category: "CRYPTO", ytd: 68.2, vol: 71.5, beta: 2.80, er: 68.2, dy: 0 },
  { symbol: "SOL-USD", ticker: "SOL", shortName: "Solana", price: 215.40, previousClose: 208.00, dayChangePct: 3.56, currency: "USD", exchange: "CRYPTO", marketCap: 102_000_000_000, pe: null, dividendYield: 0, geo: "WORLD", industry: "Cryptocurrency", type: "Crypto", category: "CRYPTO", ytd: 112.0, vol: 88.2, beta: 3.20, er: 112.0, dy: 0 },
  // REIT
  { symbol: "VNQ", ticker: "VNQ", shortName: "Vanguard Real Estate ETF", price: 92.80, previousClose: 92.20, dayChangePct: 0.65, currency: "USD", exchange: "NYSE", marketCap: 35_000_000_000, pe: 32.5, dividendYield: 3.95, geo: "USA", industry: "Real Estate", type: "REIT ETF", category: "REIT", ytd: 8.5, vol: 17.2, beta: 0.95, er: 8.5, dy: 3.95 },
  { symbol: "O", ticker: "O", shortName: "Realty Income Corp.", price: 58.40, previousClose: 58.10, dayChangePct: 0.52, currency: "USD", exchange: "NYSE", marketCap: 52_000_000_000, pe: 55.8, dividendYield: 5.42, geo: "USA", industry: "Retail REIT", type: "REIT", category: "REIT", ytd: 4.2, vol: 18.5, beta: 0.85, er: 4.2, dy: 5.42 },
  // FX
  { symbol: "EURUSD", ticker: "EURUSD", shortName: "Euro / US Dollar", price: 1.0845, previousClose: 1.0820, dayChangePct: 0.23, currency: "USD", exchange: "FX", marketCap: null, pe: null, dividendYield: 0, geo: "WORLD", industry: "Forex", type: "FX", category: "FX", ytd: -1.8, vol: 7.5, beta: 0, er: -1.8, dy: 0 },
  { symbol: "GBPUSD", ticker: "GBPUSD", shortName: "British Pound / US Dollar", price: 1.2710, previousClose: 1.2680, dayChangePct: 0.24, currency: "USD", exchange: "FX", marketCap: null, pe: null, dividendYield: 0, geo: "WORLD", industry: "Forex", type: "FX", category: "FX", ytd: -0.5, vol: 8.2, beta: 0, er: -0.5, dy: 0 },
];

function findMock(sym: string): Quote {
  const s = sym.trim().toUpperCase();
  const found = MOCK_UNIVERSE.find((q) => q.symbol === s || q.ticker === s);
  if (found) return { ...found };
  const price = 50 + (s.charCodeAt(0) % 30) * 7.3;
  const prev = price * 0.995;
  return {
    symbol: s, ticker: s, shortName: `${s} Holdings`,
    price: +price.toFixed(2), previousClose: +prev.toFixed(2),
    dayChangePct: +(((price - prev) / prev) * 100).toFixed(2),
    currency: "USD", exchange: "NASDAQ",
    marketCap: 10_000_000_000, pe: 20, dividendYield: 1.5,
    geo: "USA", industry: "Diversified", type: "Equity", category: "STOCK",
    ytd: 8.5, vol: 20, beta: 1, er: 8.5, dy: 1.5,
  };
}

export const searchSecurities = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string; category?: Category }) => d)
  .handler(async ({ data }) => {
    const q = (data.q || "").trim().toLowerCase();
    const cat = data.category;
    let pool = MOCK_UNIVERSE;
    if (cat) pool = pool.filter((m) => m.category === cat);
    const matches = q
      ? pool.filter(
          (m) =>
            m.symbol.toLowerCase().includes(q) ||
            (m.ticker || "").toLowerCase().includes(q) ||
            m.shortName.toLowerCase().includes(q)
        )
      : pool;
    return matches.map((m) => ({
      symbol: m.symbol,
      shortName: m.shortName,
      exchange: m.exchange || "US",
      type: m.type || "Equity",
      category: m.category,
      sector: m.industry,
      industry: m.industry,
      geo: m.geo,
    })) as SearchResult[];
  });

export const fetchQuote = createServerFn({ method: "GET" })
  .inputValidator((d: { symbol: string }) => d)
  .handler(async ({ data }) => findMock(data.symbol));

export const batchRefresh = createServerFn({ method: "POST" })
  .inputValidator((d: { symbols: string[] }) => d)
  .handler(async ({ data }) => data.symbols.map((s) => findMock(s)));
