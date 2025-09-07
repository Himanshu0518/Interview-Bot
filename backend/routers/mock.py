from fastapi import APIRouter, Depends 
from typing import Annotated, List
from models.schemas import ParsedResume,MockQuestionRequest,MockResponse,RatingRequest,RatingResponse
from utils.exception import MyException
from utils.logger import logging
import sys
import json
from connections.mongo_client import MongoDBClient
from utils.main_utils import get_mock_questions, get_mock_rating
from models.auth import TokenData
import re 
from routers.auth import get_current_user


main_router = APIRouter()
client = MongoDBClient() 

mock_router = APIRouter(
    prefix="/mock",
    tags=["Mock"]
)


@mock_router.post("/get_questions", response_model=MockResponse)
async def get_questions(
    token_data: Annotated[TokenData, Depends(get_current_user)],
    question_query: MockQuestionRequest
):
    user_id = token_data.user_id
    try:
        ResumeDB = await client.find_one("Resume", {"user_id": user_id})
    except Exception as e:
        raise MyException(e, sys)

    resume_text = ParsedResume(**ResumeDB)

    # Add resume_text into request payload
    input_data = question_query.model_dump()
    input_data["resume_text"] = resume_text.model_dump()

    try:
        questions = await get_mock_questions(
            input_data,
            parser=MockResponse
        )
    except Exception as e:
        raise MyException(e, sys)

    return questions

@mock_router.post("/get_rating",response_model=RatingResponse)
async def get_rating(token_data:Annotated[TokenData,Depends(get_current_user)],rating_query:RatingRequest):

    input_data = rating_query.model_dump()
    print(input_data)
    try:
        rating = await get_mock_rating(input_data,parser=RatingResponse)
    except Exception as e:
        raise MyException(e,sys)

    return rating