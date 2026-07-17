# Auth Testing Playbook (Emergent Google + JWT)
See integration_playbook_expert_v2 response for full testing steps.

## Emergent Google flow
1. Frontend redirects to https://auth.emergentagent.com/?redirect={window.location.origin}/
2. User returns with #session_id={id}
3. Frontend processes hash, POSTs session_id to /api/auth/session
4. Backend validates via https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data
5. Backend upserts user in MongoDB users collection, saves session_token in user_sessions
6. httpOnly cookie set; frontend redirects to /

## JWT email/password flow
- POST /api/auth/register {email, password, name} → sets cookie
- POST /api/auth/login {email, password} → sets cookie
- GET /api/auth/me → returns user (Bearer or cookie)
- POST /api/auth/logout → clears cookie

## MongoDB collections
- users: {user_id, email, name, picture?, password_hash?, provider: "google"|"email", created_at}
- user_sessions: {user_id, session_token, expires_at, created_at}
