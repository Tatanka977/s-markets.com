# Moneta — Portfolio Terminal (PRD)

## Original Problem Statement
"Prendi il progetto mon-eta da github" — importazione del repository privato `Tatanka977/mon-eta`, esecuzione nell'ambiente Emergent e successiva aggiunta/modifica di funzionalità.

## Architecture
- **Frontend/SSR**: TanStack Start v1.168 (React 19, Vite 7) — full-stack TS, server functions
- **UI**: Bloomberg-style terminal (font monospace, sfondo nero, accenti blu/giallo)
- **Auth & DB**: Supabase Cloud (`kyjktigwsjokfqblhqte.supabase.co`) — profiles, portfolios, watchlist, ai_conversations
- **OAuth**: Lovable cloud auth wrapper (Google/Apple) + Supabase email/password
- **AI Advisor**: FastAPI proxy `/api/ai/chat` su porta 8001 → `emergentintegrations` (Gemini 2.5 Flash via EMERGENT_LLM_KEY)
- **Market data**: Finnhub (US stocks search) con fallback a mock universe (CRYPTO/FX/BOND/COMMODITY/ETF/REIT)

## Service Topology (Emergent)
- Supervisor `frontend` → `cd /app && npx vite dev --host 0.0.0.0 --port 3000` (TanStack Start SSR)
- Supervisor `backend` → uvicorn FastAPI (`/app/backend/server.py`) su 8001 (solo `/api/ai/chat`)
- Ingress: `/api/*` → 8001, resto → 3000

## Key Files Modified
- `/app/.env` — VITE_SUPABASE_*, FINNHUB_API_KEY, EMERGENT_BACKEND_URL, PORT=3000
- `/app/backend/.env` — EMERGENT_LLM_KEY
- `/app/backend/server.py` — endpoint `/api/ai/chat` con emergentintegrations
- `/app/src/lib/ai.functions.ts` — chiama backend Python invece di Lovable AI gateway
- `/app/src/lib/finance.functions.ts` — Finnhub real per stocks + mock fallback
- `/app/vite.config.ts` — `allowedHosts: true`, HMR wss, porta 3000
- `/app/frontend/package.json` — script `start` delega a vite in /app

## Implementation Status (12 Gen 2026)
- [x] Clone repo privato via PAT
- [x] Node 22 installato (/root/.local/node22) — richiesto da `@tanstack/react-start@1.168` (engine >=22.12)
- [x] `npm install --legacy-peer-deps` completato (291 pacchetti) + `react-is` per recharts SSR
- [x] Backend FastAPI espone `/api/ai/chat` → Gemini 2.5 Flash via Emergent LLM key (testato ✅)
- [x] Frontend serve l'app TanStack Start su porta 3000 con SSR funzionante
- [x] Finnhub LIVE search testato (AAPL → ritorna CDR/listing internazionali reali)
- [x] Mock universe attivo per multi-asset (CRYPTO, FX, BOND, COMMODITY)

## Pending / Backlog
- [ ] **Supabase migrations**: confermare con utente se SQL sono state applicate sul progetto cloud
- [ ] **Feature richieste dall'utente**: ancora da specificare quali modifiche/aggiunte fare
- [ ] **Lovable OAuth Google/Apple**: dipendono da `lovable.auth` — il package `@lovable.dev/cloud-auth-js` potrebbe richiedere config aggiuntiva fuori da Lovable sandbox
- [ ] **Finnhub free tier**: limita le quote a US equities — crypto/FX/bonds restano su mock
- [ ] **Hot reload SSR**: vite si riavvia automaticamente al modificare server.ts/routes

## Test Credentials
Vedere `/app/memory/test_credentials.md`

## URLs
- Preview: https://moneta-wallet.preview.emergentagent.com/
- Backend (interno): http://localhost:8001/api/ai/chat
- Supabase cloud: https://kyjktigwsjokfqblhqte.supabase.co
