from fastapi import APIRouter, Depends , File, UploadFile
from typing import Annotated, List
from utils.main_utils import parse_resume , get_questions_from_resume 
from models.schemas import ParsedResume,QuestionListResponse,ParsedResumeDB,QuestionRequest
from utils.exception import MyException
from utils.logger import logging
import sys
import json
from connections.mongo_client import MongoDBClient
from langchain.schema import AIMessage
from models.auth import TokenData
import re 
from routers.auth import get_current_user

main_router = APIRouter()
client = MongoDBClient() 

def extract_json_from_text(text: str) -> dict:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON found.")
    try:
        return json.loads(match.group())
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}")
    
@main_router.post("/upload_resume", response_model=ParsedResume)
async def upload_resume(token_data:Annotated[TokenData, Depends(get_current_user)],file: UploadFile = File(...)):
    
    try:
        result = await parse_resume(file)
    except Exception as e:
        raise MyException(e, sys)

    if isinstance(result, AIMessage):
        extracted_info = extract_json_from_text(result.content)
    else:
        logging.info("Parsed resume dict directly received.")
        extracted_info = result

    db_resume_data = ParsedResumeDB(**extracted_info, username=token_data.username)
    current_resume = await client.find_one("Resume", {"username": token_data.username})
    if current_resume:
        try:
            await client.update_one("Resume", {"username": token_data.username}, db_resume_data.model_dump())
        except Exception as e:
            raise MyException(e, sys)
        
    else:  
        try:
            await client.insert_one("Resume", db_resume_data.model_dump())
        except Exception as e:
            raise MyException(e, sys)
    
    return ParsedResume(**extracted_info)


@main_router.get("/get_resume", response_model=ParsedResume)
async def get_resume(token_data:Annotated[TokenData, Depends(get_current_user)]):
    try:
        resume_data = await client.find_one("Resume", {"username": token_data.username})
    except Exception as e:
        raise MyException(e, sys)

    return ParsedResume(**resume_data)


@main_router.post("/get_questions")
async def get_questions(token_data:Annotated[TokenData, Depends(get_current_user)] , question_query: QuestionRequest):
    username = token_data.username
    input_data = question_query.model_dump()
    try:
        resume_data = await client.find_one("Resume", {"username": username})
    except Exception as e:
        raise MyException(e, sys)
    
    try:
        if "_id" in resume_data:
            resume_data.pop("_id")

        questions = await get_questions_from_resume(resume_data, input_data["num_questions"], input_data["difficulty_level"])
    except Exception as e:
        raise MyException(e, sys)
    
    if isinstance(questions, AIMessage):
        extracted_info = extract_json_from_text(questions.content)
    else:
        logging.info("Parsed resume dict directly received.")
        extracted_info = questions
    
   
    logging.info(len(extracted_info["questions"]),"Questions generated successfully from AI")
    return extracted_info

@main_router.post("/resume_data", response_model=ParsedResume)
async def post_resume_data(resume_data: List[ParsedResumeDB] , token_data:Annotated[TokenData, Depends(get_current_user)]):
    db_resume_data = ParsedResumeDB(**resume_data, username=token_data.username)
    try:
      
      current_resume = await client.find_one("Resume", {"username": token_data.username})
    except Exception as e:
        raise MyException(e, sys)

    if current_resume:
        try:
            await client.update_one("Resume", {"username": token_data.username}, db_resume_data.model_dump())
        except Exception as e:
            raise MyException(e, sys)
    else:
        try:
            await client.insert_one("Resume", db_resume_data.model_dump())
        except Exception as e:
            raise MyException(e, sys)
    
    return ParsedResume(**resume_data)

