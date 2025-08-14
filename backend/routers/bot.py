from fastapi import APIRouter,HTTPException
from utils.main_utils import get_bot_ans
from models.schemas import BotModel

bot_router = APIRouter()
@bot_router.get("/bot" , response_model=BotModel)
async def hello(query: str):
    response = get_bot_ans(query)
    return BotModel(query=response.content)
