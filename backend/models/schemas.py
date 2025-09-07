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
    user_id: Annotated[str, ...]

class SingleQues(BaseModel):
    question: str
    options: List[str]
    correct_option: int
    explanation: str

class QuestionListResponse(BaseModel):
    questions: List[SingleQues]
    
class QuestionRequstBase(BaseModel):
    num_questions: Annotated[
        int, 
        Field(default=10, ge=1, le=50, description="Number of questions to generate (1–50)")
    ]
    difficulty_level: Annotated[
        str, 
        Field(default="Medium", description="Difficulty level: Easy, Medium, or Hard")
    ]
    interview_type: Annotated[
        str, 
        Field(default="Technical", description="Type of interview: Technical, Behavioral, Case Study, Coding")
    ]

class QuestionRequest(QuestionRequstBase):

    target_companies: Annotated[
        str, 
        Field(default="FAANG,Goldman Sachs,Uber", description="Target companies for tailoring questions")
    ]
    interview_description: Annotated[
        str, 
        Field(default="Software Engineer", description="Job role/title or description")
    ]
   
    
class BotModel(BaseModel):
    query: str

class MockQuestion(BaseModel):
    question: str
    expected_answer: str

class MockResponse(BaseModel):
    questions: List[MockQuestion]

class MockQuestionRequest(QuestionRequstBase):
    job_description: Annotated[
        str, 
        Field(default="Software Engineer", description="Job role/title or description")
    ]

class RatingRequest(BaseModel):
    question : str
    expected_answer: str
    user_answer: str
    

class RatingResponse(BaseModel):
    rating: Annotated[float, Field(ge=0, le=5)]
    better_answer: Annotated[str, Field(description="Suggested better answer user could give as per user answer,expected answer and question")]
    feedback: Annotated[str, Field(description="Suggested feedback for user,key areas of improvements and suggestions and point out mistakes")]
