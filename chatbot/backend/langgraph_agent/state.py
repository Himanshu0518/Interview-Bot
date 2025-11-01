from typing import TypedDict, Literal, List, Optional
from datetime import datetime

class InterviewParams(TypedDict, total=False):
    """Interview setup parameters"""
    interview_type: str  # Technical, Behavioral, etc.
    role: str  # Job role/position
    difficulty: str  # Easy, Medium, Hard
    num_questions: int
    target_companies: str
    job_description: str
    interview_format: str  # MCQ or Mock

class ChatMessage(TypedDict):
    """Single chat message"""
    role: str  # "user", "assistant", or "system"
    content: str
    timestamp: str

class ChatState(TypedDict, total=False):
    """Main state for the chatbot conversation"""
    messages: List[ChatMessage]
    mode: str  # "normal", "setup", "help", or "idle"
    interview_params: InterviewParams
    _temp_params: InterviewParams  # Temporary storage during setup
    in_interview: bool
    current_question: Optional[str]
    user_id: str
    session_id: str
    setup_step: Optional[str]  # Which parameter we're collecting
    awaiting_confirmation: bool
    all_questions: Optional[List[dict]]  # All questions from current page
    current_page_question: Optional[str]  # Current page question
    current_page_options: Optional[List[str]]  # Current page options
    current_page_type: Optional[str]  # MCQ or Mock
