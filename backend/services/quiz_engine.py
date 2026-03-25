from fastapi import HTTPException
from supabase_client import supabase
from services.claude_service import claude_service


class QuizEngine:

    def _fetch_notes_text(self, subject_id: str, max_chars: int) -> str:
        res = supabase.table("notes").select("raw_text").eq("subject_id", subject_id).execute()
        if not res.data:
            raise HTTPException(
                status_code=404,
                detail="No notes found for this subject. Please upload notes first."
            )
        combined = " ".join(row["raw_text"] for row in res.data if row.get("raw_text"))
        return combined[:max_chars] if len(combined) > max_chars else combined

    def generate_and_save_quiz(self, user_id: str, subject_id: str, difficulty: str = "medium") -> dict:
        combined = self._fetch_notes_text(subject_id, max_chars=4000)

        questions = claude_service.generate_quiz(user_id, combined, difficulty)

        session_res = supabase.table("quiz_sessions").insert(
            {"subject_id": subject_id, "score": 0, "total": 10, "difficulty": difficulty}
        ).execute()
        if not session_res.data:
            raise HTTPException(status_code=500, detail="Failed to create quiz session.")
        session_id = session_res.data[0]["id"]

        rows = [
            {
                "session_id": session_id,
                "question_text": q["question"],
                "option_a": q["option_a"],
                "option_b": q["option_b"],
                "option_c": q["option_c"],
                "option_d": q["option_d"],
                "correct_option": q["correct_option"].strip().lower(),
                "explanation": q["explanation"],
                "user_answer": None,
                "is_correct": False,
            }
            for q in questions
        ]
        q_res = supabase.table("questions").insert(rows).execute()
        if not q_res.data:
            raise HTTPException(status_code=500, detail="Failed to save questions.")

        safe_questions = [
            {
                "id": row["id"],
                "question_text": row["question_text"],
                "option_a": row["option_a"],
                "option_b": row["option_b"],
                "option_c": row["option_c"],
                "option_d": row["option_d"],
            }
            for row in q_res.data
        ]
        return {"session_id": session_id, "difficulty": difficulty, "questions": safe_questions}

    def evaluate_quiz(self, session_id: str, answers: list) -> dict:
        q_res = supabase.table("questions").select("*").eq("session_id", session_id).execute()
        if not q_res.data:
            raise HTTPException(status_code=404, detail="Quiz session not found.")

        questions_map = {q["id"]: q for q in q_res.data}
        score = 0
        results = []

        for answer in answers:
            qid = answer["question_id"]
            user_ans = answer["user_answer"].strip().lower()
            question = questions_map.get(qid)
            if not question:
                continue
            is_correct = user_ans == question["correct_option"].strip().lower()
            if is_correct:
                score += 1
            supabase.table("questions").update(
                {"user_answer": user_ans, "is_correct": is_correct}
            ).eq("id", qid).execute()
            results.append({
                "question_id": qid,
                "question_text": question["question_text"],
                "user_answer": user_ans,
                "correct_option": question["correct_option"],
                "is_correct": is_correct,
                "explanation": question["explanation"],
            })

        supabase.table("quiz_sessions").update(
            {"score": score, "total": 10}
        ).eq("id", session_id).execute()

        return {
            "session_id": session_id,
            "score": score,
            "total": 10,
            "percentage": round(score / 10 * 100, 1),
            "results": results,
        }

    def extract_topics(self, user_id: str, subject_id: str) -> list:
        combined = self._fetch_notes_text(subject_id, max_chars=2000)
        return claude_service.extract_topics(user_id, combined)

    def get_weak_topics(self, user_id: str, subject_id: str) -> list:
        sessions_res = supabase.table("quiz_sessions").select("id").eq("subject_id", subject_id).execute()
        if not sessions_res.data:
            return []

        session_ids = [s["id"] for s in sessions_res.data]
        wrong_questions = []
        for sid in session_ids:
            q_res = (
                supabase.table("questions")
                .select("question_text")
                .eq("session_id", sid)
                .eq("is_correct", False)
                .execute()
            )
            if q_res.data:
                wrong_questions.extend(row["question_text"] for row in q_res.data if row.get("question_text"))

        if not wrong_questions:
            return []

        return claude_service.identify_weak_topics(user_id, wrong_questions)

    def get_session_summary(self, session_id: str) -> dict:
        session_res = supabase.table("quiz_sessions").select("*").eq("id", session_id).execute()
        if not session_res.data:
            raise HTTPException(status_code=404, detail="Quiz session not found.")
        session = session_res.data[0]

        q_res = supabase.table("questions").select("*").eq("session_id", session_id).execute()
        questions = q_res.data or []

        total = session.get("total") or 10
        score = session.get("score") or 0
        percentage = round(score / total * 100, 1)

        if percentage >= 80:
            performance_label = "Excellent"
        elif percentage >= 60:
            performance_label = "Good"
        elif percentage >= 40:
            performance_label = "Needs Improvement"
        else:
            performance_label = "Keep Practicing"

        created_at = session.get("created_at", "")
        time_taken_label = created_at[:10] if created_at else "N/A"

        correct_questions = [q["question_text"] for q in questions if q.get("is_correct")]
        wrong_questions = [
            {
                "question_text": q["question_text"],
                "user_answer": q.get("user_answer"),
                "correct_option": q.get("correct_option"),
                "explanation": q.get("explanation"),
            }
            for q in questions if not q.get("is_correct")
        ]

        return {
            "session_id": session_id,
            "subject_id": session.get("subject_id"),
            "score": score,
            "total": total,
            "percentage": percentage,
            "difficulty": session.get("difficulty", "medium"),
            "created_at": created_at,
            "time_taken_label": time_taken_label,
            "performance_label": performance_label,
            "correct_questions": correct_questions,
            "wrong_questions": wrong_questions,
        }


quiz_engine = QuizEngine()
