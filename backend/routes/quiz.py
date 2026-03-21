"""Placeholder for Quiz Routes (Kirtan's responsibility)"""

from fastapi import APIRouter

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.get("/")
async def quiz_placeholder():
    return {"message": "Quiz routes will be implemented by Kirtan"}
