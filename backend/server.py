"""Strategic Markets backend — AI proxy + Auth (Emergent Google + JWT email/password)."""
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Literal, Optional
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
import uuid
import logging
import httpx
import jwt as pyjwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')
JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me-in-production-' + uuid.uuid4().hex)
JWT_ALG = "HS256"
COOKIE_NAME = "session_token"
SESSION_TTL_DAYS = 7

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("strategic-markets")

# Mongo
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
users_col = db.users
sessions_col = db.user_sessions

# Passwords
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="Strategic Markets Backend")
api = APIRouter(prefix="/api")


# ── Auth models ─────────────────────────────────────────────────────────
class UserOut(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    provider: str


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class SessionExchangeIn(BaseModel):
    session_id: str


async def _issue_session(user_id: str, response: Response, provider: str) -> str:
    token = f"tk_{uuid.uuid4().hex}{uuid.uuid4().hex[:8]}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)
    await sessions_col.insert_one({
        "session_token": token,
        "user_id": user_id,
        "provider": provider,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    })
    response.set_cookie(
        key=COOKIE_NAME, value=token,
        max_age=SESSION_TTL_DAYS * 24 * 3600,
        httponly=True, secure=True, samesite="none", path="/",
    )
    return token


async def _current_user(session_token: Optional[str], authorization: Optional[str]) -> Optional[dict]:
    tok = session_token
    if not tok and authorization and authorization.lower().startswith("bearer "):
        tok = authorization.split(" ", 1)[1].strip()
    if not tok:
        return None
    sess = await sessions_col.find_one({"session_token": tok}, {"_id": 0})
    if not sess:
        return None
    exp = sess.get("expires_at")
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)
    if exp and exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp and exp < datetime.now(timezone.utc):
        await sessions_col.delete_one({"session_token": tok})
        return None
    user = await users_col.find_one({"user_id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
    return user


# ── Emergent Google session exchange ────────────────────────────────────
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
@api.post("/auth/session")
async def emergent_session(body: SessionExchangeIn, response: Response):
    if not body.session_id:
        raise HTTPException(400, "session_id required")
    async with httpx.AsyncClient(timeout=15.0) as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": body.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(401, f"Session invalid ({r.status_code})")
    d = r.json()
    email = (d.get("email") or "").lower().strip()
    if not email:
        raise HTTPException(400, "no email in session data")
    # Upsert user
    existing = await users_col.find_one({"email": email}, {"_id": 0})
    if existing:
        await users_col.update_one({"email": email}, {"$set": {
            "name": d.get("name") or existing.get("name") or email.split("@")[0],
            "picture": d.get("picture") or existing.get("picture"),
            "provider": existing.get("provider", "google"),
        }})
        user_id = existing["user_id"]
    else:
        user_id = f"user_{uuid.uuid4().hex[:16]}"
        await users_col.insert_one({
            "user_id": user_id,
            "email": email,
            "name": d.get("name") or email.split("@")[0],
            "picture": d.get("picture"),
            "provider": "google",
            "created_at": datetime.now(timezone.utc),
        })
    await _issue_session(user_id, response, "google")
    user = await users_col.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    return {"user": user}


# ── JWT email/password ──────────────────────────────────────────────────
@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower().strip()
    if await users_col.find_one({"email": email}):
        raise HTTPException(409, "Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:16]}"
    await users_col.insert_one({
        "user_id": user_id,
        "email": email,
        "name": body.name.strip(),
        "picture": None,
        "provider": "email",
        "password_hash": pwd_ctx.hash(body.password),
        "created_at": datetime.now(timezone.utc),
    })
    await _issue_session(user_id, response, "email")
    user = await users_col.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    return {"user": user}


@api.post("/auth/login")
async def login(body: LoginIn, response: Response):
    email = body.email.lower().strip()
    user = await users_col.find_one({"email": email}, {"_id": 0})
    if not user or not user.get("password_hash"):
        raise HTTPException(401, "Invalid credentials")
    if not pwd_ctx.verify(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    await _issue_session(user["user_id"], response, user.get("provider", "email"))
    out = {k: v for k, v in user.items() if k != "password_hash"}
    return {"user": out}


@api.get("/auth/me")
async def me(session_token: Optional[str] = Cookie(default=None), authorization: Optional[str] = Header(default=None)):
    user = await _current_user(session_token, authorization)
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user


@api.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(default=None)):
    if session_token:
        await sessions_col.delete_one({"session_token": session_token})
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


# ── AI Chat proxy (unchanged) ───────────────────────────────────────────
class ChatMessage(BaseModel):
    role: Literal['user', 'assistant', 'system']
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system: str
    provider: str = 'gemini'
    model: str = 'gemini-2.5-flash'


class ChatResponse(BaseModel):
    reply: str


@api.get('/')
async def root():
    return {'service': 'strategic-markets', 'status': 'online'}


@api.post('/ai/chat', response_model=ChatResponse)
async def ai_chat(req: ChatRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, 'EMERGENT_LLM_KEY not configured')
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    session_id = f'smkt-{uuid.uuid4()}'
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id, system_message=req.system)\
        .with_model(req.provider, req.model)
    history = req.messages[:-1] if req.messages and req.messages[-1].role == 'user' else req.messages
    last = req.messages[-1] if req.messages and req.messages[-1].role == 'user' else None
    for m in history:
        if m.role == 'user':
            try:
                await chat.send_message(UserMessage(text=m.content))
            except Exception:
                pass
    if last is None:
        raise HTTPException(400, 'No user message provided')
    try:
        reply = await chat.send_message(UserMessage(text=last.content))
    except Exception as e:
        logger.exception('LLM error')
        raise HTTPException(502, f'LLM call failed: {e}')
    text = reply if isinstance(reply, str) else getattr(reply, 'content', str(reply))
    return ChatResponse(reply=text)


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[o.strip() for o in os.environ.get('CORS_ORIGINS', '*').split(',')],
    allow_methods=['*'],
    allow_headers=['*'],
)
