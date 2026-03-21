"""Performance Tracking & Analytics Routes"""

from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from pydantic import BaseModel
from database import get_db
from models.quiz import QuizSession, Question
from models.notes import Subject

router = APIRouter(prefix="/performance", tags=["performance"])


# Pydantic models for responses
class QuizScoreResponse(BaseModel):
    session_id: str
    date: str
    score: int
    total: int
    percentage: float


class WeakTopicResponse(BaseModel):
    topic: str
    failure_rate: float
    total_attempts: int


class PerformanceSummaryResponse(BaseModel):
    subject_id: str
    subject_name: str
    quiz_history: List[QuizScoreResponse]
    weak_topics: List[WeakTopicResponse]
    average_percentage: float


def get_current_user_id() -> str:
    """Placeholder - replace with actual JWT auth dependency"""
    return "current-user-id"


@router.get("/summary/{subject_id}", response_model=PerformanceSummaryResponse)
async def get_performance_summary(
    subject_id: str,
    session: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get performance summary for a specific subject including:
    - Quiz history (scores over time)
    - Weak topics (where student scored < 50%)
    - Average performance percentage
    """

    # Verify subject belongs to user
    subject_query = select(Subject).where(
        Subject.id == UUID(subject_id),
        Subject.user_id == UUID(user_id)
    )
    subject_result = await session.execute(subject_query)
    subject = subject_result.scalar_one_or_none()

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Get all quiz sessions for this subject
    sessions_query = select(QuizSession).where(
        QuizSession.subject_id == UUID(subject_id)
    ).order_by(QuizSession.created_at.asc())

    sessions_result = await session.execute(sessions_query)
    sessions = sessions_result.scalars().all()

    # Build quiz history
    quiz_history = []
    total_percentage = 0
    for quiz in sessions:
        percentage = (quiz.score / quiz.total * 100) if quiz.total > 0 else 0
        total_percentage += percentage
        quiz_history.append(
            QuizScoreResponse(
                session_id=str(quiz.id),
                date=quiz.created_at.isoformat(),
                score=quiz.score,
                total=quiz.total,
                percentage=round(percentage, 2)
            )
        )

    average_percentage = (total_percentage / len(quiz_history)) if quiz_history else 0

    # Identify weak topics (score < 50% per topic)
    weak_topics = []
    if quiz_history:
        # Get questions for all sessions for this subject
        query = select(
            Question.topic,
            func.count(Question.id).label("total"),
            func.sum(func.cast(Question.is_correct, type_=int)).label("correct")
        ).join(
            QuizSession, Question.session_id == QuizSession.id
        ).where(
            QuizSession.subject_id == UUID(subject_id),
            Question.topic.isnot(None)
        ).group_by(
            Question.topic
        )

        result = await session.execute(query)
        rows = result.fetchall()

        for topic_row in rows:
            topic, total, correct = topic_row
            correct = correct or 0
            failure_rate = ((total - correct) / total * 100) if total > 0 else 0

            if failure_rate > 50:  # More than 50% failure rate = weak topic
                weak_topics.append(
                    WeakTopicResponse(
                        topic=topic,
                        failure_rate=round(failure_rate, 2),
                        total_attempts=total
                    )
                )

    # Sort weak topics by failure rate (highest first)
    weak_topics.sort(key=lambda x: x.failure_rate, reverse=True)

    return PerformanceSummaryResponse(
        subject_id=subject_id,
        subject_name=subject.name,
        quiz_history=quiz_history,
        weak_topics=weak_topics,
        average_percentage=round(average_percentage, 2)
    )


@router.get("/all")
async def get_all_performance_summaries(
    session: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get performance summaries for all user's subjects"""

    # Get all subjects for user
    subjects_query = select(Subject).where(Subject.user_id == UUID(user_id))
    subjects_result = await session.execute(subjects_query)
    subjects = subjects_result.scalars().all()

    performance_list = []
    for subject in subjects:
        # Get quiz sessions for this subject
        sessions_query = select(QuizSession).where(
            QuizSession.subject_id == subject.id
        ).order_by(QuizSession.created_at.asc())

        sessions_result = await session.execute(sessions_query)
        sessions = sessions_result.scalars().all()

        if not sessions:
            continue  # Skip subjects with no quiz history

        # Build quiz history
        quiz_history = []
        total_percentage = 0
        for quiz in sessions:
            percentage = (quiz.score / quiz.total * 100) if quiz.total > 0 else 0
            total_percentage += percentage
            quiz_history.append(
                QuizScoreResponse(
                    session_id=str(quiz.id),
                    date=quiz.created_at.isoformat(),
                    score=quiz.score,
                    total=quiz.total,
                    percentage=round(percentage, 2)
                )
            )

        average_percentage = (total_percentage / len(quiz_history)) if quiz_history else 0

        # Identify weak topics
        weak_topics = []
        query = select(
            Question.topic,
            func.count(Question.id).label("total"),
            func.sum(func.cast(Question.is_correct, type_=int)).label("correct")
        ).join(
            QuizSession, Question.session_id == QuizSession.id
        ).where(
            QuizSession.subject_id == subject.id,
            Question.topic.isnot(None)
        ).group_by(
            Question.topic
        )

        result = await session.execute(query)
        rows = result.fetchall()

        for topic_row in rows:
            topic, total, correct = topic_row
            correct = correct or 0
            failure_rate = ((total - correct) / total * 100) if total > 0 else 0

            if failure_rate > 50:
                weak_topics.append(
                    WeakTopicResponse(
                        topic=topic,
                        failure_rate=round(failure_rate, 2),
                        total_attempts=total
                    )
                )

        weak_topics.sort(key=lambda x: x.failure_rate, reverse=True)

        performance_list.append(
            PerformanceSummaryResponse(
                subject_id=str(subject.id),
                subject_name=subject.name,
                quiz_history=quiz_history,
                weak_topics=weak_topics,
                average_percentage=round(average_percentage, 2)
            )
        )

    return performance_list


@router.get("/trends/{subject_id}")
async def get_performance_trends(
    subject_id: str,
    session: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get detailed trend data for charting:
    Returns list of quiz attempts with dates and scores for line chart visualization
    """

    # Verify subject belongs to user
    subject_query = select(Subject).where(
        Subject.id == UUID(subject_id),
        Subject.user_id == UUID(user_id)
    )
    subject_result = await session.execute(subject_query)
    subject = subject_result.scalar_one_or_none()

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Get all quiz sessions
    sessions_query = select(QuizSession).where(
        QuizSession.subject_id == UUID(subject_id)
    ).order_by(QuizSession.created_at.asc())

    sessions_result = await session.execute(sessions_query)
    sessions = sessions_result.scalars().all()

    trends = {
        "dates": [],
        "scores": [],
        "percentages": []
    }

    for quiz in sessions:
        percentage = (quiz.score / quiz.total * 100) if quiz.total > 0 else 0
        trends["dates"].append(quiz.created_at.strftime("%Y-%m-%d"))
        trends["scores"].append(quiz.score)
        trends["percentages"].append(round(percentage, 2))

    return trends
