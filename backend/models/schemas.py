from pydantic import BaseModel, EmailStr, Field 
from typing import List, Dict,Annotated, Optional

class ParsedResume(BaseModel):
    name: Annotated[str, ...] = "Unknown"
    linkedin_url: Annotated[str, ...] = ""
    skills: Annotated[List[str], ...] = []
    experience: Annotated[int|None, ...] = None
    education: Annotated[List[str], ...] = []
    projects: Annotated[List[Dict[str, str]], ...] = []
    required_roles: Annotated[List[str], ...] = []
    github_url: Annotated[str, ...] = ""
    email: Annotated[EmailStr|None, ...] = None

class ParsedResumeDB(ParsedResume):
    username: Annotated[str, ...]

class SingleQues(BaseModel):
    question: str
    options: List[str]
    correct_option: int
    explanation: str

class QuestionListResponse(BaseModel):
    questions: List[SingleQues]
    
class QuestionRequest(BaseModel):
    num_questions : Annotated[int, Field(default=10 , description="Number of questions" , ge=1 , le=50)]
    difficulty_level : Annotated[str|None, Field(default="Medium" , description="Difficulty level" )]

class BotModel(BaseModel):
    query: str