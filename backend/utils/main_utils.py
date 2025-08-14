from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
import os, sys
from fastapi import HTTPException
from langchain.prompts import PromptTemplate
from connections.model_connection import GenerativeAIModel
from utils.promts import parse_resume_prompt, questions_promt
from utils.exception import MyException
from utils.logger import logging
import json

# --------- Resume Parsing ---------
model = GenerativeAIModel()

async def parse_resume(file):
    """Extract text from resume and parse into structured JSON."""
    ext = file.filename.split(".")[-1].lower()
    temp_path = f"temp_resume.{ext}"

    # Save uploaded file temporarily
    with open(temp_path, "wb") as f:
        f.write(file.file.read())

    # Choose loader based on extension
    if ext == "pdf":
        loader = PyPDFLoader(temp_path)
    elif ext in ["docx", "doc"]:
        loader = Docx2txtLoader(temp_path)
    elif ext == "txt":
        loader = TextLoader(temp_path)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    # Read and join text from file
    try:
        documents = loader.load()
        resume_text = "\n".join([doc.page_content for doc in documents])
    except Exception as e:
        logging.exception("Error loading document")
        raise MyException(e, sys)

    # Create prompt
    prompt = PromptTemplate.from_template(parse_resume_prompt)
    final_prompt = prompt.format(resume_text=resume_text)

    # Call AI model
    try:
        response = await model.get_response(final_prompt)  # async safe
    except Exception as e:
        logging.exception("Error generating AI response for resume parsing")
        raise MyException(e, sys)

    logging.info("Resume parsed successfully")
    return response


async def get_questions_from_resume(extracted_info, num_questions,difficulty_level):
    """Generate interview questions with answers from resume info."""
    prompt = PromptTemplate.from_template(questions_promt)

    final_prompt = prompt.format(resume_text=json.dumps(extracted_info), num_questions=num_questions, difficulty_level=difficulty_level)
    response =  await model.get_response(final_prompt)
    logging.info("Questions generated successfully from AI")

    return response


def get_bot_ans(question: str):
    """Return the answer given by the bot for a question."""
    try:
     response = model.get_general_query(question)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return response

