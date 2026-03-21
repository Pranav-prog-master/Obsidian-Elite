"""Placeholder for Explain Routes (Kirtan's responsibility)"""

from fastapi import APIRouter

router = APIRouter(prefix="/explain", tags=["explain"])


@router.get("/")
async def explain_placeholder():
    return {"message": "Explain routes will be implemented by Kirtan"}
