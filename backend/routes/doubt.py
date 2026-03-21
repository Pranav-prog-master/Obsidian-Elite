"""Placeholder for Doubt Routes (Kirtan's responsibility)"""

from fastapi import APIRouter

router = APIRouter(prefix="/doubt", tags=["doubt"])


@router.get("/")
async def doubt_placeholder():
    return {"message": "Doubt routes will be implemented by Kirtan"}
