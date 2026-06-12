# Test Credentials — Moneta

## Supabase (auth utente finale)
- Project URL: https://kyjktigwsjokfqblhqte.supabase.co
- Anon/Publishable key: in /app/.env (VITE_SUPABASE_PUBLISHABLE_KEY)
- Registrazione: via UI /auth (email + password min 6 caratteri)
- OAuth: Google/Apple via Lovable cloud auth (richiede config Lovable lato dashboard)

## Backend AI proxy
- Endpoint: POST /api/ai/chat (porta 8001 interna, esposto via ingress su /api/*)
- Body: {"messages":[{"role":"user","content":"..."}],"system":"...","provider":"gemini","model":"gemini-2.5-flash"}
- Key: EMERGENT_LLM_KEY (universale Emergent, /app/backend/.env)

## Finnhub
- Key: in /app/.env (FINNHUB_API_KEY) — tier free
- Solo US stocks per quote real-time, search funziona globalmente
