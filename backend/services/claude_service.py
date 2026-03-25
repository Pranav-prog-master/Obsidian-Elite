import os
import json
import time
import datetime
from openai import OpenAI
from fastapi import HTTPException
from dotenv import load_dotenv
from utils.prompt_templates import get_quiz_prompt, get_doubt_prompt, get_explanation_prompt

load_dotenv()

# ── Module-level state ─────────────────────────────────────────────────────

# Rate limiter: {user_id: last_request_unix_timestamp}
user_request_times: dict = {}

# Explanation cache: {"topic_lower_subjectid": explanation_text}
explanation_cache: dict = {}

REQUIRED_QUIZ_KEYS = {"question", "option_a", "option_b", "option_c", "option_d", "correct_option", "explanation"}


class ClaudeService:

    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )
        self.primary_model = os.getenv("AI_MODEL_PRIMARY", "google/gemma-2-9b-it:free")
        self.backup_model  = os.getenv("AI_MODEL_BACKUP",  "mistralai/mistral-7b-instruct:free")
        self.site_url      = os.getenv("APP_SITE_URL",     "http://localhost:5173")
        self.app_title     = os.getenv("APP_TITLE",        "EduMentor AI")

    # ── Private helpers ────────────────────────────────────────────────────

    def _call_openrouter(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        """Try primary model first, fall back to backup on any failure."""
        extra_headers = {
            "HTTP-Referer": self.site_url,
            "X-Title": self.app_title,
        }

        for model in (self.primary_model, self.backup_model):
            try:
                print(f"  [OpenRouter] Calling model: {model}")
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user",   "content": user_prompt},
                    ],
                    max_tokens=max_tokens,
                    temperature=temperature,
                    extra_headers=extra_headers,
                )
                content = response.choices[0].message.content
                if content:
                    return content
                print(f"  [OpenRouter] Empty response from {model}, trying next.")
            except Exception as exc:
                print(f"  [OpenRouter] {model} failed: {exc}")

        raise HTTPException(
            status_code=503,
            detail="AI service temporarily unavailable. Both primary and backup models failed. Please try again in a moment.",
        )

    def _clean_json(self, text: str) -> str:
        """Strip markdown code fences that models sometimes add."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    def _rate_limit_check(self, user_id: str) -> None:
        last = user_request_times.get(user_id)
        if last and (time.time() - last) < 5:
            raise HTTPException(
                status_code=429,
                detail="Please wait a few seconds before making another AI request.",
            )
        user_request_times[user_id] = time.time()

    # ── Public methods ─────────────────────────────────────────────────────

    def generate_quiz(self, user_id: str, notes_text: str, difficulty: str = "medium") -> list:
        self._rate_limit_check(user_id)
        prompts = get_quiz_prompt(notes_text, difficulty)

        for attempt in range(1, 4):
            print(f"  [Quiz] Generation attempt {attempt} of 3...")
            try:
                raw     = self._call_openrouter(prompts["system"], prompts["user"], max_tokens=2000, temperature=0.7)
                cleaned = self._clean_json(raw)
                data    = json.loads(cleaned)

                if not isinstance(data, list):
                    raise ValueError("Response is not a JSON array")
                if len(data) != 10:
                    raise ValueError(f"Expected 10 questions, got {len(data)}")
                for item in data:
                    missing = REQUIRED_QUIZ_KEYS - set(item.keys())
                    if missing:
                        raise ValueError(f"Question missing keys: {missing}")

                return data

            except Exception as exc:
                print(f"  [Quiz] Attempt {attempt} failed: {exc}")
                if attempt < 3:
                    time.sleep(2)

        raise HTTPException(
            status_code=500,
            detail="Quiz generation failed after 3 attempts. The AI returned unexpected format. Please try again.",
        )

    def solve_doubt(self, user_id: str, question: str) -> str:
        question = question.strip()
        if len(question) < 5:
            raise HTTPException(status_code=400, detail="Please enter a question of at least 5 characters.")
        if len(question) > 500:
            raise HTTPException(status_code=400, detail="Question too long. Please keep it under 500 characters.")

        self._rate_limit_check(user_id)
        prompts = get_doubt_prompt(question)

        for attempt in range(1, 4):
            print(f"  [Doubt] Attempt {attempt} of 3...")
            try:
                response = self._call_openrouter(prompts["system"], prompts["user"], max_tokens=600, temperature=0.8)
                if response.strip():
                    return response.strip()
                print(f"  [Doubt] Empty response on attempt {attempt}")
            except HTTPException:
                raise
            except Exception as exc:
                print(f"  [Doubt] Attempt {attempt} failed: {exc}")
            if attempt < 3:
                time.sleep(2)

        raise HTTPException(status_code=503, detail="AI service unavailable. Please try again.")

    def explain_concept(self, user_id: str, topic: str, context: str, subject_id: str) -> str:
        cache_key = f"{topic.lower().strip()}_{subject_id}"
        if cache_key in explanation_cache:
            print(f"  [Explain] Returning cached explanation for topic: {topic}")
            return explanation_cache[cache_key]

        self._rate_limit_check(user_id)
        prompts = get_explanation_prompt(topic, context)

        for attempt in range(1, 4):
            print(f"  [Explain] Attempt {attempt} of 3...")
            try:
                response = self._call_openrouter(prompts["system"], prompts["user"], max_tokens=1000, temperature=0.7)
                if response.strip():
                    explanation_cache[cache_key] = response.strip()
                    return explanation_cache[cache_key]
                print(f"  [Explain] Empty response on attempt {attempt}")
            except HTTPException:
                raise
            except Exception as exc:
                print(f"  [Explain] Attempt {attempt} failed: {exc}")
            if attempt < 3:
                time.sleep(2)

        raise HTTPException(status_code=503, detail="AI service unavailable. Please try again.")

    def extract_topics(self, user_id: str, notes_text: str) -> list:
        self._rate_limit_check(user_id)
        notes_text = notes_text[:2000]

        system_prompt = (
            "You are a study assistant. You only return valid JSON arrays of strings and absolutely nothing else. "
            "No explanation, no markdown, no code fences."
        )
        user_prompt = (
            "Read these study notes and identify the 8 to 10 main topics or chapter names covered. "
            'Return only a JSON array of strings. Example format: ["Laws of Motion", "Work and Energy"]. '
            f"Notes: {notes_text}"
        )

        for attempt in range(1, 4):
            print(f"  [Topics] Attempt {attempt} of 3...")
            try:
                raw     = self._call_openrouter(system_prompt, user_prompt, max_tokens=300, temperature=0.3)
                cleaned = self._clean_json(raw)
                data    = json.loads(cleaned)
                if isinstance(data, list) and all(isinstance(t, str) for t in data):
                    return data
                raise ValueError("Not a list of strings")
            except Exception as exc:
                print(f"  [Topics] Attempt {attempt} failed: {exc}")
                if attempt < 3:
                    time.sleep(2)

        print("  [Topics] WARNING: Topic extraction failed, returning defaults.")
        return ["Topic 1", "Topic 2", "Topic 3"]

    def detect_weak_topics(self, user_id: str, wrong_questions: list) -> list:
        if not wrong_questions:
            return []

        self._rate_limit_check(user_id)
        wrong_text = "\n".join(wrong_questions)[:2000]

        system_prompt = (
            "You are a student performance analyzer. Return only valid JSON arrays of strings. No other text."
        )
        user_prompt = (
            "A student answered these questions incorrectly in their exams. "
            "Identify 3 to 5 weak topic areas they need to study more. "
            "Return only a JSON array of topic name strings. "
            f"Wrong questions: {wrong_text}"
        )

        for attempt in range(1, 4):
            print(f"  [WeakTopics] Attempt {attempt} of 3...")
            try:
                raw     = self._call_openrouter(system_prompt, user_prompt, max_tokens=200, temperature=0.3)
                cleaned = self._clean_json(raw)
                data    = json.loads(cleaned)
                if isinstance(data, list):
                    return data
                raise ValueError("Not a list")
            except Exception as exc:
                print(f"  [WeakTopics] Attempt {attempt} failed: {exc}")
                if attempt < 3:
                    time.sleep(2)

        print("  [WeakTopics] WARNING: Weak topic detection failed.")
        return []

    def generate_study_plan(
        self,
        user_id: str,
        subjects: list,
        exam_date: str,
        weak_topics: list,
        daily_hours: int,
    ) -> list:
        self._rate_limit_check(user_id)

        today        = datetime.date.today().strftime("%Y-%m-%d")
        subjects_text = ", ".join(subjects) if subjects else "General Studies"
        weak_text     = ", ".join(weak_topics) if weak_topics else "none identified yet"

        system_prompt = (
            "You are an expert study planner for Indian competitive exams like JEE, NEET, and UPSC. "
            "Return only valid JSON arrays. No other text."
        )
        user_prompt = (
            f"Create a day by day study plan from {today} to {exam_date}. "
            f"Subjects to cover: {subjects_text}. "
            f"Weak topics that need extra time: {weak_text}. "
            f"Student can study {daily_hours} hours per day. "
            "Return a JSON array where each item has exactly these keys: "
            "date (YYYY-MM-DD format), subject (string), topic (string), "
            "duration_minutes (number), task_type (one of: read, practice, revise). "
            "Allocate at least 40 percent of time to weak topics. "
            "Keep the plan realistic and balanced."
        )

        for attempt in range(1, 4):
            print(f"  [StudyPlan] Attempt {attempt} of 3...")
            try:
                raw     = self._call_openrouter(system_prompt, user_prompt, max_tokens=3000, temperature=0.5)
                cleaned = self._clean_json(raw)
                data    = json.loads(cleaned)
                if isinstance(data, list) and len(data) > 0:
                    return data
                raise ValueError("Empty or invalid plan returned")
            except Exception as exc:
                print(f"  [StudyPlan] Attempt {attempt} failed: {exc}")
                if attempt < 3:
                    time.sleep(2)

        raise HTTPException(
            status_code=500,
            detail="Study plan generation failed. Please try again.",
        )

    # ── Alias kept for backward compatibility with quiz_engine.py ──────────
    def identify_weak_topics(self, user_id: str, wrong_questions: list) -> list:
        return self.detect_weak_topics(user_id, wrong_questions)


claude_service = ClaudeService()
