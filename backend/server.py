from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Literal
import uuid


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="Moneta AI Backend")
api_router = APIRouter(prefix="/api")


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


@api_router.get('/')
async def root():
    return {'service': 'moneta-ai', 'status': 'online'}


@api_router.post('/ai/chat', response_model=ChatResponse)
async def ai_chat(req: ChatRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail='EMERGENT_LLM_KEY not configured')
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'emergentintegrations not available: {e}')

    session_id = f'moneta-{uuid.uuid4()}'
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=req.system,
    ).with_model(req.provider, req.model)

    # Replay prior turns then send last user message
    history = req.messages[:-1] if req.messages and req.messages[-1].role == 'user' else req.messages
    last_user = req.messages[-1] if req.messages and req.messages[-1].role == 'user' else None

    for m in history:
        if m.role == 'user':
            try:
                await chat.send_message(UserMessage(text=m.content))
            except Exception:
                pass

    if last_user is None:
        raise HTTPException(status_code=400, detail='No user message provided')

    try:
        reply = await chat.send_message(UserMessage(text=last_user.content))
    except Exception as e:
        logger.exception('LLM error')
        raise HTTPException(status_code=502, detail=f'LLM call failed: {e}')

    text = reply if isinstance(reply, str) else getattr(reply, 'content', str(reply))
    return ChatResponse(reply=text)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=['*'],
    allow_headers=['*'],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
