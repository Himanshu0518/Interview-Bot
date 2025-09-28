from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
import os, sys
from fastapi import HTTPException
from langchain.prompts import PromptTemplate
from connections.model_connection import GenerativeAIModel
from utils.promts import parse_resume_prompt, questions_prompt, mock_question_prompt, rating_prompt
from utils.exception import MyException
from utils.logger import logging
from langchain.output_parsers import PydanticOutputParser
import json

# --------- Resume Parsing ---------
model = GenerativeAIModel()

async def parse_resume(file, parser):
    """Extract text from resume and parse into structured JSON."""
    parser = PydanticOutputParser(pydantic_object=parser)

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
   # prompt = PromptTemplate.from_template(parse_resume_prompt)
    prompt = PromptTemplate(
        template = parse_resume_prompt ,
        input_variables=["resume_text"],
        partial_variables = {"format_instructions": parser.get_format_instructions()}
    )
    
    chain = prompt | model.model | parser
    # Call AI model
    try:
        response = await chain.ainvoke({"resume_text": resume_text}) # async safe
    except Exception as e:
        logging.exception("Error generating AI response for resume parsing")
        raise MyException(e, sys)

    logging.info("Resume parsed successfully")
    return response


async def get_questions_from_resume(parser, input_data: dict):
    """Generate interview questions with answers from resume info."""
    parser = PydanticOutputParser(pydantic_object=parser)

    prompt = PromptTemplate(
        template=questions_prompt,
        input_variables=["resume_text", "num_questions", "difficulty_level", "interview_type", "interview_description","target_companies"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    chain = prompt | model.model | parser
    response = await chain.ainvoke(input_data)
    
    logging.info("Questions generated successfully from AI")

    return response


def get_bot_ans(question: str):
    """Return the answer given by the bot for a question."""
    try:
     response = model.get_general_query(question)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return response

async def get_mock_questions( input_data: dict,parser=None):
    """Generate interview questions with answers from resume info."""
    parser = PydanticOutputParser(pydantic_object=parser)
    prompt = PromptTemplate(
        template = mock_question_prompt,
        input_variables=["resume_text", "num_questions", "difficulty_level", "interview_type", "job_description"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    
    
    chain = prompt | model.model | parser
    response = await chain.ainvoke(input_data)
    return response

   
async def get_mock_rating(input_data:dict,parser):
    parser = PydanticOutputParser(pydantic_object=parser)
    prompt = PromptTemplate(
        template = rating_prompt,
        input_variables=["question","expected_answer","user_answer"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    
    chain = prompt | model.model | parser
    response = await chain.ainvoke(input_data)
    return response