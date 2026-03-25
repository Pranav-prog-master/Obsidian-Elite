from fastapi import APIRouter, Depends
from pydantic import BaseModel
from supabase_client import supabase
from services.claude_service import claude_service
from utils.auth_dependency import get_current_user

router = APIRouter(prefix="/explain", tags=["Explain"])


class ExplainRequest(BaseModel):
    subject_id: str
    topic_name: str


@router.post("/topic", summary="Get a structured AI explanation of a topic using your notes")
def explain_topic(body: ExplainRequest, current_user: dict = Depends(get_current_user)):
    res = supabase.table("notes").select("raw_text").eq("subject_id", body.subject_id).execute()
    context = " ".join(row["raw_text"] for row in (res.data or []) if row.get("raw_text"))
    if len(context) > 3000:
        context = context[:3000]

    explanation = claude_service.explain_concept(
        user_id=current_user["user_id"],
        topic=body.topic_name,
        context=context,
        subject_id=body.subject_id,
    )

    supabase.table("interactions").insert({
        "user_id": current_user["user_id"],
        "subject_id": body.subject_id,
        "interaction_type": "explanation",
        "input_text": body.topic_name,
        "output_text": explanation,
    }).execute()

    return {"topic": body.topic_name, "explanation": explanation}


@router.get("/history/{subject_id}", summary="Get past concept explanation history for a subject")
def get_explain_history(subject_id: str, current_user: dict = Depends(get_current_user)):
    res = (
        supabase.table("interactions")
        .select("id, input_text, output_text, created_at")
        .eq("subject_id", subject_id)
        .eq("interaction_type", "explanation")
        .eq("user_id", current_user["user_id"])
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []
