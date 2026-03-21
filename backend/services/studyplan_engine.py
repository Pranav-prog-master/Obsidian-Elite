"""Study Plan Generation Engine using Claude AI"""

import json
from datetime import datetime, timedelta
from anthropic import Anthropic
from utils.prompt_templates import STUDY_PLAN_GENERATION_PROMPT


class StudyPlanEngine:
    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-20250514"

    async def generate_plan(
        self,
        subjects: list[str],
        exam_date: str,
        weak_topics: list[str],
        daily_hours: int = 6
    ) -> list[dict]:
        """
        Generate a personalized day-by-day study plan.
        
        Args:
            subjects: List of subject names to study
            exam_date: Target exam date in YYYY-MM-DD format
            weak_topics: List of topics where student performed poorly
            daily_hours: Available study hours per day (default 6)
            
        Returns:
            List of study plan items with date, subject, topic, duration, task_type
        """
        
        today_date = datetime.now().strftime("%Y-%m-%d")
        
        # Format weak topics for prompt
        weak_topics_str = ", ".join(weak_topics) if weak_topics else "None identified"
        subjects_str = ", ".join(subjects) if subjects else "General Topics"
        
        prompt = STUDY_PLAN_GENERATION_PROMPT.format(
            today_date=today_date,
            exam_date=exam_date,
            daily_hours=daily_hours,
            subjects=subjects_str,
            weak_topics=weak_topics_str
        )

        message = self.client.messages.create(
            model=self.model,
            max_tokens=4000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        response_text = message.content[0].text.strip()

        # Parse JSON response - handle markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        plan_data = json.loads(response_text)
        
        # Validate and structure the plan
        validated_plan = []
        for item in plan_data:
            if all(k in item for k in ["date", "subject", "topic", "duration_minutes", "task_type"]):
                validated_plan.append({
                    "date": item["date"],
                    "subject": item["subject"],
                    "topic": item["topic"],
                    "duration_minutes": item["duration_minutes"],
                    "task_type": item["task_type"]
                })
        
        return validated_plan


# Standalone function for easy use
async def generate_study_plan(
    api_key: str,
    subjects: list[str],
    exam_date: str,
    weak_topics: list[str],
    daily_hours: int = 6
) -> list[dict]:
    """Generate study plan"""
    engine = StudyPlanEngine(api_key)
    return await engine.generate_plan(subjects, exam_date, weak_topics, daily_hours)
