from fastapi import APIRouter, HTTPException
from utils.main_utils import get_bot_ans
from models.schemas import BotModel
from utils.logger import logging

bot_router = APIRouter()

@bot_router.get("/bot", response_model=BotModel)
async def hello(query: str):
    logging.info(f"User query: {query}")
    response = await get_bot_ans(query)
    if response is None:
        raise HTTPException(status_code=503, detail="All LLM providers are unavailable. Please try again later.")
    logging.info(f"Bot response: {response}")
    return BotModel(query=response)
