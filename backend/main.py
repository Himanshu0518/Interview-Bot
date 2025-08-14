from fastapi import FastAPI, HTTPException
from fastapi import FastAPI
from routers.bot import  bot_router
from routers.main_router import main_router
from routers.auth import auth_router

app = FastAPI()

app.include_router(bot_router)
app.include_router(main_router)
app.include_router(auth_router)
@app.get("/")
def home():
    return {"hello": "world"}


