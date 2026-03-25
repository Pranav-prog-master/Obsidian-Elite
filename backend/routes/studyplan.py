from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from supabase_client import supabase
from services.claude_service import claude_service
from utils.auth_dependency import get_current_user

router = APIRouter(prefix="/studyplan", tags=["Study Plan"])


class StudyPlanRequest(BaseModel):
    exam_date: str
    daily_hours: int = 6


@router.post("/generate", summary="Generate a personalized study plan")
def generate_study_plan(body: StudyPlanRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]

    subjects_res = supabase.table("subjects").select("name").eq("user_id", user_id).execute()
    if not subjects_res.data:
        raise HTTPException(status_code=400, detail="No subjects found. Create a subject first.")

    subjects = [s["name"] for s in subjects_res.data]

    sessions_res = supabase.table("quiz_sessions").select("id").execute()
    session_ids = [s["id"] for s in (sessions_res.data or [])]

    wrong_questions = []
    for sid in session_ids:
        q_res = supabase.table("questions").select("question_text").eq("session_id", sid).eq("is_correct", False).execute()
        if q_res.data:
            wrong_questions.extend(q["question_text"] for q in q_res.data if q.get("question_text"))

    weak_topics = claude_service.detect_weak_topics(user_id, wrong_questions) if wrong_questions else []

    plan_items = claude_service.generate_study_plan(
        user_id=user_id,
        subjects=subjects,
        exam_date=body.exam_date,
        weak_topics=weak_topics,
        daily_hours=body.daily_hours,
    )

    return {
        "exam_date": body.exam_date,
        "subjects": subjects,
        "weak_topics": weak_topics,
        "plan_items": plan_items,
        "total_days": len(set(item.get("date") for item in plan_items)),
    }


@router.get("/list/all", summary="List all study plans for current user")
def list_study_plans(current_user: dict = Depends(get_current_user)):
    return {"message": "Study plans are generated on demand. Use POST /studyplan/generate to create one."}
