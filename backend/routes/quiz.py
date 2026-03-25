# Run this SQL in Supabase SQL editor to add the difficulty column:
#
# ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS difficulty text default 'medium';

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from supabase_client import supabase
from services.quiz_engine import quiz_engine
from utils.auth_dependency import get_current_user

router = APIRouter(prefix="/quiz", tags=["Quiz"])

VALID_DIFFICULTIES = {"easy", "medium", "hard"}


class GenerateQuizRequest(BaseModel):
    subject_id: str
    difficulty: Optional[str] = "medium"


class AnswerItem(BaseModel):
    question_id: str
    user_answer: str


class SubmitQuizRequest(BaseModel):
    session_id: str
    answers: List[AnswerItem]


@router.post("/generate", summary="Generate a quiz from uploaded notes")
def generate_quiz(body: GenerateQuizRequest, current_user: dict = Depends(get_current_user)):
    difficulty = (body.difficulty or "medium").lower()
    if difficulty not in VALID_DIFFICULTIES:
        raise HTTPException(status_code=400, detail="Difficulty must be easy, medium, or hard.")
    return quiz_engine.generate_and_save_quiz(
        user_id=current_user["user_id"],
        subject_id=body.subject_id,
        difficulty=difficulty,
    )


@router.post("/submit", summary="Submit quiz answers and get scored results")
def submit_quiz(body: SubmitQuizRequest, current_user: dict = Depends(get_current_user)):
    answers = [a.model_dump() for a in body.answers]
    return quiz_engine.evaluate_quiz(body.session_id, answers)


@router.get("/sessions/{subject_id}", summary="Get all past quiz sessions for a subject")
def get_sessions(subject_id: str, current_user: dict = Depends(get_current_user)):
    res = (
        supabase.table("quiz_sessions")
        .select("*")
        .eq("subject_id", subject_id)
        .order("created_at", desc=True)
        .execute()
    )
    sessions = []
    for s in (res.data or []):
        total = s.get("total") or 10
        sessions.append({
            "id": s["id"],
            "score": s["score"],
            "total": total,
            "percentage": round(s["score"] / total * 100, 1),
            "difficulty": s.get("difficulty", "medium"),
            "created_at": s["created_at"],
        })
    return sessions


@router.get("/topics/{subject_id}", summary="Extract main topics from uploaded notes")
def get_topics(subject_id: str, current_user: dict = Depends(get_current_user)):
    topics = quiz_engine.extract_topics(
        user_id=current_user["user_id"],
        subject_id=subject_id,
    )
    return {"subject_id": subject_id, "topics": topics}


@router.get("/weak-topics/{subject_id}", summary="Identify weak topics based on past quiz performance")
def get_weak_topics(subject_id: str, current_user: dict = Depends(get_current_user)):
    weak_topics = quiz_engine.get_weak_topics(
        user_id=current_user["user_id"],
        subject_id=subject_id,
    )
    return {"subject_id": subject_id, "weak_topics": weak_topics}


@router.get("/session/{session_id}/summary", summary="Get a detailed summary of a completed quiz session")
def get_session_summary(session_id: str, current_user: dict = Depends(get_current_user)):
    return quiz_engine.get_session_summary(session_id)
