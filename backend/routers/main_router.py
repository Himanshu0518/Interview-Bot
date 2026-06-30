from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, BackgroundTasks,Request
from typing import Annotated, List
from utils.main_utils import parse_resume , get_questions_from_resume 
from models.schemas import ParsedResume, ParsedResumeDB, QuestionRequest, QuestionListResponse, ResumeStatus
from utils.exception import MyException
from utils.logger import logging
import sys
import json
from connections.mongo_client import MongoDBClient
from langchain.schema import AIMessage
from models.auth import TokenData
import re
from datetime import datetime, timezone
from routers.auth import get_current_user
from limiter import limiter

router = APIRouter()
client = MongoDBClient() 

def extract_json_from_text(text: str) -> dict:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON found.")
    try:
        return json.loads(match.group())
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}")
    
async def save_resume_to_db(db_resume_data: ParsedResumeDB, user_id: str):
    """Background task: upsert parsed resume into MongoDB, stamping updated_at."""
    try:
        # Stamp the write time so the client can confirm via polling
        data = db_resume_data.model_dump()
        data["updated_at"] = datetime.now(timezone.utc)

        current_resume = await client.find_one("Resume", {"user_id": user_id})
        if current_resume:
            await client.update_one("Resume", {"user_id": user_id}, data)
        else:
            await client.insert_one("Resume", data)
        logging.info(f"Resume saved to DB for user_id: {user_id}")
    except Exception as e:
        logging.exception(f"Background task failed to save resume for user_id: {user_id}")
        raise MyException(e, sys)


@router.post("/upload_resume", response_model=ParsedResume)
@limiter.limit("5/minute")
async def upload_resume(
    token_data: Annotated[TokenData, Depends(get_current_user)],
    background_tasks: BackgroundTasks,
    request: Request,
    file: UploadFile = File(...),
):
    """Upload and parse resume with file validation"""

    # Validate file type
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Invalid File Type",
                "message": "Only PDF and DOCX files are allowed.",
                "code": 2001
            }
        )

    # Validate file size (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "File Too Large",
                "message": "File size must not exceed 10MB.",
                "code": 2002
            }
        )

    # Reset file pointer so parse_resume can read from the beginning
    await file.seek(0)

    # Parse the resume (async — calls AI model)
    try:
        result = await parse_resume(file, ParsedResume)
    except Exception as e:
        raise MyException(e, sys)

    extracted_info = result.model_dump()

    # Build DB model and dispatch save as a background task
    db_resume_data = ParsedResumeDB(
        **extracted_info,
        username=token_data.username,
        user_id=token_data.user_id
    )
    background_tasks.add_task(save_resume_to_db, db_resume_data, token_data.user_id)

    # Return immediately without waiting for DB write
    return ParsedResume(**extracted_info)


@router.get("/resume_status", response_model=ResumeStatus)
@limiter.limit("20/minute")
async def get_resume_status(request: Request, token_data: Annotated[TokenData, Depends(get_current_user)]):
    """
    Lightweight endpoint for the client to poll after upload.
    Returns whether a resume exists and when it was last written by the background task.
    The client compares updated_at against its local uploadStartTime to confirm the write.
    """
    try:
        resume = await client.find_one("Resume", {"user_id": token_data.user_id})
    except Exception as e:
        raise MyException(e, sys)

    if not resume:
        return ResumeStatus(synced=False, updated_at=None)

    return ResumeStatus(synced=True, updated_at=resume.get("updated_at"))


@router.get("/get_resume", response_model=ParsedResume)
@limiter.limit("10/minute")
async def get_resume(request:Request,token_data:Annotated[TokenData, Depends(get_current_user)]):
    try:
        resume_data = await client.find_one("Resume", {"user_id": token_data.user_id})
    except Exception as e:
        raise MyException(e, sys)

    return ParsedResume(**resume_data)



@router.post("/get_questions",response_model=QuestionListResponse)
@limiter.limit("5/minute")
async def get_questions(request:Request,token_data:Annotated[TokenData, Depends(get_current_user)] , question_query: QuestionRequest):
    username = token_data.username
    user_id = token_data.user_id
    input_data = question_query.model_dump()
    try:
        resume_data = await client.find_one("Resume", {"user_id": user_id})
    except Exception as e:
        raise MyException(e, sys)
    
    try:
        resume_text = ParsedResume(**resume_data)
        input_data["resume_text"] = resume_text.model_dump()
        questions = await get_questions_from_resume(QuestionListResponse, input_data)
    except Exception as e:
        raise MyException(e, sys)
    
    if isinstance(questions, AIMessage):
        extracted_info = extract_json_from_text(questions.content)
    else:
        logging.info("Parsed resume dict directly received.")
        extracted_info = questions
    
   
    logging.info(
        f"Questions generated successfully from AI for username: {username} and user_id: {user_id}"
    )
#  print(extracted_info)
    return extracted_info

@router.post("/resume_data", response_model=ParsedResume)
@limiter.limit("5/minute")
async def post_resume_data(request:Request, resume_data: ParsedResume, token_data: Annotated[TokenData, Depends(get_current_user)]):
    db_resume_data = ParsedResumeDB(**resume_data.model_dump(), username=token_data.username, user_id=token_data.user_id)
    try:
      
      current_resume = await client.find_one("Resume", {"user_id": token_data.user_id})
    except Exception as e:
        raise MyException(e, sys)

    if current_resume:
        try:
            await client.update_one("Resume", {"user_id": token_data.user_id}, db_resume_data.model_dump())
        except Exception as e:
            raise MyException(e, sys)
    else:
        try:
            await client.insert_one("Resume", db_resume_data.model_dump())
        except Exception as e:
            raise MyException(e, sys)
    
    return resume_data

