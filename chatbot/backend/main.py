from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import logging
from inspect import iscoroutine
from contextlib import asynccontextmanager

from langgraph_agent.graph import chatbot_graph
from langgraph_agent.state import ChatMessage
from database import chat_db
from page_capture import router as page_capture_router, get_current_page_data

# -------------------------------------
# Logging Setup
# -------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("interview_bot")

# -------------------------------------
# Lifespan Event
# -------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown lifecycle events."""
    try:
        await chat_db.chat_collection.create_index(
            [("user_id", 1), ("session_id", 1), ("timestamp", -1)]
        )
        await chat_db.db["ConversationState"].create_index(
            [("user_id", 1), ("session_id", 1)], unique=True
        )
        logger.info("✅ MongoDB indexes initialized successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to initialize MongoDB indexes: {e}")

    yield
    logger.info("🛑 Shutting down Interview Bot API...")

# -------------------------------------
# FastAPI App Instance
# -------------------------------------
app = FastAPI(title="Interview Bot Chatbot API", lifespan=lifespan)

# -------------------------------------
# CORS Middleware
# -------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000","https://interview-bot-wine.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include page capture router
app.include_router(page_capture_router)

# -------------------------------------
# Pydantic Models
# -------------------------------------
class ChatRequest(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    message: str
    in_interview: bool = False
    current_question: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: str
    messages: List[ChatMessage]
    interview_params: Optional[dict] = None
    should_launch_interview: bool = False


class SessionInfo(BaseModel):
    session_id: str
    last_message: str
    message_count: int


# -------------------------------------
# Routes
# -------------------------------------
@app.get("/")
async def root():
    return {"message": "Interview Bot Chatbot API", "status": "running"}


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint with input validation"""
    try:
        # Validate message
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if len(request.message) > 2000:
            raise HTTPException(status_code=400, detail="Message too long. Maximum 2000 characters.")
        
        # Sanitize message
        request.message = request.message.strip()

        session_id = request.session_id or str(uuid.uuid4())
        existing_state = await chat_db.get_conversation_state(request.user_id, session_id)

        state = existing_state or {
            "messages": [],
            "mode": "idle",
            "interview_params": {},
            "_temp_params": {},  # Add temp params storage
            "in_interview": request.in_interview,
            "current_question": request.current_question,
            "user_id": request.user_id,
            "session_id": session_id,
            "setup_step": None,
            "awaiting_confirmation": False,
        }

        # Add current page data to state
        page_data = get_current_page_data()
        if page_data and page_data.get("question"):
            state["current_page_question"] = page_data.get("question")
            state["current_page_options"] = page_data.get("options", [])
            state["current_page_type"] = page_data.get("page_type")
        
        # Add all questions from page data if available
        if page_data and page_data.get("all_questions"):
            state["all_questions"] = page_data.get("all_questions")

        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        state["messages"].append(user_message)

        await chat_db.save_message(
            user_id=request.user_id,
            session_id=session_id,
            role="user",
            content=request.message,
        )

        state["in_interview"] = request.in_interview
        state["current_question"] = request.current_question

        result_maybe = chatbot_graph.invoke(state)
        result = await result_maybe if iscoroutine(result_maybe) else result_maybe
        
        # DEBUG: Log the complete result state
        logger.info(f"🔍 Result from graph: mode={result.get('mode')}, setup_step={result.get('setup_step')}")
        logger.info(f"🔍 _temp_params: {result.get('_temp_params', {})}")
        logger.info(f"🔍 interview_params: {result.get('interview_params', {})}")

        for msg in result["messages"]:
            if msg["role"] == "assistant" and msg not in state["messages"]:
                await chat_db.save_message(
                    user_id=request.user_id,
                    session_id=session_id,
                    role="assistant",
                    content=msg["content"],
                )

        await chat_db.save_conversation_state(request.user_id, session_id, result)

        # Improved launch detection - check for complete params
        params = result.get("interview_params", {})
        has_complete_params = all([
            params.get("interview_format"),
            params.get("interview_type"),
            params.get("role"),
            params.get("difficulty"),
            params.get("num_questions")
        ])

        should_launch = (
            has_complete_params
            and result.get("mode") == "idle"
            and not result.get("awaiting_confirmation", False)
        )
        
        logger.info(f"🚀 Launch check - has_complete_params: {has_complete_params}, mode: {result.get('mode')}, should_launch: {should_launch}")
        logger.info(f"📋 Params: {params}")

        return ChatResponse(
            session_id=session_id,
            messages=result["messages"],
            interview_params=result.get("interview_params"),
            should_launch_interview=should_launch,
        )

    except Exception as e:
        logger.exception(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.get("/sessions/{user_id}", response_model=List[SessionInfo])
async def get_user_sessions(user_id: str):
    """Get all chat sessions for a user"""
    try:
        sessions = await chat_db.get_all_sessions(user_id)
        return [
            SessionInfo(
                session_id=session["_id"],
                last_message=session["last_message"],
                message_count=session["message_count"],
            )
            for session in sessions
        ]
    except Exception as e:
        logger.exception(f"Session retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.get("/history/{user_id}/{session_id}")
async def get_session_history(user_id: str, session_id: str, limit: int = 50):
    """Get chat history for a specific session"""
    try:
        history = await chat_db.get_chat_history(user_id, session_id, limit)
        return {"messages": history}
    except Exception as e:
        logger.exception(f"History fetch error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.delete("/session/{user_id}/{session_id}")
async def delete_session(user_id: str, session_id: str):
    """Delete a chat session"""
    try:
        await chat_db.delete_session(user_id, session_id)
        return {"message": "Session deleted successfully"}
    except Exception as e:
        logger.exception(f"Delete session error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/index-website")
async def index_website():
    """Manually trigger website indexing"""
    try:
        from langgraph_agent.knowledge_base import WebsiteKnowledgeBase
        kb = WebsiteKnowledgeBase()
        kb.index_website()
        return {"message": "Website indexed successfully"}
    except Exception as e:
        logger.exception(f"Website indexing error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
