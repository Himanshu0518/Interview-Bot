from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables at startup
load_dotenv()

# Validate all required environment variables
from validate_env import validate_env_vars
validate_env_vars()

from routers.bot import bot_router
from routers.main_router import main_router
from routers.auth import auth_router
from routers.mock import mock_router
from routers.dashboard import dashboard_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://interview-bot-wine.vercel.app",
        "https://interview-bot-gypk.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    
)

app.include_router(bot_router)
app.include_router(main_router)
app.include_router(auth_router)
app.include_router(mock_router)
app.include_router(dashboard_router)

@app.get("/")
def home():
    return {"hello": "world"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
