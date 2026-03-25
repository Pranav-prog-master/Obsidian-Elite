# Run this SQL in Supabase SQL editor if the interactions table does not exist:
#
# CREATE TABLE IF NOT EXISTS interactions (
#   id uuid default gen_random_uuid() primary key,
#   user_id uuid references profiles(id) on delete cascade,
#   subject_id uuid references subjects(id) on delete cascade,
#   interaction_type text not null,
#   input_text text,
#   output_text text,
#   created_at timestamp with time zone default now()
# );

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase_client import supabase
from services.claude_service import claude_service
from utils.auth_dependency import get_current_user

router = APIRouter(prefix="/doubt", tags=["Doubt"])


class AskDoubtRequest(BaseModel):
    subject_id: str
    question: str


@router.post("/ask", summary="Ask a doubt and get an AI-powered answer")
def ask_doubt(body: AskDoubtRequest, current_user: dict = Depends(get_current_user)):
    question = body.question.strip()
    if len(question) < 5:
        raise HTTPException(
            status_code=400,
            detail="Please enter a proper question of at least 5 characters."
        )
    if len(question) > 500:
        raise HTTPException(
            status_code=400,
            detail="Question is too long. Please keep it under 500 characters."
        )

    answer = claude_service.solve_doubt(user_id=current_user["user_id"], question=question)

    supabase.table("interactions").insert({
        "user_id": current_user["user_id"],
        "subject_id": body.subject_id,
        "interaction_type": "doubt",
        "input_text": question,
        "output_text": answer,
    }).execute()

    return {"question": question, "answer": answer}


@router.get("/history/{subject_id}", summary="Get past doubt Q&A history for a subject")
def get_doubt_history(subject_id: str, current_user: dict = Depends(get_current_user)):
    res = (
        supabase.table("interactions")
        .select("id, input_text, output_text, created_at")
        .eq("subject_id", subject_id)
        .eq("interaction_type", "doubt")
        .eq("user_id", current_user["user_id"])
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []
