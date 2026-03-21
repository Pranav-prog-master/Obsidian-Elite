"""Study Plan Routes"""

import os
import json
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from database import get_db
from models.user import User
from models.notes import Subject
from models.quiz import QuizSession, Question
from models.studyplan import StudyPlan
from services.studyplan_engine import StudyPlanEngine

router = APIRouter(prefix="/studyplan", tags=["study-plan"])

# Pydantic models for requests/responses
class StudyPlanRequest(BaseModel):
    exam_date: str  # YYYY-MM-DD format
    daily_hours: int = 6


class StudyPlanItemResponse(BaseModel):
    date: str
    subject: str
    topic: str
    duration_minutes: int
    task_type: str


class StudyPlanResponse(BaseModel):
    id: str
    exam_date: str
    plan_items: list[StudyPlanItemResponse]
    created_at: str


def get_current_user_id() -> str:
    """Placeholder - replace with actual JWT auth dependency"""
    # In production, this would extract user_id from JWT token
    return "current-user-id"


async def identify_weak_topics(session: AsyncSession, user_id: str) -> list[str]:
    """
    Identify topics where student scored below 50% across all quiz sessions.
    """
    query = select(
        Question.topic,
        func.count(Question.id).label("total"),
        func.sum(func.cast(Question.is_correct, type_=int)).label("correct")
    ).join(
        QuizSession, Question.session_id == QuizSession.id
    ).join(
        Subject, QuizSession.subject_id == Subject.id
    ).where(
        Subject.user_id == UUID(user_id),
        Question.topic.isnot(None)
    ).group_by(
        Question.topic
    )

    result = await session.execute(query)
    rows = result.fetchall()

    weak_topics = []
    for topic_row in rows:
        topic, total, correct = topic_row
        correct = correct or 0
        accuracy = (correct / total * 100) if total > 0 else 0
        if accuracy < 50:
            weak_topics.append(topic)

    return weak_topics


@router.post("/generate", response_model=StudyPlanResponse)
async def generate_study_plan(
    request: StudyPlanRequest,
    session: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate a personalized study plan based on:
    - User's subjects
    - Exam date
    - Weak topics (auto-detected from quiz performance)
    - Daily available hours
    """
    
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    # Get user's subjects
    query = select(Subject.name).where(Subject.user_id == UUID(user_id))
    result = await session.execute(query)
    subjects = [row[0] for row in result.fetchall()]

    if not subjects:
        raise HTTPException(status_code=400, detail="User has no subjects created yet")

    # Identify weak topics
    weak_topics = await identify_weak_topics(session, user_id)

    # Generate plan using Claude
    engine = StudyPlanEngine(api_key)
    plan_items = await engine.generate_plan(
        subjects=subjects,
        exam_date=request.exam_date,
        weak_topics=weak_topics,
        daily_hours=request.daily_hours
    )

    # Save plan to database
    study_plan = StudyPlan(
        user_id=UUID(user_id),
        exam_date=request.exam_date,
        plan_data=json.dumps(plan_items)
    )
    session.add(study_plan)
    await session.commit()
    await session.refresh(study_plan)

    return StudyPlanResponse(
        id=str(study_plan.id),
        exam_date=study_plan.exam_date.isoformat(),
        plan_items=[StudyPlanItemResponse(**item) for item in plan_items],
        created_at=study_plan.created_at.isoformat()
    )


@router.get("/{plan_id}", response_model=StudyPlanResponse)
async def get_study_plan(
    plan_id: str,
    session: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Retrieve a previously generated study plan"""
    
    query = select(StudyPlan).where(
        StudyPlan.id == UUID(plan_id),
        StudyPlan.user_id == UUID(user_id)
    )
    result = await session.execute(query)
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")

    plan_items = json.loads(plan.plan_data)

    return StudyPlanResponse(
        id=str(plan.id),
        exam_date=plan.exam_date.isoformat(),
        plan_items=[StudyPlanItemResponse(**item) for item in plan_items],
        created_at=plan.created_at.isoformat()
    )


@router.get("/list/all")
async def list_user_study_plans(
    session: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """List all study plans for current user"""
    
    query = select(StudyPlan).where(
        StudyPlan.user_id == UUID(user_id)
    ).order_by(StudyPlan.created_at.desc())
    
    result = await session.execute(query)
    plans = result.scalars().all()

    return [
        StudyPlanResponse(
            id=str(plan.id),
            exam_date=plan.exam_date.isoformat(),
            plan_items=[StudyPlanItemResponse(**item) for item in json.loads(plan.plan_data)],
            created_at=plan.created_at.isoformat()
        )
        for plan in plans
    ]
