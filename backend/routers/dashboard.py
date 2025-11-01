# Dashboard Router - Test History & Report Generation (AUTH PROTECTED)
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import Optional, Annotated
from models.schemas import TestResultCreate
from connections.mongo_client import MongoDBClient
from datetime import datetime
from bson import ObjectId
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from routers.auth import get_current_user
from models.auth import TokenData
import io

dashboard_router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

client = MongoDBClient()


# ---------------------------
# SAVE TEST RESULT (PROTECTED)
# ---------------------------
@dashboard_router.post("/save_test", status_code=201)
async def save_test_result(
    test_data: TestResultCreate,
    token_data: Annotated[TokenData, Depends(get_current_user)]
):
    """Save test result to database"""
    try:
        test_result = {
            "user_id": token_data.user_id,
            "interview_type": test_data.interview_type,
            "difficulty_level": test_data.difficulty_level,
            "total_questions": test_data.total_questions,
            "questions_answered": len(test_data.questions_data),
            "average_rating": test_data.average_rating,
            "questions_data": [q.model_dump() for q in test_data.questions_data],
            "created_at": datetime.utcnow(),
        }

        result = await client.insert_one("TestResults", test_result)

        return {
            "success": True,
            "message": "Test result saved successfully",
            "test_id": str(result)
        }

    except Exception as e:
        print(f"Error saving test: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save test result: {str(e)}")


# ---------------------------
# TEST HISTORY (PROTECTED)
# ---------------------------
@dashboard_router.get("/history")
async def get_test_history(
    token_data: Annotated[TokenData, Depends(get_current_user)]
):
    """Get user's test history"""
    try:
        query = {"user_id": token_data.user_id}

        tests = await client.find_many("TestResults", query)
        tests = sorted(tests, key=lambda x: x.get("created_at", datetime.min), reverse=True)

        for test in tests:
            test["_id"] = str(test["_id"])
            if test.get("created_at"):
                test["created_at"] = test["created_at"].isoformat()

        return {"tests": tests, "count": len(tests)}

    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch test history: {str(e)}")


# ---------------------------
# TEST DETAILS (PROTECTED)
# ---------------------------
@dashboard_router.get("/test/{test_id}")
async def get_test_detail(
    test_id: str,
    token_data: Annotated[TokenData, Depends(get_current_user)]
):
    """Get specific test details"""
    try:
        test = await client.find_one("TestResults", {"_id": ObjectId(test_id)})

        if not test:
            raise HTTPException(status_code=404, detail="Test not found")

        if test.get("user_id") != token_data.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this test")

        test["_id"] = str(test["_id"])
        if test.get("created_at"):
            test["created_at"] = test["created_at"].isoformat()

        return test

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching test detail: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch test details: {str(e)}")


# ---------------------------
# DASHBOARD STATS (PROTECTED)
# ---------------------------
@dashboard_router.get("/stats")
async def get_dashboard_stats(
    token_data: Annotated[TokenData, Depends(get_current_user)]
):
    """Get overall user statistics"""
    try:
        query = {"user_id": token_data.user_id}

        tests = await client.find_many("TestResults", query)
        if not tests:
            return {
                "total_tests": 0,
                "total_questions_answered": 0,
                "overall_average_rating": 0,
                "best_performance": None,
                "recent_test_date": None
            }

        total_tests = len(tests)
        total_questions = sum(t.get("questions_answered", 0) for t in tests)
        test_averages = [t["average_rating"] for t in tests if t.get("average_rating")]
        overall_avg = sum(test_averages) / len(test_averages) if test_averages else 0
        best_test = max(tests, key=lambda t: t.get("average_rating", 0))
        recent_date = max(t.get("created_at") for t in tests if t.get("created_at"))

        return {
            "total_tests": total_tests,
            "total_questions_answered": total_questions,
            "overall_average_rating": round(overall_avg, 2),
            "best_performance": {
                "test_id": str(best_test["_id"]),
                "rating": best_test.get("average_rating", 0),
                "date": best_test.get("created_at").isoformat() if best_test.get("created_at") else None
            },
            "recent_test_date": recent_date.isoformat() if recent_date else None
        }

    except Exception as e:
        print(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


# ---------------------------
# DOWNLOAD REPORT (PROTECTED)
# ---------------------------
@dashboard_router.get("/download_report/{test_id}")
async def download_report(
    test_id: str,
    token_data: Annotated[TokenData, Depends(get_current_user)]
):
    """Generate and download PDF report for a specific test"""
    try:
        test = await client.find_one("TestResults", {"_id": ObjectId(test_id)})
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")

        if test.get("user_id") != token_data.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this test")

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch, bottomMargin=0.5 * inch)

        story = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER
        )

        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=12,
            spaceBefore=20
        )

        story.append(Paragraph("Interview Performance Report", title_style))
        story.append(Spacer(1, 0.2 * inch))

        test_date = test.get("created_at").strftime("%B %d, %Y at %I:%M %p") if test.get("created_at") else "N/A"
        story.append(Paragraph(f"<b>Test Date:</b> {test_date}", styles['Normal']))
        story.append(Paragraph(f"<b>Interview Type:</b> {test.get('interview_type', 'N/A')}", styles['Normal']))
        story.append(Paragraph(f"<b>Difficulty Level:</b> {test.get('difficulty_level', 'N/A')}", styles['Normal']))
        story.append(Paragraph(f"<b>Total Questions:</b> {test.get('total_questions', 0)}", styles['Normal']))
        story.append(Paragraph(f"<b>Questions Answered:</b> {test.get('questions_answered', 0)}", styles['Normal']))
        story.append(Paragraph(f"<b>Average Rating:</b> {test.get('average_rating', 0):.2f}/5.0", styles['Normal']))
        story.append(Spacer(1, 0.3 * inch))

        story.append(Paragraph("Detailed Question Analysis", heading_style))
        questions_data = test.get("questions_data", [])
        for idx, q_data in enumerate(questions_data, 1):
            story.append(Paragraph(f"<b>Question {idx}:</b>", styles['Heading3']))
            story.append(Paragraph(q_data.get("question", "N/A"), styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))

            story.append(Paragraph("<b>Your Answer:</b>", styles['Heading4']))
            user_ans = q_data.get("user_answer", "Not answered")
            story.append(Paragraph(user_ans[:500] + "..." if len(user_ans) > 500 else user_ans, styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))

            rating = q_data.get("rating", 0)
            color_map = colors.green if rating >= 4 else colors.orange if rating >= 3 else colors.red
            story.append(Paragraph(f"<b>Rating:</b> <font color='{color_map.hexval()}'>{rating}/5.0</font>", styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))

            if q_data.get("feedback"):
                story.append(Paragraph("<b>Feedback:</b>", styles['Heading4']))
                story.append(Paragraph(q_data["feedback"], styles['Normal']))
                story.append(Spacer(1, 0.1 * inch))

            if q_data.get("better_answer"):
                story.append(Paragraph("<b>Suggested Improved Answer:</b>", styles['Heading4']))
                story.append(Paragraph(q_data["better_answer"], styles['Normal']))
                story.append(Spacer(1, 0.2 * inch))

            if idx % 2 == 0 and idx < len(questions_data):
                story.append(PageBreak())

        doc.build(story)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=interview_report_{test_id}.pdf"}
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")
