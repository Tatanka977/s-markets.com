# Strategic Markets — PRD

## Original Problem Statement
Clone private GitHub repo `Tatanka977/mon-eta` (branch: main) and expand into a fully functional financial portfolio terminal called **Strategic Markets** with:
- Real Finnhub market data
- News feed with filters + AI sentiment
- MiFID II / SEC compliance disclaimers
- Fully responsive layout (PC/mobile)
- Redesigned Home / Portfolio / Risk Analysis pages
- Full authentication migration from Supabase/Lovable → custom FastAPI + MongoDB + JWT + Google Auth

Language: **Italian** (all responses in Italian).

## Architecture
```
/app/
├── backend/            # FastAPI (JWT + Google auth + AI + Finnhub proxy)
│   ├── server.py
│   └── requirements.txt
├── src/                # TanStack Start SSR app (real frontend)
│   ├── components/PortfolioTerminal.tsx  (2200 lines)
│   ├── hooks/
│   │   ├── usePersistentState.ts
│   │   ├── useUser.ts
│   │   └── useTheme.ts                   (NEW — theme toggle)
│   ├── routes/
│   └── styles.css                        (CSS vars for both themes)
├── frontend/           # Stub for Emergent supervisor template
├── memory/
│   ├── PRD.md
│   └── test_credentials.md
└── package.json
```

## Integrations
- Finnhub (market data + news) — user API key
- Emergent LLM Key (Gemini 2.5 Flash) — AI chat + sentiment
- Emergent Google Auth — social login
- MongoDB — users, profiles, portfolios

## Completed Features
- 2025-Q1: Full app migration, Emergent LLM integration, Finnhub, News feed, MiFID compliance
- 2025-Q1: Custom FastAPI + JWT + MongoDB + Google Auth (Supabase removed)
- 2025-Q1: Responsive layout + Strategic Markets rebrand
- 2025-Q1: `usePersistentState` hook to survive Vite HMR reloads
- 2026-02: **Theme toggle Terminal ↔ Aurora**
  - Terminal (default) = Bloomberg dark/monospace
  - Aurora = modern fintech-minimal light theme, blue #2C5FEB accent, radius 16px, system font
  - `useTheme` hook + localStorage persistence (`moneta_sm_theme`)
  - CSS variables (`--sm-*`) in styles.css for both palettes
  - Global overrides for font/uppercase/border-radius/buttons in Aurora mode
  - Toggle button (iOS-style switch) in top bar with `data-testid="theme-toggle-button"`

## Known Blockers
- **P0 — Production deployment fails on Cloud Build.** The app is TanStack Start SSR at `/app` root, but Emergent template deployer expects standard `/app/frontend` Vite/CRA output. Static scan by `deployment_agent` reports PASS but actual `cloud build: build failed`. Recommended path: Save to GitHub → deploy on Vercel/Netlify (native TanStack Start support).

## Backlog / Roadmap
- P1: Refactor `PortfolioTerminal.tsx` (>2200 lines) into smaller components
- P1: `testing_agent_v3_fork` full auth flow test (JWT + Google)
- P2: CoinGecko crypto integration
- P2: SSE streaming for AI chat
- P2: Telegram alerts
- P3: Saved searches, portfolio import/export JSON, market movers, share-portfolio link
