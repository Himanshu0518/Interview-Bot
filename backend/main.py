from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers.bot import bot_router
from routers.main_router import main_router
from routers.auth import auth_router

app = FastAPI()

# ✅ Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173/", "*"],  # React frontend URL, * for all origins (use specific in prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bot_router)
app.include_router(main_router)
app.include_router(auth_router)

@app.get("/")
def home():
    return {"hello": "world"}
