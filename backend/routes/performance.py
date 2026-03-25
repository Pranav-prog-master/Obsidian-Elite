from fastapi import APIRouter, HTTPException, Depends
from supabase_client import supabase
from utils.auth_dependency import get_current_user

router = APIRouter(prefix="/performance", tags=["Performance"])


@router.get("/summary/{subject_id}", summary="Get performance summary for a subject")
def get_performance_summary(subject_id: str, current_user: dict = Depends(get_current_user)):
    subject_res = supabase.table("subjects").select("id, name").eq("id", subject_id).eq("user_id", current_user["user_id"]).execute()
    if not subject_res.data:
        raise HTTPException(status_code=404, detail="Subject not found.")

    subject_name = subject_res.data[0]["name"]

    sessions_res = supabase.table("quiz_sessions").select("*").eq("subject_id", subject_id).order("created_at").execute()
    sessions = sessions_res.data or []

    quiz_history = []
    total_pct = 0
    for s in sessions:
        total = s.get("total") or 10
        score = s.get("score") or 0
        pct = round(score / total * 100, 2)
        total_pct += pct
        quiz_history.append({
            "session_id": s["id"],
            "date": s["created_at"],
            "score": score,
            "total": total,
            "percentage": pct,
            "difficulty": s.get("difficulty", "medium"),
        })

    avg_pct = round(total_pct / len(quiz_history), 2) if quiz_history else 0

    weak_topics = []
    for s in sessions:
        q_res = supabase.table("questions").select("question_text, is_correct").eq("session_id", s["id"]).execute()
        for q in (q_res.data or []):
            if not q.get("is_correct"):
                weak_topics.append(q.get("question_text", ""))

    return {
        "subject_id": subject_id,
        "subject_name": subject_name,
        "quiz_history": quiz_history,
        "average_percentage": avg_pct,
        "total_quizzes": len(quiz_history),
        "wrong_answers_count": len(weak_topics),
    }


@router.get("/all", summary="Get performance summary for all subjects")
def get_all_performance(current_user: dict = Depends(get_current_user)):
    subjects_res = supabase.table("subjects").select("id, name").eq("user_id", current_user["user_id"]).execute()
    subjects = subjects_res.data or []

    result = []
    for subject in subjects:
        sessions_res = supabase.table("quiz_sessions").select("score, total, created_at").eq("subject_id", subject["id"]).execute()
        sessions = sessions_res.data or []
        if not sessions:
            continue
        total_pct = sum(round((s.get("score", 0) / (s.get("total") or 10)) * 100, 2) for s in sessions)
        avg_pct = round(total_pct / len(sessions), 2)
        result.append({
            "subject_id": subject["id"],
            "subject_name": subject["name"],
            "total_quizzes": len(sessions),
            "average_percentage": avg_pct,
        })

    return result


@router.get("/trends/{subject_id}", summary="Get quiz score trends for charting")
def get_trends(subject_id: str, current_user: dict = Depends(get_current_user)):
    subject_res = supabase.table("subjects").select("id").eq("id", subject_id).eq("user_id", current_user["user_id"]).execute()
    if not subject_res.data:
        raise HTTPException(status_code=404, detail="Subject not found.")

    sessions_res = supabase.table("quiz_sessions").select("score, total, created_at").eq("subject_id", subject_id).order("created_at").execute()
    sessions = sessions_res.data or []

    return {
        "dates":       [s["created_at"][:10] for s in sessions],
        "scores":      [s.get("score", 0) for s in sessions],
        "percentages": [round((s.get("score", 0) / (s.get("total") or 10)) * 100, 2) for s in sessions],
    }
