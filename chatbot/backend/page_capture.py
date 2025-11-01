"""
API endpoint to capture current page content from the browser
This should be called from the frontend to send the current page content
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict

router = APIRouter()

# Store the latest page content (in-memory for now)
current_page_content = {
    "question": None,
    "options": [],
    "page_type": None,
    "full_html": None,
    "all_questions": [],  # Store ALL questions
    "timestamp": None
}

class PageContentUpdate(BaseModel):
    question: Optional[str] = None
    options: Optional[list] = []
    page_type: Optional[str] = None
    full_text: Optional[str] = None
    url: Optional[str] = None
    all_questions: Optional[List[Dict]] = []  # Add all questions

@router.post("/update-page-content")
async def update_page_content(content: PageContentUpdate):
    """Receive current page content from frontend"""
    global current_page_content
    
    from datetime import datetime
    current_page_content = {
        "question": content.question,
        "options": content.options or [],
        "page_type": content.page_type,
        "full_text": content.full_text,
        "url": content.url,
        "all_questions": content.all_questions or [],  # Store all questions
        "timestamp": datetime.now().isoformat()
    }
    
    return {"status": "success", "message": "Page content updated"}

@router.get("/get-page-content")
async def get_page_content():
    """Get the latest page content"""
    return current_page_content

def get_current_page_data():
    """Helper function to get current page content"""
    return current_page_content
